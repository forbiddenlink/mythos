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

const store = await vi.hoisted(async () =>
  (await import("../helpers/fake-upstash")).createFakeRedis(),
);

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

vi.mock("@upstash/ratelimit", async () =>
  (await import("../helpers/fake-upstash")).fakeRatelimitModule(store),
);

vi.mock("@upstash/redis", async () =>
  (await import("../helpers/fake-upstash")).fakeRedisModule(store),
);

import { POST as CONFIRM } from "@/app/api/newsletter/confirm/route";
import { POST as SIGNUP } from "@/app/api/newsletter/route";
import { createConfirmToken } from "@/lib/newsletter-token";
import { utcDayKey } from "@/lib/server/runtime";

const ORIGINAL_ENV = { ...process.env };
let ip = 0;

function post(
  url: string,
  body: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  ip += 1;
  return new Request(`http://localhost:3000${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "http://localhost:3000",
      host: "localhost:3000",
      "x-real-ip": `10.9.${Math.floor(ip / 250)}.${(ip % 250) + 1}`,
      ...headers,
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

/** The day's counts, without the budget tally. */
function counts(): Record<string, string> {
  const hash = store.hashes.get(`mythos:count:${utcDayKey()}`);
  const { beacons: _beacons, ...rest } = Object.fromEntries(hash ?? []);
  return rest;
}

const signup = (body: Record<string, unknown>) =>
  SIGNUP(post("/api/newsletter", { consent: true, ...body }));
const confirm = (token: string) =>
  CONFIRM(post("/api/newsletter/confirm", { token }));

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  process.env.RESEND_API_KEY = "re_test";
  process.env.NEWSLETTER_FROM = "Mythos Atlas <digest@example.com>";
  process.env.RESEND_WEBHOOK_SECRET = "whsec_test";
  delete process.env.NEWSLETTER_CONFIRM_SECRET;
  delete process.env.RESEND_SEGMENT_ID;
  delete process.env.NEWSLETTER_DAILY_SEND_CAP;
  process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "token";
  store.reset();
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

describe("sign-up step counts", () => {
  it("counts an accepted request under its placement", async () => {
    expect(
      (await signup({ email: "a@example.com", placement: "footer" })).status,
    ).toBe(200);
    expect(
      (await signup({ email: "b@example.com", placement: "daily_myth" }))
        .status,
    ).toBe(200);
    expect((await signup({ email: "c@example.com" })).status).toBe(200);
    expect(counts()).toEqual({
      "signup-requested:footer": "1",
      "signup-requested:daily_myth": "1",
      "signup-requested:none": "1",
    });
  });

  it("stores no address with the count", async () => {
    await signup({ email: "private-reader@example.com", placement: "footer" });
    const hash = store.hashes.get(`mythos:count:${utcDayKey()}`);
    expect(JSON.stringify([...(hash ?? [])])).not.toContain("private-reader");
  });

  it("counts a honeypot hit nowhere, with the same answer as a real request", async () => {
    const res = await signup({
      email: "bot@example.com",
      placement: "footer",
      website: "https://spam.example",
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ subscribed: false, pending: true });
    expect(counts()).toEqual({});
    expect(resend.send).not.toHaveBeenCalled();
  });

  it("counts an invalid request as refused", async () => {
    expect((await signup({ email: "not-an-address" })).status).toBe(400);
    expect(counts()).toEqual({ "signup-refused:invalid": "1" });
  });

  it("counts a rate-limited request as refused", async () => {
    store.limit = async () => ({ success: false, reset: Date.now() + 60_000 });
    expect((await signup({ email: "a@example.com" })).status).toBe(429);
    expect(counts()).toEqual({ "signup-refused:rate-limited": "1" });
  });

  it("counts a failed send as unavailable", async () => {
    resend.send.mockResolvedValue({
      error: { message: "boom", statusCode: 500 },
    });
    const res = await signup({ email: "a@example.com", placement: "footer" });
    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(counts()).toEqual({ "signup-refused:unavailable": "1" });
  });

  it("does not count a request from another site", async () => {
    const res = await SIGNUP(
      post(
        "/api/newsletter",
        { email: "a@example.com", consent: true },
        { origin: "https://evil.example" },
      ),
    );
    expect(res.status).toBe(403);
    expect(counts()).toEqual({});
  });
});

describe("confirm step counts", () => {
  it("counts a confirmed address", async () => {
    const token = createConfirmToken("reader@example.com", "re_test");
    expect((await confirm(token)).status).toBe(200);
    expect(counts()).toEqual({ "confirm:ok": "1" });
  });

  it("counts a malformed token as invalid", async () => {
    expect((await confirm("not-a-token")).status).toBe(400);
    expect(counts()).toEqual({ "confirm:invalid": "1" });
  });

  it("counts an expired link as expired", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    const token = createConfirmToken("reader@example.com", "re_test");
    vi.setSystemTime(new Date("2026-06-01T00:00:00.000Z"));
    const res = await confirm(token);
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ reason: "expired" });
    expect(
      Object.fromEntries(store.hashes.get("mythos:count:2026-06-01") ?? []),
    ).toMatchObject({ "confirm:expired": "1" });
  });

  it("counts a rate-limited confirmation", async () => {
    const token = createConfirmToken("reader@example.com", "re_test");
    store.limit = async () => ({ success: false, reset: Date.now() + 60_000 });
    expect((await confirm(token)).status).toBe(429);
    expect(counts()).toEqual({ "confirm:rate-limited": "1" });
  });
});

describe("a count that cannot be stored", () => {
  it("never changes the sign-up or confirmation answer", async () => {
    // hincrby throws; the rate limiters and the consent store still work.
    store.incrFails = true;
    const invalid = await signup({ email: "not-an-address" });
    expect(invalid.status).toBe(400);
    const token = createConfirmToken("reader@example.com", "re_test");
    const confirmed = await confirm(token);
    expect(confirmed.status).toBe(200);
    expect(counts()).toEqual({});
  });
});
