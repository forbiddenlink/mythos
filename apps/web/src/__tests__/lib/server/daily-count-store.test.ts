import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const store = await vi.hoisted(async () =>
  (await import("../../helpers/fake-upstash")).createFakeRedis(),
);

vi.mock("@upstash/redis", async () =>
  (await import("../../helpers/fake-upstash")).fakeRedisModule(store),
);

const ORIGINAL_ENV = { ...process.env };
const DAY = "2026-11-18";
const NOON = new Date(`${DAY}T12:00:00.000Z`);
const KEY = `mythos:count:${DAY}`;

/** A fresh copy of the module, so its in-memory state starts empty. */
async function load() {
  vi.resetModules();
  return import("@/lib/server/daily-count-store");
}

function useUpstash() {
  process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "token";
}

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.VERCEL_ENV;
  store.reset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  process.env = { ...ORIGINAL_ENV };
});

describe("the counter list", () => {
  it("holds page counters, newsletter steps and nothing free-form", async () => {
    const { DAILY_COUNTERS } = await load();
    expect(DAILY_COUNTERS).toContain("arrive:gods-of:search");
    expect(DAILY_COUNTERS).toContain("onward:compare:search");
    expect(DAILY_COUNTERS).toContain("signup-requested:footer");
    expect(DAILY_COUNTERS).toContain("signup-requested:none");
    expect(DAILY_COUNTERS).toContain("signup-refused:rate-limited");
    expect(DAILY_COUNTERS).toContain("confirm-view");
    expect(DAILY_COUNTERS).toContain("confirm:expired");
    expect(new Set(DAILY_COUNTERS).size).toBe(DAILY_COUNTERS.length);
    for (const counter of DAILY_COUNTERS) {
      expect(counter).toMatch(/^[a-z-]+(:[a-z_-]+){0,2}$/);
    }
  });
});

describe("counterForBeacon", () => {
  it("accepts exactly the two beacon shapes", async () => {
    const { counterForBeacon } = await load();
    expect(
      counterForBeacon({ step: "arrive", page: "deity", source: "search" }),
    ).toBe("arrive:deity:search");
    expect(
      counterForBeacon({ step: "onward", page: "home", source: "direct" }),
    ).toBe("onward:home:direct");
    expect(counterForBeacon({ step: "confirm-view" })).toBe("confirm-view");
  });

  it.each([
    [null],
    ["arrive:deity:search"],
    [[{ step: "confirm-view" }]],
    [{}],
    [{ step: "arrive", page: "deity" }],
    [
      {
        step: "arrive",
        page: "deity",
        source: "search",
        path: "/deities/zeus",
      },
    ],
    [{ step: "arrive", page: "/deities/zeus", source: "search" }],
    [{ step: "arrive", page: "deity", source: "google.com" }],
    [{ step: "confirm-view", token: "abc" }],
    // A newsletter counter must not be reachable through the page shape.
    [{ step: "signup-requested", page: "footer", source: "search" }],
    [{ step: "confirm", page: "ok", source: "x" }],
    [
      {
        step: "arrive",
        page: { toString: (): string => "deity" },
        source: "search",
      },
    ],
  ])("refuses %j", async (body) => {
    const { counterForBeacon } = await load();
    expect(counterForBeacon(body)).toBeNull();
  });
});

describe("newsletter step counters", () => {
  it("maps a sign-up answer to a counter", async () => {
    const { signupCounter } = await load();
    expect(signupCounter(200, "footer")).toBe("signup-requested:footer");
    expect(signupCounter(200, "none")).toBe("signup-requested:none");
    // A honeypot hit is answered 200 with no placement recorded.
    expect(signupCounter(200, undefined)).toBeNull();
    expect(signupCounter(429, "footer")).toBe("signup-refused:rate-limited");
    expect(signupCounter(400, undefined)).toBe("signup-refused:invalid");
    expect(signupCounter(413, undefined)).toBe("signup-refused:invalid");
    expect(signupCounter(502, "footer")).toBe("signup-refused:unavailable");
    expect(signupCounter(403, undefined)).toBeNull();
  });

  it("maps a confirmation answer to a counter", async () => {
    const { confirmCounter } = await load();
    expect(confirmCounter(200, undefined)).toBe("confirm:ok");
    expect(confirmCounter(400, "expired")).toBe("confirm:expired");
    expect(confirmCounter(400, "invalid")).toBe("confirm:invalid");
    expect(confirmCounter(400, undefined)).toBe("confirm:invalid");
    expect(confirmCounter(409, undefined)).toBe("confirm:busy");
    expect(confirmCounter(429, undefined)).toBe("confirm:rate-limited");
    expect(confirmCounter(503, undefined)).toBe("confirm:unavailable");
    expect(confirmCounter(403, undefined)).toBeNull();
  });

  it("every counter the mappers return is on the list", async () => {
    const { DAILY_COUNTERS, confirmCounter, signupCounter } = await load();
    const produced = [
      ...[200, 400, 413, 429, 500, 502, 503].flatMap((status) =>
        ["footer", "daily_myth", "newsletter_page", "none"].map((placement) =>
          signupCounter(status, placement),
        ),
      ),
      ...[200, 400, 409, 413, 429, 502, 503].flatMap((status) =>
        ["expired", "invalid", undefined].map((reason) =>
          confirmCounter(status, reason),
        ),
      ),
    ];
    for (const counter of produced) expect(DAILY_COUNTERS).toContain(counter);
  });
});

describe("recordDailyCount with Upstash", () => {
  beforeEach(useUpstash);

  it("adds one to the counter in the day's hash and nothing else", async () => {
    const { recordDailyCount } = await load();
    expect(await recordDailyCount("confirm:ok", {}, NOON)).toEqual({
      stored: true,
    });
    await recordDailyCount("confirm:ok", {}, NOON);
    expect([...store.hashes.keys()]).toEqual([KEY]);
    expect(Object.fromEntries(store.hashes.get(KEY) ?? [])).toEqual({
      "confirm:ok": "2",
    });
    expect(store.kv.size).toBe(0);
  });

  it("refuses a name that is not on the list", async () => {
    const { recordDailyCount } = await load();
    expect(
      await recordDailyCount("arrive:/deities/zeus:search", {}, NOON),
    ).toEqual({ stored: false, reason: "unavailable" });
    expect(store.hashes.size).toBe(0);
  });

  it("tallies budgeted counts and stops at the daily ceiling", async () => {
    const { DAILY_BEACON_CAP, recordDailyCount } = await load();
    store.hashes.set(KEY, new Map([["beacons", String(DAILY_BEACON_CAP - 1)]]));

    expect(
      await recordDailyCount("arrive:home:direct", { budgeted: true }, NOON),
    ).toEqual({ stored: true });
    expect(
      await recordDailyCount("arrive:home:direct", { budgeted: true }, NOON),
    ).toEqual({ stored: false, reason: "capped" });
    expect(store.hashes.get(KEY)?.get("arrive:home:direct")).toBe("1");

    // After the ceiling this instance stops asking the store for that day.
    const tally = store.hashes.get(KEY)?.get("beacons");
    expect(
      await recordDailyCount("arrive:home:direct", { budgeted: true }, NOON),
    ).toEqual({ stored: false, reason: "capped" });
    expect(store.hashes.get(KEY)?.get("beacons")).toBe(tally);

    // A count that is not budgeted is still stored, and so is the next day.
    expect(await recordDailyCount("confirm:ok", {}, NOON)).toEqual({
      stored: true,
    });
    expect(
      await recordDailyCount(
        "arrive:home:direct",
        { budgeted: true },
        new Date("2026-11-19T00:00:01.000Z"),
      ),
    ).toEqual({ stored: true });
  });

  it("answers unavailable, without throwing, when the store is down", async () => {
    const { recordDailyCount } = await load();
    store.incrFails = true;
    expect(
      await recordDailyCount("arrive:home:direct", { budgeted: true }, NOON),
    ).toEqual({ stored: false, reason: "unavailable" });
    expect(await recordDailyCount("confirm:ok", {}, NOON)).toEqual({
      stored: false,
      reason: "unavailable",
    });
  });

  it("recordStepCount budgets refusals but not successful steps", async () => {
    const { recordStepCount } = await load();
    await recordStepCount("signup-requested:footer", 200);
    await recordStepCount("signup-refused:invalid", 400);
    await recordStepCount(null, 403);
    const [hash] = [...store.hashes.values()];
    expect(Object.fromEntries(hash ?? [])).toEqual({
      "signup-requested:footer": "1",
      "signup-refused:invalid": "1",
      beacons: "1",
    });
  });
});

describe("readDailyCounts", () => {
  it("returns listed counters above zero and the beacon tally", async () => {
    useUpstash();
    const { readDailyCounts } = await load();
    store.hashes.set(
      KEY,
      new Map([
        ["arrive:deity:search", "12"],
        ["onward:deity:search", "3"],
        ["confirm:ok", "0"],
        ["beacons", "15"],
        ["not-a-counter", "99"],
        ["arrive:home:direct", "abc"],
      ]),
    );
    expect(await readDailyCounts(DAY)).toEqual({
      counts: { "arrive:deity:search": 12, "onward:deity:search": 3 },
      beacons: 15,
    });
    expect(await readDailyCounts("2026-11-17")).toEqual({
      counts: {},
      beacons: 0,
    });
  });
});

describe("without Upstash", () => {
  it("keeps counts in memory outside production", async () => {
    const { readDailyCounts, recordDailyCount } = await load();
    expect(
      await recordDailyCount("arrive:story:search", { budgeted: true }, NOON),
    ).toEqual({ stored: true });
    expect(await readDailyCounts(DAY)).toEqual({
      counts: { "arrive:story:search": 1 },
      beacons: 1,
    });
    expect(store.touched).toBe(false);
  });

  it("fails closed in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { claimDayForward, readDailyCounts, recordDailyCount } = await load();
    expect(
      await recordDailyCount("arrive:story:search", { budgeted: true }, NOON),
    ).toEqual({ stored: false, reason: "not_configured" });
    expect(await recordDailyCount("confirm:ok", {}, NOON)).toEqual({
      stored: false,
      reason: "not_configured",
    });
    expect(await readDailyCounts(DAY)).toBeNull();
    expect(await claimDayForward(DAY)).toBeNull();
  });
});

describe("the forward claim", () => {
  it("is granted once per day and can be given back", async () => {
    useUpstash();
    const { claimDayForward, releaseDayForward } = await load();
    expect(await claimDayForward(DAY)).toBe(true);
    expect(await claimDayForward(DAY)).toBe(false);
    expect(await claimDayForward("2026-11-17")).toBe(true);
    await releaseDayForward(DAY);
    expect(await claimDayForward(DAY)).toBe(true);
  });

  it("works in memory outside production", async () => {
    const { claimDayForward, releaseDayForward } = await load();
    expect(await claimDayForward(DAY)).toBe(true);
    expect(await claimDayForward(DAY)).toBe(false);
    await releaseDayForward(DAY);
    expect(await claimDayForward(DAY)).toBe(true);
  });
});
