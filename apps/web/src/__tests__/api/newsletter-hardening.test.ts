import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const resend = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  add: vi.fn(),
  send: vi.fn(),
  get: vi.fn(),
  list: vi.fn(),
}));

const upstash = vi.hoisted(() => ({
  /** What the mocked Ratelimit.limit() does next; undefined = allow. */
  limit: undefined as undefined | (() => Promise<Record<string, unknown>>),
  kv: new Map<string, string>(),
  counters: new Map<string, number>(),
  incrFails: false,
  /** Next set() commits but throws, like a lost acknowledgement. */
  lostAck: false,
  /** The next eval() (pending -> done) throws. */
  evalFails: false,
}));

vi.mock("resend", () => ({
  Resend: class {
    contacts = {
      create: resend.create,
      update: resend.update,
      get: resend.get,
      segments: { add: resend.add, list: resend.list },
    };
    emails = { send: resend.send };
  },
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow() {
      return {};
    }
    async limit() {
      return upstash.limit ? upstash.limit() : { success: true };
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
      // Yield so concurrent callers genuinely interleave.
      await Promise.resolve();
      if (opts.nx && upstash.kv.has(key)) return null;
      upstash.kv.set(key, value);
      if (upstash.lostAck) {
        upstash.lostAck = false;
  upstash.evalFails = false;
  vi.useFakeTimers({ toFake: ["Date"] });
        throw new Error("ack lost");
      }
      return "OK";
    }
    async get(key: string) {
      return upstash.kv.get(key) ?? null;
    }
    async eval(_script: string, keys: string[], args: string[]) {
      if (upstash.evalFails && args.length === 3) {
        upstash.evalFails = false;
        throw new Error("redis down");
      }
      if (keys.length === 2) {
        // Mutation guard: 0 claim lost, 2 reader unsubscribed, 1 ok.
        if (upstash.kv.get(keys[0]!) !== args[0]) return 0;
        const unsub = upstash.kv.get(keys[1]!);
        if (unsub !== undefined && Number(unsub) >= Number(args[1])) return 2;
        return 1;
      }
      if (_script.includes("tonumber(cur)")) {
        const cur = upstash.kv.get(keys[0]!);
        if (cur === undefined || Number(cur) < Number(args[0])) {
          upstash.kv.set(keys[0]!, args[0]!);
        }
        return 1;
      }
      const key = keys[0]!;
      if (upstash.kv.get(key) !== args[0]) return 0;
      if (args.length === 3) upstash.kv.set(key, args[1]!);
      else upstash.kv.delete(key);
      return 1;
    }
    async incr(key: string) {
      if (upstash.incrFails) throw new Error("down");
      const v = (upstash.counters.get(key) ?? 0) + 1;
      upstash.counters.set(key, v);
      return v;
    }
    async expire() {
      return 1;
    }
  },
}));

import { POST as CONFIRM } from "@/app/api/newsletter/confirm/route";
import { POST } from "@/app/api/newsletter/route";
import {
  canonicalMailboxKey,
  DEFAULT_RESEND_SEGMENT_ID,
} from "@/lib/newsletter";
import { recordNewsletterUnsubscribe } from "@/lib/newsletter-redemption";
import {
  confirmTokenIssuedAtMs,
  createConfirmToken,
} from "@/lib/newsletter-token";
import { checkOracleRateLimit } from "@/lib/oracle/rate-limit";

const ORIGINAL_ENV = { ...process.env };
const FROM = "Mythos Atlas <digest@example.com>";
let ip = 0;

function post(url: string, body: unknown): NextRequest {
  ip += 1;
  return new Request(`http://localhost:3000${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "http://localhost:3000",
      host: "localhost:3000",
      "x-real-ip": `10.${Math.floor(ip / 250)}.0.${(ip % 250) + 1}`,
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

const signup = (email: string) =>
  POST(post("/api/newsletter", { email, consent: true }));

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  process.env.RESEND_API_KEY = "re_test";
  process.env.NEWSLETTER_FROM = FROM;
  process.env.RESEND_WEBHOOK_SECRET = "whsec_test";
  delete process.env.RESEND_SEGMENT_ID;
  delete process.env.NEWSLETTER_DAILY_SEND_CAP;
  process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "token";
  upstash.limit = undefined;
  upstash.kv.clear();
  upstash.counters.clear();
  upstash.incrFails = false;
  upstash.lostAck = false;
  for (const fn of Object.values(resend)) fn.mockReset();
  resend.create.mockResolvedValue({ error: null });
  resend.send.mockResolvedValue({ error: null });
  resend.get.mockResolvedValue({ error: null, data: { unsubscribed: true } });
  resend.list.mockResolvedValue({ error: null, data: { data: [] } });
});

afterEach(() => {
  vi.useRealTimers();
  process.env = { ...ORIGINAL_ENV };
});

describe("confirm: single-use redemption", () => {
  it("makes exactly one Resend call for 20 concurrent replays", async () => {
    const token = createConfirmToken("replay@example.com", "re_test");
    const responses = await Promise.all(
      Array.from({ length: 20 }, () =>
        CONFIRM(post("/api/newsletter/confirm", { token })),
      ),
    );
    // The winner confirms; racers are told to retry (409), never given a
    // success the winner has not earned yet.
    expect(responses.filter((r) => r.status === 200)).toHaveLength(1);
    expect(responses.filter((r) => r.status === 409)).toHaveLength(19);
    expect(resend.create).toHaveBeenCalledTimes(1);
    const after = await CONFIRM(post("/api/newsletter/confirm", { token }));
    expect(after.status).toBe(200);
    expect(resend.create).toHaveBeenCalledTimes(1);
    expect(resend.create).toHaveBeenCalledWith({
      email: "replay@example.com",
      unsubscribed: false,
      segments: [{ id: DEFAULT_RESEND_SEGMENT_ID }],
    });
  });

  it("does not reactivate a contact that unsubscribed after confirming", async () => {
    const token = createConfirmToken("leaver@example.com", "re_test");
    expect(
      (await CONFIRM(post("/api/newsletter/confirm", { token }))).status,
    ).toBe(200);
    expect(resend.create).toHaveBeenCalledTimes(1);

    // The reader unsubscribes in Resend; the old link is replayed.
    resend.create.mockClear();
    const replay = await CONFIRM(post("/api/newsletter/confirm", { token }));
    expect(replay.status).toBe(200);
    expect(resend.create).not.toHaveBeenCalled();
    expect(resend.update).not.toHaveBeenCalled();
    expect(resend.add).not.toHaveBeenCalled();
  });

  it("keeps the claim after an upstream failure: a retry waits instead of re-running", async () => {
    const token = createConfirmToken("retry@example.com", "re_test");
    resend.create.mockResolvedValueOnce({
      error: { message: "boom", statusCode: 500 },
    });
    expect(
      (await CONFIRM(post("/api/newsletter/confirm", { token }))).status,
    ).toBe(502);
    expect(
      (await CONFIRM(post("/api/newsletter/confirm", { token }))).status,
    ).toBe(409);
    expect(resend.create).toHaveBeenCalledTimes(1);
  });

  it("does not report success to a retry after a lost acknowledgement", async () => {
    const token = createConfirmToken("lostack@example.com", "re_test");
    upstash.lostAck = true;
    expect(
      (await CONFIRM(post("/api/newsletter/confirm", { token }))).status,
    ).toBe(503);
    // The SET committed, so the retry sees a pending claim: not success.
    const retry = await CONFIRM(post("/api/newsletter/confirm", { token }));
    expect(retry.status).toBe(409);
    expect(resend.create).not.toHaveBeenCalled();
  });

  it("answers a concurrent retry with 409 and never hands the claim to it after the first fails", async () => {
    const token = createConfirmToken("racefail@example.com", "re_test");
    let failFirst!: () => void;
    resend.create.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          failFirst = () => resolve({ error: { message: "boom" } });
        }),
    );
    const first = CONFIRM(post("/api/newsletter/confirm", { token }));
    await vi.waitFor(() => expect(resend.create).toHaveBeenCalledTimes(1));
    const concurrent = await CONFIRM(post("/api/newsletter/confirm", { token }));
    expect(concurrent.status).toBe(409);
    failFirst();
    expect((await first).status).toBe(502);
    expect(
      (await CONFIRM(post("/api/newsletter/confirm", { token }))).status,
    ).toBe(409);
    expect(resend.create).toHaveBeenCalledTimes(1);
  });

  it("lets a link issued after an old unsubscribe confirm", async () => {
    const token = createConfirmToken("returning@example.com", "re_test");
    await recordNewsletterUnsubscribe(
      "returning@example.com",
      confirmTokenIssuedAtMs(token) - 1_000,
    );
    expect(
      (await CONFIRM(post("/api/newsletter/confirm", { token }))).status,
    ).toBe(200);
    expect(resend.create).toHaveBeenCalledTimes(1);
  });

  describe("unsubscribe races", () => {
    const settle = async () => {
      for (let i = 0; i < 25; i++) await Promise.resolve();
    };

    it("does not undo an unsubscribe when a timed-out create resolves late", async () => {
      vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
      const token = createConfirmToken("late@example.com", "re_test");
      let resolveCreate!: (v: unknown) => void;
      resend.create.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveCreate = resolve;
          }),
      );
      const pending = CONFIRM(post("/api/newsletter/confirm", { token }));
      await settle();
      expect(resend.create).toHaveBeenCalledTimes(1);

      // Longer than the old 20s timeout, then the reader unsubscribes.
      await vi.advanceTimersByTimeAsync(25_000);
      await recordNewsletterUnsubscribe("late@example.com", Date.now());
      resolveCreate({ error: { message: "already exists", statusCode: 409 } });

      const response = await pending;
      expect(response.status).toBe(409);
      expect(resend.update).not.toHaveBeenCalled();
      expect(resend.add).not.toHaveBeenCalled();
    });

    it("stops before the next mutation when the claim is gone", async () => {
      const token = createConfirmToken("gone@example.com", "re_test");
      let resolveCreate!: (v: unknown) => void;
      resend.create.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveCreate = resolve;
          }),
      );
      const pending = CONFIRM(post("/api/newsletter/confirm", { token }));
      await vi.waitFor(() => expect(resend.create).toHaveBeenCalledTimes(1));
      upstash.kv.clear();
      resolveCreate({ error: { message: "already exists", statusCode: 409 } });
      expect((await pending).status).toBe(409);
      expect(resend.update).not.toHaveBeenCalled();
    });

    it("keeps a pending record that nobody can read the contact for", async () => {
      const token = createConfirmToken("leaver2@example.com", "re_test");
      upstash.evalFails = true; // the done-write fails
      expect(
        (await CONFIRM(post("/api/newsletter/confirm", { token }))).status,
      ).toBe(200);
      expect(resend.create).toHaveBeenCalledTimes(1);

      // The reader unsubscribes, the claim ages past the old 60s staleness
      // window, and Resend cannot answer a contact lookup.
      await recordNewsletterUnsubscribe("leaver2@example.com", Date.now());
      vi.setSystemTime(Date.now() + 61_000);
      resend.get.mockRejectedValue(new Error("resend down"));
      resend.create.mockClear();
      const recordKey = () =>
        [...upstash.kv.entries()].find(([k]) => k.includes(":redeemed:"));
      const before = recordKey();

      for (let i = 0; i < 3; i++) {
        const retry = await CONFIRM(post("/api/newsletter/confirm", { token }));
        expect(retry.status).toBe(409);
      }
      expect(resend.create).not.toHaveBeenCalled();
      expect(resend.update).not.toHaveBeenCalled();
      expect(resend.add).not.toHaveBeenCalled();
      // Replay protection is still in place, not erased.
      expect(recordKey()).toEqual(before);
      expect(before?.[1]).toMatch(/^pending:/);
    });

    it("never calls a stale retry confirmed because the contact once joined the segment", async () => {
      const token = createConfirmToken("fresh@example.com", "re_test");
      upstash.lostAck = true; // claim commits, confirm never ran
      expect(
        (await CONFIRM(post("/api/newsletter/confirm", { token }))).status,
      ).toBe(503);

      // Historical segment membership plus a fresh unsubscribe: exactly what
      // used to be read as "this token already completed".
      vi.setSystemTime(Date.now() + 61_000);
      resend.get.mockResolvedValue({ error: null, data: { unsubscribed: true } });
      resend.list.mockResolvedValue({
        error: null,
        data: { data: [{ id: DEFAULT_RESEND_SEGMENT_ID }] },
      });
      const retry = await CONFIRM(post("/api/newsletter/confirm", { token }));
      expect(retry.status).toBe(409);
      expect(await retry.json()).toMatchObject({ confirmed: false });
      expect(resend.create).not.toHaveBeenCalled();
      expect(resend.update).not.toHaveBeenCalled();
      expect(resend.add).not.toHaveBeenCalled();
    });
  });

  it("only the claim owner can mark it done", async () => {
    const { claimConfirmToken, completeConfirmToken } = await import(
      "@/lib/newsletter-redemption"
    );
    const claim = await claimConfirmToken("owner-check-token", 3600);
    expect(claim.status).toBe("claimed");
    if (claim.status !== "claimed") return;
    expect(
      await completeConfirmToken(
        "owner-check-token",
        "pending:someone-else:1",
        3600,
      ),
    ).toBe(false);
    expect([...upstash.kv.values()]).toEqual([claim.marker]);
    expect(
      await completeConfirmToken("owner-check-token", claim.marker, 3600),
    ).toBe(true);
    expect([...upstash.kv.values()]).toEqual(["done"]);
  });

  it("rate limits confirm attempts per client", async () => {
    const headers = {
      "Content-Type": "application/json",
      origin: "http://localhost:3000",
      host: "localhost:3000",
      "x-real-ip": "198.51.100.9",
    };
    upstash.limit = async () => ({ success: false });
    const response = await CONFIRM(
      new Request("http://localhost:3000/api/newsletter/confirm", {
        method: "POST",
        headers,
        body: JSON.stringify({
          token: createConfirmToken("x@example.com", "re_test"),
        }),
      }) as unknown as NextRequest,
    );
    expect(response.status).toBe(429);
    expect(resend.create).not.toHaveBeenCalled();
  });

  it("answers 503 before Resend when the limiter times out", async () => {
    upstash.limit = async () => ({ success: true, reason: "timeout" });
    const token = createConfirmToken("slow@example.com", "re_test");
    const response = await CONFIRM(post("/api/newsletter/confirm", { token }));
    expect(response.status).toBe(503);
    expect(resend.create).not.toHaveBeenCalled();
  });
});

describe("send path: fail closed on Redis trouble", () => {
  it("answers 503 and sends nothing when Upstash times out", async () => {
    upstash.limit = async () => ({ success: true, reason: "timeout" });
    const response = await signup("timeout@example.com");
    expect(response.status).toBe(503);
    expect(resend.create).not.toHaveBeenCalled();
    expect(resend.send).not.toHaveBeenCalled();
  });

  it("answers 503 and sends nothing when Upstash errors", async () => {
    upstash.limit = async () => {
      throw new Error("ECONNRESET");
    };
    const response = await signup("error@example.com");
    expect(response.status).toBe(503);
    expect(resend.create).not.toHaveBeenCalled();
    expect(resend.send).not.toHaveBeenCalled();
  });

  it("leaves other callers' behaviour alone (opt-in flag only)", async () => {
    upstash.limit = async () => ({ success: true, reason: "timeout" });
    await expect(checkOracleRateLimit("someone")).resolves.toEqual({
      allowed: true,
    });
  });
});

describe("per-inbox key and aggregate budget", () => {
  it("folds provider aliases for the key only", () => {
    expect(canonicalMailboxKey("Victim+1@Gmail.com")).toBe("victim@gmail.com");
    expect(canonicalMailboxKey("v.i.c.t.i.m+x@googlemail.com")).toBe(
      "victim@gmail.com",
    );
    expect(canonicalMailboxKey("a.b+t@example.com")).toBe("a.b@example.com");
  });

  it("gives 30 alias variants from different IPs one shared allowance", async () => {
    // Real per-bucket counting: the per-inbox bucket allows 5 per key.
    const counts = new Map<string, number>();
    vi.doMock("@upstash/ratelimit", () => ({
      Ratelimit: class {
        static slidingWindow() {
          return {};
        }
        async limit(id: string) {
          const n = (counts.get(id) ?? 0) + 1;
          counts.set(id, n);
          return { success: n <= 5 };
        }
      },
    }));
    vi.resetModules();
    const { POST: freshPost } = await import("@/app/api/newsletter/route");
    const variants = Array.from({ length: 30 }, (_, i) =>
      i % 2 === 0
        ? `victim+${i}@gmail.com`
        : `v.i.c.t.i.m+${i}@googlemail.com`,
    );
    const statuses: number[] = [];
    for (const email of variants) {
      statuses.push(
        (
          await freshPost(
            post("/api/newsletter", { email, consent: true }),
          )
        ).status,
      );
    }
    expect(statuses.filter((s) => s === 200)).toHaveLength(5);
    expect(statuses.filter((s) => s === 429)).toHaveLength(25);
    expect(resend.send).toHaveBeenCalledTimes(5);
    // Delivery used the submitted alias, not the canonical key.
    expect(resend.send.mock.calls[0]![0].to).toBe("victim+0@gmail.com");
    vi.doUnmock("@upstash/ratelimit");
  });

  it("stops sending once the global daily budget is spent", async () => {
    process.env.NEWSLETTER_DAILY_SEND_CAP = "3";
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      statuses.push((await signup(`person${i}@example.com`)).status);
    }
    expect(statuses).toEqual([200, 200, 200, 429, 429, 429]);
    expect(resend.send).toHaveBeenCalledTimes(3);
  });

  it("answers 503 and sends nothing when the budget counter errors", async () => {
    upstash.incrFails = true;
    const response = await signup("budget-down@example.com");
    expect(response.status).toBe(503);
    expect(resend.send).not.toHaveBeenCalled();
  });
});
