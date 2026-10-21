import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Consent mutations for one address are serialized by a per-address lock, so
 * a cron repair, a confirmation and an unsubscribe webhook can never
 * interleave. These tests hold one of them open mid-flight and run another
 * against it, and cover what each does when the lock cannot be taken.
 */

const fake = vi.hoisted(() => ({
  contacts: new Map<string, { unsubscribed: boolean }>(),
  /** Holds the next unsubscribed:false update open. */
  gate: null as null | Promise<void>,
  onUpdateStarted: null as null | (() => void),
  /** Holds the next unsubscribed:true update open. */
  unsubGate: null as null | Promise<void>,
  onUnsubUpdateStarted: null as null | (() => void),
  /** Holds the next contacts.get open; the read returns a pre-stall snapshot. */
  getGate: null as null | Promise<void>,
  onGetStarted: null as null | (() => void),
  failUnsubscribeWrites: false,
  /** While true, every write to the consent-repair store fails. */
  failRepairWrites: false,
  segmentAdds: 0,
  /** While true, taking any consent lock fails as if another holder had it. */
  lockContended: false,
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
        if (payload.unsubscribed === true && fake.unsubGate) {
          const gate = fake.unsubGate;
          fake.unsubGate = null;
          fake.onUnsubUpdateStarted?.();
          await gate;
        }
        const contact = fake.contacts.get(payload.email);
        if (contact && payload.unsubscribed !== undefined) {
          contact.unsubscribed = payload.unsubscribed;
        }
        return { error: null };
      },
      async get({ email }: { email: string }) {
        const live = fake.contacts.get(email);
        const contact = live ? { ...live } : live;
        if (fake.getGate) {
          const gate = fake.getGate;
          fake.getGate = null;
          fake.onGetStarted?.();
          await gate;
        }
        return contact
          ? { error: null, data: contact }
          : { error: { message: "not found", statusCode: 404 }, data: null };
      },
      segments: {
        async add() {
          fake.segmentAdds += 1;
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
      opts: { nx?: boolean; ex?: number; px?: number },
    ) {
      await Promise.resolve();
      if (key.startsWith("mythos:newsletter:lock:") && fake.lockContended) {
        return null;
      }
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
      if (keys[0] === "mythos:newsletter:consent-repair" && fake.failRepairWrites) {
        throw new Error("repair store down");
      }
      if (script.includes('"del"')) {
        // Lock release: compare-and-delete.
        if (fake.kv.get(keys[0]!) !== args[0]) return 0;
        fake.kv.delete(keys[0]!);
        return 1;
      }
      if (script.includes("string.match")) {
        const hash = fake.hashes.get(keys[0]!) ?? new Map<string, string>();
        const cur = hash.get(args[0]!);
        const curAt = cur ? Number(cur.split(":")[0]) : Number.NaN;
        if (Number.isFinite(curAt) && curAt >= Number(args[3])) return 0;
        hash.set(args[0]!, args[1]!);
        fake.hashes.set(keys[0]!, hash);
        return 1;
      }
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
import * as redemption from "@/lib/newsletter-redemption";
import { createConfirmToken } from "@/lib/newsletter-token";

const ORIGINAL_ENV = { ...process.env };
const EMAIL = "reader@example.com";
const REPAIR_HASH = "mythos:newsletter:consent-repair";
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

function cronRequest(): Request {
  return new Request("http://localhost:3000/api/cron/newsletter-consent-repair", {
    headers: { authorization: "Bearer cron_test" },
  });
}

function deferred() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
/** Simulates every consent lease lapsing (the holder ran past its lease). */
const expireLocks = () => {
  for (const key of [...fake.kv.keys()]) {
    if (key.startsWith("mythos:newsletter:lock:")) fake.kv.delete(key);
  }
};
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
  redemption.__resetNewsletterRedemptionForTests();
  fake.contacts.clear();
  fake.contacts.set(EMAIL, { unsubscribed: true });
  fake.gate = null;
  fake.onUpdateStarted = null;
  fake.unsubGate = null;
  fake.onUnsubUpdateStarted = null;
  fake.getGate = null;
  fake.onGetStarted = null;
  fake.failUnsubscribeWrites = false;
  fake.lockContended = false;
  fake.failRepairWrites = false;
  fake.segmentAdds = 0;
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

describe("the cron never settles a confirm that is still mutating", () => {
  it("leaves the write-ahead record for a confirm paused mid-update", async () => {
    const token = createConfirmToken(EMAIL, "re_test", new Date(T0));
    const gate = deferred();
    const started = deferred();
    fake.gate = gate.promise;
    fake.onUpdateStarted = started.release;
    const response = CONFIRM(confirmRequest(token));
    await started.promise;

    // The reader leaves while the subscribe update is in flight. The webhook
    // recorded it (done here directly: the webhook itself would queue behind
    // the confirm), and the contact still reads unsubscribed.
    vi.setSystemTime(T0 + 5_000);
    await redemption.recordNewsletterUnsubscribe(EMAIL, T0 + 5_000);
    expect(pendingRepairs()).toBe(1);

    // The cron must not delete the record out from under the running confirm:
    // the confirm holds the address's lock, so the cron skips the record.
    redemption.__setConsentLockTimingForTests({ waitMs: 30, retryMs: 10 });
    await REPAIR_CRON(cronRequest());
    expect(pendingRepairs()).toBe(1);

    // The update commits over the unsubscribe and re-applying it fails: the
    // record has to still be there for the cron to retry.
    fake.failUnsubscribeWrites = true;
    gate.release();
    expect((await response).status).toBe(502);
    expect(contactUnsubscribed()).toBe(false);
    expect(pendingRepairs()).toBe(1);

    fake.failUnsubscribeWrites = false;
    expect((await REPAIR_CRON(cronRequest())).status).toBe(200);
    expect(contactUnsubscribed()).toBe(true);
    expect(pendingRepairs()).toBe(0);
  });
});

describe("an older repair never undoes a newer confirmation", () => {
  it("lets the newer confirm win when it arrives mid-repair", async () => {
    // A queued repair for an unsubscribe at +5s; the contact reads subscribed.
    await redemption.recordNewsletterUnsubscribe(EMAIL, T0 + 5_000);
    await redemption.recordConsentRepair(EMAIL, T0 + 5_000);
    fake.contacts.set(EMAIL, { unsubscribed: false });

    // The cron's re-apply is paused at its Resend write.
    const gate = deferred();
    const started = deferred();
    fake.unsubGate = gate.promise;
    fake.onUnsubUpdateStarted = started.release;
    vi.setSystemTime(T0 + 60_000);
    const cron = REPAIR_CRON(cronRequest());
    await started.promise;

    // The reader asks for a fresh link after leaving and confirms it.
    const fresh = createConfirmToken(EMAIL, "re_test", new Date(T0 + 30_000));
    const confirm = CONFIRM(confirmRequest(fresh));
    await sleep(20);

    gate.release();
    await cron;
    expect((await confirm).status).toBe(200);
    expect(contactUnsubscribed()).toBe(false);
    expect(pendingRepairs()).toBe(0);
  });
});

describe("a repair whose lease lapsed during its contact read", () => {
  it("does not write a stale unsubscribe over a newer confirmation", async () => {
    // A queued repair for an unsubscribe at +5s; the contact reads subscribed.
    await redemption.recordNewsletterUnsubscribe(EMAIL, T0 + 5_000);
    await redemption.recordConsentRepair(EMAIL, T0 + 5_000);
    fake.contacts.set(EMAIL, { unsubscribed: false });

    // The cron holds the lock and its contact read stalls (snapshot: subscribed).
    const gate = deferred();
    const started = deferred();
    fake.getGate = gate.promise;
    fake.onGetStarted = started.release;
    vi.setSystemTime(T0 + 60_000);
    const cron = REPAIR_CRON(cronRequest());
    await started.promise;

    // The lease lapses; the reader confirms a fresh link in the meantime.
    expireLocks();
    const fresh = createConfirmToken(EMAIL, "re_test", new Date(T0 + 30_000));
    expect((await CONFIRM(confirmRequest(fresh))).status).toBe(200);
    fake.updates.length = 0;

    // The stalled read returns; the stale cron must not write unsubscribed:true.
    gate.release();
    await cron;
    expect(fake.updates.filter((u) => u.unsubscribed === true)).toEqual([]);
    expect(contactUnsubscribed()).toBe(false);
  });
});

describe("an unsubscribe webhook that arrives mid-confirm", () => {
  it("records at once and leaves the re-apply to whoever holds the lock", async () => {
    const token = createConfirmToken(EMAIL, "re_test", new Date(T0));
    const gate = deferred();
    const started = deferred();
    fake.gate = gate.promise;
    fake.onUpdateStarted = started.release;
    const confirm = CONFIRM(confirmRequest(token));
    await started.promise;

    fake.contacts.set(EMAIL, { unsubscribed: true });
    vi.setSystemTime(T0 + 5_000);
    fake.event = {
      type: "contact.updated",
      created_at: new Date(T0 + 5_000).toISOString(),
      data: { email: EMAIL, unsubscribed: true },
    };
    const hook = WEBHOOK(webhookRequest());
    await sleep(20);
    // The webhook's write step is waiting: the confirm owns the address.
    expect(fake.updates).toEqual([{ email: EMAIL, unsubscribed: false }]);

    gate.release();
    // The unsubscribe is recorded before the lock is taken, so the confirm's
    // post-check sees it and re-applies; the webhook then finds it applied.
    expect((await confirm).status).toBe(409);
    expect((await hook).status).toBe(200);
    expect(fake.updates).toEqual([
      { email: EMAIL, unsubscribed: false },
      { email: EMAIL, unsubscribed: true },
    ]);
    expect(contactUnsubscribed()).toBe(true);
  });
});

describe("when the per-address lock cannot be taken", () => {
  beforeEach(() => {
    redemption.__setConsentLockTimingForTests({ waitMs: 30, retryMs: 10 });
    fake.lockContended = true;
  });

  it("makes the confirm route answer 503 and touch nothing", async () => {
    const token = createConfirmToken(EMAIL, "re_test", new Date(T0));
    const res = await CONFIRM(confirmRequest(token));
    expect(res.status).toBe(503);
    expect(fake.updates).toHaveLength(0);
    expect(fake.kv.size).toBe(0);
    expect(pendingRepairs()).toBe(0);
  });

  it("makes the webhook queue the unsubscribe and answer 200", async () => {
    fake.contacts.set(EMAIL, { unsubscribed: false });
    fake.event = {
      type: "contact.updated",
      created_at: new Date(T0 + 5_000).toISOString(),
      data: { email: EMAIL, unsubscribed: true },
    };
    // Resend's retries are exhausted: this is the only delivery there will be.
    const res = await WEBHOOK(webhookRequest());
    expect(res.status).toBe(200);
    expect(pendingRepairs()).toBe(1);

    // The lock frees up and the cron still unsubscribes the reader.
    fake.lockContended = false;
    expect((await REPAIR_CRON(cronRequest())).status).toBe(200);
    expect(contactUnsubscribed()).toBe(true);
    expect(pendingRepairs()).toBe(0);
  });

  it("makes the webhook answer 503 only when nothing could be persisted", async () => {
    fake.failRepairWrites = true;
    fake.event = {
      type: "contact.updated",
      created_at: new Date(T0 + 5_000).toISOString(),
      data: { email: EMAIL, unsubscribed: true },
    };
    expect((await WEBHOOK(webhookRequest())).status).toBe(503);
  });

  it("makes the cron skip the record and keep it", async () => {
    await redemption.recordConsentRepair(EMAIL, T0 + 5_000);
    await redemption.recordNewsletterUnsubscribe(EMAIL, T0 + 5_000);
    fake.contacts.set(EMAIL, { unsubscribed: false });
    const res = await REPAIR_CRON(cronRequest());
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ skipped: 1, failed: 0 });
    expect(pendingRepairs()).toBe(1);
    expect(fake.updates).toHaveLength(0);
  });
});

describe("a lease that lapses mid-flight", () => {
  it("stops the confirm before its next mutation and keeps its record", async () => {
    const token = createConfirmToken(EMAIL, "re_test", new Date(T0));
    const gate = deferred();
    const started = deferred();
    fake.gate = gate.promise;
    fake.onUpdateStarted = started.release;
    const confirm = CONFIRM(confirmRequest(token));
    await started.promise;

    expireLocks();
    gate.release();
    expect((await confirm).status).toBe(503);
    // The segment add never ran, and the write-ahead record is still there.
    expect(fake.segmentAdds).toBe(0);
    expect(pendingRepairs()).toBe(1);
  });

  it("makes the cron keep a record whose lease lapsed during the repair", async () => {
    await redemption.recordNewsletterUnsubscribe(EMAIL, T0 + 5_000);
    await redemption.recordConsentRepair(EMAIL, T0 + 5_000);
    fake.contacts.set(EMAIL, { unsubscribed: false });
    const gate = deferred();
    const started = deferred();
    fake.unsubGate = gate.promise;
    fake.onUnsubUpdateStarted = started.release;
    const cron = REPAIR_CRON(cronRequest());
    await started.promise;

    expireLocks();
    gate.release();
    const res = await cron;
    expect(await res.json()).toMatchObject({ skipped: 1, repaired: 0 });
    expect(pendingRepairs()).toBe(1);
  });
});
