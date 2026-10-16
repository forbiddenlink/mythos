/**
 * Weekly digest delivery: creates (and, only when switched on, sends) one
 * Resend broadcast per ISO week.
 *
 * The Resend client is injected so tests run against a fake and nothing here
 * can reach the network by accident. Safe by default: a broadcast is created
 * as a DRAFT, and sending needs NEWSLETTER_DIGEST_SEND=true.
 */
import { randomUUID, timingSafeEqual } from "node:crypto";
import { Redis } from "@upstash/redis";
import { DEFAULT_RESEND_SEGMENT_ID } from "@/lib/newsletter";
import {
  buildWeeklyDigest,
  type DigestJourney,
  type DigestStory,
} from "@/lib/newsletter-digest";

interface ResendResponse<T> {
  data: T | null;
  error: { message: string; statusCode?: number | null; name?: string } | null;
}

interface BroadcastListItem {
  id: string;
  name: string;
  status: string;
}

/** The three Resend broadcast calls this job makes (a subset of the SDK). */
export interface BroadcastClient {
  broadcasts: {
    list(options: {
      limit?: number;
      after?: string;
    }): Promise<
      ResendResponse<{ data: BroadcastListItem[]; has_more: boolean }>
    >;
    create(payload: {
      name: string;
      segmentId: string;
      from: string;
      subject: string;
      previewText?: string;
      html: string;
      text: string;
    }): Promise<ResendResponse<{ id: string }>>;
    send(id: string): Promise<ResendResponse<{ id: string }>>;
  };
}

export type DigestRunResult =
  | { status: "no_story" }
  | { status: "busy" }
  | { status: "exists"; id: string; broadcastStatus: string }
  | { status: "drafted"; id: string; name: string }
  | { status: "sent"; id: string; name: string }
  | { status: "error"; step: "lock" | "list" | "create" | "send" };

export function digestBroadcastName(weekKey: string): string {
  return `Weekly myth ${weekKey}`;
}

const LIST_PAGE_SIZE = 100;
const LIST_MAX_PAGES = 5;

async function findBroadcastByName(
  client: BroadcastClient,
  name: string,
): Promise<BroadcastListItem | null | "error"> {
  let after: string | undefined;
  for (let page = 0; page < LIST_MAX_PAGES; page += 1) {
    const res = await client.broadcasts.list({ limit: LIST_PAGE_SIZE, after });
    if (res.error || !res.data) return "error";
    const hit = res.data.data.find((b) => b.name === name);
    if (hit) return hit;
    const last = res.data.data.at(-1);
    if (!res.data.has_more || !last) return null;
    after = last.id;
  }
  return null;
}

export interface DigestLock {
  acquire: (name: string) => Promise<string | null>;
  release: (name: string, token: string) => Promise<void>;
}

/** Shared lease: process-local locks cannot coordinate separate cron instances. */
export function createDigestLock(env: DigestEnv): DigestLock | null {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const redis = new Redis({ url, token });
  const key = (name: string): string => `mythos:newsletter:lease:${name}`;
  return {
    acquire: async (name) => {
      const owner = randomUUID();
      // Longer than a serverless invocation; expires if the process terminates.
      const acquired = await redis.set(key(name), owner, {
        nx: true,
        ex: 1800,
      });
      return acquired === "OK" ? owner : null;
    },
    release: async (name, owner) => {
      // An expired invocation must never release a newer invocation's lease.
      await redis.eval(
        "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
        [key(name)],
        [owner],
      );
    },
  };
}

export interface RunDigestOptions {
  client: BroadcastClient;
  lock: DigestLock;
  stories: readonly DigestStory[];
  journeys: readonly DigestJourney[];
  now: Date;
  segmentId: string;
  from: string;
  /** Send the broadcast after creating it. Off unless explicitly enabled. */
  send: boolean;
}

/**
 * Idempotent per ISO week: a broadcast already named for this week is never
 * created again. An existing DRAFT is sent when sending is on; one that is
 * already queued or sent is left alone.
 */
export async function runWeeklyDigest(
  options: RunDigestOptions,
): Promise<DigestRunResult> {
  const { client, now, send } = options;
  const digest = buildWeeklyDigest(options.stories, options.journeys, now);
  if (!digest) return { status: "no_story" };

  const name = digestBroadcastName(digest.weekKey);
  let owner: string | null;
  try {
    owner = await options.lock.acquire(name);
  } catch {
    return { status: "error", step: "lock" };
  }
  if (!owner) return { status: "busy" };
  try {
    const existing = await findBroadcastByName(client, name);
    if (existing === "error") return { status: "error", step: "list" };

    if (existing) {
      if (send && existing.status === "draft") {
        const sent = await client.broadcasts.send(existing.id);
        return sent.error
          ? { status: "error", step: "send" }
          : { status: "sent", id: existing.id, name };
      }
      return {
        status: "exists",
        id: existing.id,
        broadcastStatus: existing.status,
      };
    }

    const created = await client.broadcasts.create({
      name,
      segmentId: options.segmentId,
      from: options.from,
      subject: digest.subject,
      previewText: digest.previewText,
      html: digest.html,
      text: digest.text,
    });
    if (created.error || !created.data)
      return { status: "error", step: "create" };

    if (!send) return { status: "drafted", id: created.data.id, name };

    const sent = await client.broadcasts.send(created.data.id);
    return sent.error
      ? { status: "error", step: "send" }
      : { status: "sent", id: created.data.id, name };
  } finally {
    try {
      await options.lock.release(name, owner);
    } catch {
      // Retaining the expiring lease is safer than retrying a delivered email.
    }
  }
}

/** Reads CRON_SECRET, RESEND_API_KEY, NEWSLETTER_FROM, RESEND_SEGMENT_ID and
 * NEWSLETTER_DIGEST_SEND. */
export type DigestEnv = Readonly<Record<string, string | undefined>>;

function json(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function bearerMatches(header: string | null, secret: string): boolean {
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export interface DigestRequestDeps {
  env: DigestEnv;
  stories: readonly DigestStory[];
  journeys: readonly DigestJourney[];
  now: Date;
  /** Builds the Resend client from the API key; replaced by a fake in tests. */
  createClient: (apiKey: string) => BroadcastClient;
  createLock: (env: DigestEnv) => DigestLock | null;
}

/**
 * Cron entry point. 501 when the job is not configured, 401 without the
 * shared secret (checked first so an unauthenticated caller learns nothing
 * about configuration), otherwise the weekly run.
 */
export async function handleWeeklyDigestRequest(
  req: Request,
  deps: DigestRequestDeps,
): Promise<Response> {
  const { env } = deps;
  const secret = env.CRON_SECRET?.trim();
  if (secret && !bearerMatches(req.headers.get("authorization"), secret)) {
    return json({ ok: false, reason: "unauthorized" }, 401);
  }

  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.NEWSLETTER_FROM?.trim();
  if (!secret || !apiKey || !from) {
    return json({ ok: false, reason: "not_configured" }, 501);
  }

  const lock = deps.createLock(env);
  if (!lock) return json({ ok: false, reason: "not_configured" }, 501);

  const result = await runWeeklyDigest({
    client: deps.createClient(apiKey),
    lock,
    stories: deps.stories,
    journeys: deps.journeys,
    now: deps.now,
    segmentId: env.RESEND_SEGMENT_ID?.trim() || DEFAULT_RESEND_SEGMENT_ID,
    from,
    send: env.NEWSLETTER_DIGEST_SEND === "true",
  });

  return json(
    { ok: result.status !== "error", ...result },
    result.status === "error" ? 502 : 200,
  );
}
