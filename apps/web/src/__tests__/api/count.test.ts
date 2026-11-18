import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const store = await vi.hoisted(async () =>
  (await import("../helpers/fake-upstash")).createFakeRedis(),
);

vi.mock("@upstash/redis", async () =>
  (await import("../helpers/fake-upstash")).fakeRedisModule(store),
);

import { DAILY_BEACON_CAP } from "@/lib/server/daily-count-store";
import { utcDayKey } from "@/lib/server/runtime";

const ORIGINAL_ENV = { ...process.env };

function post(
  body: unknown,
  headers: Record<string, string> = {},
  raw?: string,
): Request {
  return new Request("http://localhost:3000/api/count", {
    method: "POST",
    headers: {
      // navigator.sendBeacon sends a string body as text/plain.
      "Content-Type": "text/plain;charset=UTF-8",
      origin: "http://localhost:3000",
      host: "localhost:3000",
      ...headers,
    },
    body: raw ?? JSON.stringify(body),
  });
}

/**
 * A fresh copy of the route for each request, so the store's "ceiling reached
 * today" memo from one test cannot answer for the next.
 */
async function POST(request: Request): Promise<Response> {
  vi.resetModules();
  const route = await import("@/app/api/count/route");
  return route.POST(request);
}

const todayHash = () => store.hashes.get(`mythos:count:${utcDayKey()}`);
const arrive = { step: "arrive", page: "gods-of", source: "search" };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "token";
  store.reset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  process.env = { ...ORIGINAL_ENV };
});

describe("POST /api/count", () => {
  it("adds one to the named counter and stores nothing about the sender", async () => {
    const res = await POST(
      post(arrive, {
        "x-real-ip": "203.0.113.9",
        "x-forwarded-for": "203.0.113.9",
        "user-agent": "Mozilla/5.0 UniqueBrowser/1.0",
        cookie: "locale=fr",
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ counted: true });
    expect(res.headers.get("cache-control")).toContain("no-store");

    expect(Object.fromEntries(todayHash() ?? [])).toEqual({
      "arrive:gods-of:search": "1",
      beacons: "1",
    });
    // The whole store holds that one hash: no address, agent or cookie.
    expect(store.kv.size).toBe(0);
    expect(store.counters.size).toBe(0);
    expect(store.hashes.size).toBe(1);
    const stored = JSON.stringify([...(todayHash() ?? [])]);
    expect(stored).not.toMatch(/203\.0\.113|UniqueBrowser|locale/);
  });

  it("counts the confirm-page view", async () => {
    expect((await POST(post({ step: "confirm-view" }))).status).toBe(200);
    expect(todayHash()?.get("confirm-view")).toBe("1");
  });

  it("refuses another site", async () => {
    const res = await POST(post(arrive, { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
    expect(store.hashes.size).toBe(0);
  });

  it.each([
    [
      "a page address",
      { step: "arrive", page: "/gods-of/war", source: "search" },
    ],
    ["an extra key", { ...arrive, id: "abc" }],
    ["a newsletter counter", { step: "confirm", page: "ok", source: "x" }],
    ["an array", [arrive]],
  ])("refuses %s", async (_label, body) => {
    const res = await POST(post(body));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ counted: false, reason: "invalid" });
    expect(store.hashes.size).toBe(0);
  });

  it("refuses a body that is not JSON or is too large", async () => {
    expect((await POST(post(null, {}, "step=arrive"))).status).toBe(400);
    expect(
      (await POST(post({ step: "arrive", page: "x".repeat(400), source: "s" })))
        .status,
    ).toBe(400);
    expect(store.hashes.size).toBe(0);
  });

  it("answers 429 once the daily ceiling is reached", async () => {
    store.hashes.set(
      `mythos:count:${utcDayKey()}`,
      new Map([["beacons", String(DAILY_BEACON_CAP)]]),
    );
    const res = await POST(post(arrive));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ counted: false, reason: "capped" });
    expect(todayHash()?.has("arrive:gods-of:search")).toBe(false);
  });

  it("answers 503 when the store is down", async () => {
    store.incrFails = true;
    const res = await POST(post(arrive));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ counted: false, reason: "unavailable" });
  });

  it("answers 501 in production without Upstash", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.stubEnv("NODE_ENV", "production");
    const res = await POST(post(arrive));
    expect(res.status).toBe(501);
    expect(await res.json()).toEqual({
      counted: false,
      reason: "not_configured",
    });
  });
});
