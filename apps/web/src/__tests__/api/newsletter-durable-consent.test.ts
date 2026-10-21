import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * A reader who unsubscribed must not stay subscribed because Resend failed
 * while the repair ran. The failed repair is persisted as its own work item
 * and the cron retries it until the contact converges on unsubscribed.
 */

const fake = vi.hoisted(() => ({
  contacts: new Map<string, { unsubscribed: boolean }>(),
  gate: null as null | Promise<void>,
  onUpdateStarted: null as null | (() => void),
  /** While true, every write of unsubscribed:true fails (Resend is down). */
  failUnsubscribeWrites: false,
  updates: [] as Array<{ email: string; unsubscribed?: boolean }>,
  event: null as unknown,
  kv: new Map<string, string>(),
  hashes: new Map<string, Map<string, string>>(),
}));

vi.mock("resend", () => ({
  Resend: class {
    webhooks = { verify: () => fake.event };
    contacts = {
      async create(payload: { email: string; unsubscribed?: boolean }) {
        if (fake.contacts.has(payload.email)) {
          return { error: { message: "already exists", statusCode: 409 } };
        }
        fake.contacts.set(payload.email, {
          unsubscribed: payload.unsubscribed ?? false,
        });
        return { error: null };
      },
      async update(payload: { email: string; unsubscribed?: boolean }) {
        fake.updates.push(payload);
        if (payload.unsubscribed === true && fake.failUnsubscribeWrites) {
          return { error: { message: "down", statusCode: 500 } };
        }
        if (payload.unsubscribed === false && fake.gate) {
          const gate = fake.gate;
          fake.gate = null;
          fake.onUpdateStarted?.();
          await gate;
        }
        const contact = fake.contacts.get(payload.email);
        if (contact && payload.unsubscribed !== undefined) {
          contact.unsubscribed = payload.unsubscribed;
        }
        return { error: null };
      },
      async get({ email }: { email: string }) {
        const contact = fake.contacts.get(email);
        return contact
          ? { error: null, data: contact }
          : { error: { message: "not found", statusCode: 404 }, data: null };
      },
      segments: {
        async add() {
          return { error: null };
        },
      },
    };
    emails = { send: async () => ({ error: null }) };
  },
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow() {
      return {};
    }
    async limit() {
      return { success: true };
    }
  },
}));

vi.mock("@upstash/redis", () => ({
  Redis: class {
    async set(
      key: string,
      value: string,
      opts: { nx?: boolean; ex?: number },
    ) {
      await Promise.resolve();
      if (opts.nx && fake.kv.has(key)) return null;
      fake.kv.set(key, value);
      return "OK";
    }
    async get(key: string) {
      return fake.kv.get(key) ?? null;
    }
    async hgetall(key: string) {
      const hash = fake.hashes.get(key);
      return hash && hash.size > 0 ? Object.fromEntries(hash) : null;
    }
    async expire() {
      return 1;
    }
    async eval(script: string, keys: string[], args: string[]) {
      await Promise.resolve();
      if (script.includes('"hdel"')) {
        const hash = fake.hashes.get(keys[0]!);
        if (hash?.get(args[0]!) !== args[1]) return 0;
        hash.delete(args[0]!);
        return 1;
      }
      if (script.includes('"hset"')) {
        const hash = fake.hashes.get(keys[0]!) ?? new Map<string, string>();
        hash.set(args[0]!, args[1]!);
        fake.hashes.set(keys[0]!, hash);
        return 1;
      }
      if (script.includes("tonumber(cur)")) {
        const cur = fake.kv.get(keys[0]!);
        if (cur === undefined || Number(cur) < Number(args[0])) {
          fake.kv.set(keys[0]!, args[0]!);
        }
        return 1;
      }
      if (keys.length === 2) {
        if (fake.kv.get(keys[0]!) !== args[0]) return 0;
        const unsub = fake.kv.get(keys[1]!);
        if (unsub !== undefined && Number(unsub) >= Number(args[1])) return 2;
        return 1;
      }
      if (fake.kv.get(keys[0]!) !== args[0]) return 0;
      fake.kv.set(keys[0]!, args[1]!);
      return 1;
    }
  },
}));

import { GET as REPAIR_CRON } from "@/app/api/cron/newsletter-consent-repair/route";
import { POST as CONFIRM } from "@/app/api/newsletter/confirm/route";
import { POST as WEBHOOK } from "@/app/api/newsletter/webhook/route";
import { createConfirmToken } from "@/lib/newsletter-token";

const ORIGINAL_ENV = { ...process.env };
const EMAIL = "reader@example.com";
const REPAIR_HASH = "mythos:newsletter:consent-repair";
const T0 = Date.UTC(2026, 9, 20, 12, 0, 0);

function post(path: string, body: unknown, extra: Record<string, string> = {}) {
  return new Request(`http://localhost:3000${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "http://localhost:3000",
      host: "localhost:3000",
      "x-real-ip": "10.0.0.1",
      ...extra,
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

function webhookRequest(): NextRequest {
  return new Request("http://localhost:3000/api/newsletter/webhook", {
    method: "POST",
    headers: {
      "svix-id": "msg_1",
      "svix-timestamp": "1",
      "svix-signature": "v1,abc",
    },
    body: "{}",
  }) as unknown as NextRequest;
}

function cronRequest(): Request {
  return new Request("http://localhost:3000/api/cron/newsletter-consent-repair", {
    headers: { authorization: "Bearer cron_test" },
  });
}

async function deliverUnsubscribeWebhook(atMs: number) {
  fake.event = {
    type: "contact.updated",
    created_at: new Date(atMs).toISOString(),
    data: { email: EMAIL, unsubscribed: true },
  };
  return WEBHOOK(webhookRequest());
}

function deferred() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

async function startConfirmHeldAtUpdate(token: string) {
  const gate = deferred();
  const started = deferred();
  fake.gate = gate.promise;
  fake.onUpdateStarted = started.release;
  const response = CONFIRM(post("/api/newsletter/confirm", { token }));
  await started.promise;
  return { gate, response };
}

const pendingRepairs = () => fake.hashes.get(REPAIR_HASH)?.size ?? 0;
const contactUnsubscribed = () => fake.contacts.get(EMAIL)?.unsubscribed;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  process.env.RESEND_API_KEY = "re_test";
  process.env.NEWSLETTER_FROM = "Mythos <digest@example.com>";
  process.env.RESEND_WEBHOOK_SECRET = "whsec_test";
  process.env.CRON_SECRET = "cron_test";
  process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "token";
  fake.contacts.clear();
  fake.contacts.set(EMAIL, { unsubscribed: true });
  fake.gate = null;
  fake.onUpdateStarted = null;
  fake.failUnsubscribeWrites = false;
  fake.updates.length = 0;
  fake.event = null;
  fake.kv.clear();
  fake.hashes.clear();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(T0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
});

describe("a failed consent repair is persisted and retried by cron", () => {
  it("converges to unsubscribed once Resend recovers", async () => {
    const token = createConfirmToken(EMAIL, "re_test", new Date(T0));
    const { gate, response } = await startConfirmHeldAtUpdate(token);

    // The reader leaves mid-update and the webhook runs while the contact
    // already reads unsubscribed: nothing to repair, 200, never delivered again.
    fake.contacts.set(EMAIL, { unsubscribed: true });
    vi.setSystemTime(T0 + 5_000);
    expect((await deliverUnsubscribeWebhook(T0 + 5_000)).status).toBe(200);

    // The update then commits over the unsubscribe, and Resend is down for
    // every repair attempt.
    fake.failUnsubscribeWrites = true;
    gate.release();
    expect((await response).status).toBe(502);
    expect(contactUnsubscribed()).toBe(false);
    expect(pendingRepairs()).toBe(1);

    // Cron while Resend is still down: stays pending, run reports failure.
    const stillDown = await REPAIR_CRON(cronRequest());
    expect(stillDown.status).toBe(502);
    expect(pendingRepairs()).toBe(1);

    // Resend recovers; the cron repairs and clears the record.
    fake.failUnsubscribeWrites = false;
    const recovered = await REPAIR_CRON(cronRequest());
    expect(recovered.status).toBe(200);
    expect(contactUnsubscribed()).toBe(true);
    expect(pendingRepairs()).toBe(0);

    // Idempotent: another run reads "already unsubscribed" and writes nothing.
    const writes = fake.updates.length;
    expect((await REPAIR_CRON(cronRequest())).status).toBe(200);
    expect(fake.updates.length).toBe(writes);
  });

  it("does not undo a newer deliberate re-subscribe", async () => {
    const token = createConfirmToken(EMAIL, "re_test", new Date(T0));
    const { gate, response } = await startConfirmHeldAtUpdate(token);
    fake.contacts.set(EMAIL, { unsubscribed: true });
    vi.setSystemTime(T0 + 5_000);
    expect((await deliverUnsubscribeWebhook(T0 + 5_000)).status).toBe(200);
    fake.failUnsubscribeWrites = true;
    gate.release();
    await response;
    expect(pendingRepairs()).toBe(1);

    // The reader asks for a fresh link and confirms it after the repair was queued.
    fake.failUnsubscribeWrites = false;
    vi.setSystemTime(T0 + 120_000);
    const fresh = createConfirmToken(EMAIL, "re_test", new Date(T0 + 120_000));
    expect(
      (await CONFIRM(post("/api/newsletter/confirm", { token: fresh }))).status,
    ).toBe(200);
    expect(contactUnsubscribed()).toBe(false);

    expect((await REPAIR_CRON(cronRequest())).status).toBe(200);
    expect(contactUnsubscribed()).toBe(false);
    expect(pendingRepairs()).toBe(0);
  });

  it("rejects a cron call without the shared secret", async () => {
    const res = await REPAIR_CRON(
      new Request("http://localhost:3000/api/cron/newsletter-consent-repair"),
    );
    expect(res.status).toBe(401);
  });
});

describe("the webhook repair path", () => {
  it("answers non-2xx and persists the repair when re-applying fails", async () => {
    const token = createConfirmToken(EMAIL, "re_test", new Date(T0));
    const { gate, response } = await startConfirmHeldAtUpdate(token);
    fake.contacts.set(EMAIL, { unsubscribed: true });
    vi.setSystemTime(T0 + 6_000);
    gate.release();
    expect((await response).status).toBe(200);
    expect(contactUnsubscribed()).toBe(false);

    // The delayed webhook is the only repair, and Resend is down.
    fake.failUnsubscribeWrites = true;
    vi.setSystemTime(T0 + 9_000);
    const hook = await deliverUnsubscribeWebhook(T0 + 5_000);
    expect(hook.status).toBeGreaterThanOrEqual(500);
    expect(pendingRepairs()).toBe(1);

    // Resend stops redelivering eventually; the cron still converges.
    fake.failUnsubscribeWrites = false;
    expect((await REPAIR_CRON(cronRequest())).status).toBe(200);
    expect(contactUnsubscribed()).toBe(true);
    expect(pendingRepairs()).toBe(0);
  });
});
