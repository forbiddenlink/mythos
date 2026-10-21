import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Consent must converge on the reader's latest intent even when an unsubscribe
 * lands while a confirm's Resend update is already in flight. The fake Resend
 * holds that update open on a gate, so the test decides exactly when the
 * unsubscribe, the webhook delivery and the update's commit happen.
 */

interface FakeContact {
  unsubscribed: boolean;
}

const fake = vi.hoisted(() => ({
  contacts: new Map<string, { unsubscribed: boolean }>(),
  /** The next confirm update (unsubscribed:false) waits on this before committing. */
  gate: null as null | Promise<void>,
  onUpdateStarted: null as null | (() => void),
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
      return hash ? Object.fromEntries(hash) : null;
    }
    async expire() {
      return 1;
    }
    async eval(script: string, keys: string[], args: string[]) {
      await Promise.resolve();
      if (script.includes('"del"')) {
        // Consent lock release: compare-and-delete.
        if (fake.kv.get(keys[0]!) !== args[0]) return 0;
        fake.kv.delete(keys[0]!);
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

import { POST as CONFIRM } from "@/app/api/newsletter/confirm/route";
import { POST as WEBHOOK } from "@/app/api/newsletter/webhook/route";
import { recordNewsletterUnsubscribe } from "@/lib/newsletter-redemption";
import { createConfirmToken } from "@/lib/newsletter-token";

const ORIGINAL_ENV = { ...process.env };
const EMAIL = "reader@example.com";
/** A whole second, because tokens carry second-resolution expiry. */
const T0 = Date.UTC(2026, 9, 20, 12, 0, 0);

function confirmRequest(token: string): NextRequest {
  return new Request("http://localhost:3000/api/newsletter/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "http://localhost:3000",
      host: "localhost:3000",
      "x-real-ip": "10.0.0.1",
    },
    body: JSON.stringify({ token }),
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

function unsubscribeEvent(atMs: number, email = EMAIL) {
  return {
    type: "contact.updated",
    created_at: new Date(atMs).toISOString(),
    data: { email, unsubscribed: true },
  };
}

/** The reader clicks unsubscribe on Resend's hosted page. */
function readerUnsubscribesOnResend(email = EMAIL): void {
  fake.contacts.set(email, { unsubscribed: true });
}

async function deliverUnsubscribeWebhook(atMs: number, email = EMAIL) {
  fake.event = unsubscribeEvent(atMs, email);
  return WEBHOOK(webhookRequest());
}

function deferred() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

/** Starts a confirm and resolves once its Resend update is in flight. */
async function startConfirmHeldAtUpdate(token: string) {
  const gate = deferred();
  const started = deferred();
  fake.gate = gate.promise;
  fake.onUpdateStarted = started.release;
  const response = CONFIRM(confirmRequest(token));
  await started.promise;
  return { gate, response };
}

function contact(): FakeContact {
  const found = fake.contacts.get(EMAIL);
  if (!found) throw new Error("contact missing");
  return found;
}

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  process.env.RESEND_API_KEY = "re_test";
  process.env.NEWSLETTER_FROM = "Mythos <digest@example.com>";
  process.env.RESEND_WEBHOOK_SECRET = "whsec_test";
  process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "token";
  fake.contacts.clear();
  fake.contacts.set(EMAIL, { unsubscribed: true }); // step one's state
  fake.gate = null;
  fake.onUpdateStarted = null;
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

describe("an unsubscribe landing mid-update converges on unsubscribed", () => {
  it("repairs from the webhook when the confirm already finished its post-check", async () => {
    const token = createConfirmToken(EMAIL, "re_test", new Date(T0));
    const { gate, response } = await startConfirmHeldAtUpdate(token);

    // The reader leaves while the update is in flight; the update then commits
    // unsubscribed:false over it. The webhook has not arrived yet, so the
    // confirm's own post-check finds nothing.
    readerUnsubscribesOnResend();
    vi.setSystemTime(T0 + 6_000);
    gate.release();
    expect((await response).status).toBe(200);
    expect(contact().unsubscribed).toBe(false);

    // The delayed webhook is the only thing left that can fix it.
    vi.setSystemTime(T0 + 9_000);
    const hook = await deliverUnsubscribeWebhook(T0 + 5_000);
    expect(hook.status).toBe(200);
    expect(contact().unsubscribed).toBe(true);
  });

  it("repairs from the confirm's post-check when the webhook arrived mid-update", async () => {
    const token = createConfirmToken(EMAIL, "re_test", new Date(T0));
    const { gate, response } = await startConfirmHeldAtUpdate(token);

    // The webhook is processed while the update is still in flight. Resend
    // already shows the contact unsubscribed, so there is nothing to repair
    // yet, and this is the only moment the webhook will ever run.
    readerUnsubscribesOnResend();
    vi.setSystemTime(T0 + 5_000);
    // Recorded directly: a real webhook would queue behind the running
    // confirm on the consent lock, which the new lock tests cover. This keeps
    // the confirm's own post-check path exercised.
    await recordNewsletterUnsubscribe(EMAIL, T0 + 5_000);
    expect(fake.updates).toEqual([{ email: EMAIL, unsubscribed: false }]);

    // Then the update commits over the unsubscribe.
    gate.release();
    const confirmed = await response;
    expect(confirmed.status).toBe(409);
    expect(await confirmed.json()).toEqual({
      confirmed: false,
      reason: "superseded",
    });
    expect(contact().unsubscribed).toBe(true);
  });

  it("is idempotent: a redelivered webhook makes no second write", async () => {
    const token = createConfirmToken(EMAIL, "re_test", new Date(T0));
    const { gate, response } = await startConfirmHeldAtUpdate(token);
    readerUnsubscribesOnResend();
    vi.setSystemTime(T0 + 6_000);
    gate.release();
    await response;

    vi.setSystemTime(T0 + 9_000);
    await deliverUnsubscribeWebhook(T0 + 5_000);
    await deliverUnsubscribeWebhook(T0 + 5_000);
    // One confirm write, one repair; the redelivery read "already true".
    expect(fake.updates).toEqual([
      { email: EMAIL, unsubscribed: false },
      { email: EMAIL, unsubscribed: true },
    ]);
  });

  it("does not let a late retry of an old unsubscribe undo a newer subscribe", async () => {
    const first = createConfirmToken(EMAIL, "re_test", new Date(T0));
    expect((await CONFIRM(confirmRequest(first))).status).toBe(200);

    // The reader unsubscribes, then asks for a fresh link and confirms it.
    readerUnsubscribesOnResend();
    vi.setSystemTime(T0 + 60_000);
    const second = createConfirmToken(EMAIL, "re_test", new Date(T0 + 60_000));
    expect((await CONFIRM(confirmRequest(second))).status).toBe(200);
    expect(contact().unsubscribed).toBe(false);

    // Resend redelivers the old event.
    vi.setSystemTime(T0 + 120_000);
    expect((await deliverUnsubscribeWebhook(T0 + 30_000)).status).toBe(200);
    expect(contact().unsubscribed).toBe(false);
  });

  it("leaves a contact alone when no confirm was running around the unsubscribe", async () => {
    expect((await deliverUnsubscribeWebhook(T0)).status).toBe(200);
    expect(fake.updates).toEqual([]);
  });
});
