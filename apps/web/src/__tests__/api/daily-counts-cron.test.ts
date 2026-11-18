import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";

const store = await vi.hoisted(async () =>
  (await import("../helpers/fake-upstash")).createFakeRedis(),
);

vi.mock("@upstash/redis", async () =>
  (await import("../helpers/fake-upstash")).fakeRedisModule(store),
);

import { GET } from "@/app/api/cron/daily-counts/route";
import { handleDailyCountsRequest } from "@/lib/server/daily-count-report";

const ORIGINAL_ENV = { ...process.env };
const SECRET = "cron-secret-for-tests";
const NOW = new Date("2026-11-19T00:23:00.000Z");
const YESTERDAY = "2026-11-18";
const ENV = { CRON_SECRET: SECRET };

function get(query = "", bearer: string | null = SECRET): Request {
  return new Request(`http://localhost:3000/api/cron/daily-counts${query}`, {
    headers: bearer === null ? {} : { authorization: `Bearer ${bearer}` },
  });
}

function seed(day: string, fields: Record<string, string>) {
  store.hashes.set(`mythos:count:${day}`, new Map(Object.entries(fields)));
}

let fetchSpy: MockInstance<typeof fetch>;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "token";
  process.env.POSTHOG_KEY = "phc_test";
  delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
  delete process.env.POSTHOG_HOST;
  delete process.env.POSTHOG_INGEST_ORIGIN;
  store.reset();
  fetchSpy = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async () => new Response("{}", { status: 200 }));
});

afterEach(() => {
  vi.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
});

describe("daily counts read-out: access", () => {
  it("answers 501 while CRON_SECRET is unset", async () => {
    const res = await handleDailyCountsRequest(get(), {}, NOW);
    expect(res.status).toBe(501);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("answers 401 without the bearer or with a wrong one", async () => {
    expect(
      (await handleDailyCountsRequest(get("", null), ENV, NOW)).status,
    ).toBe(401);
    expect(
      (await handleDailyCountsRequest(get("", "wrong"), ENV, NOW)).status,
    ).toBe(401);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("the route reads CRON_SECRET from the environment", async () => {
    delete process.env.CRON_SECRET;
    expect((await GET(get())).status).toBe(501);
    process.env.CRON_SECRET = SECRET;
    expect((await GET(get("", "wrong"))).status).toBe(401);
  });

  it("refuses a malformed day", async () => {
    const res = await handleDailyCountsRequest(get("?day=yesterday"), ENV, NOW);
    expect(res.status).toBe(400);
  });
});

describe("daily counts read-out: forward", () => {
  it("sends yesterday's totals to PostHog once, as back-dated anonymous events", async () => {
    seed(YESTERDAY, {
      "arrive:gods-of:search": "40",
      "onward:gods-of:search": "9",
      "confirm:ok": "2",
      beacons: "49",
    });

    const res = await handleDailyCountsRequest(get(), ENV, NOW);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      day: YESTERDAY,
      counts: {
        "arrive:gods-of:search": 40,
        "onward:gods-of:search": 9,
        "confirm:ok": 2,
      },
      beacons: 49,
      forwarded: "sent",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] ?? [];
    expect(url).toBe("https://us.i.posthog.com/batch/");
    const sent = JSON.parse(String(init?.body));
    expect(sent.api_key).toBe("phc_test");
    expect(sent.batch).toEqual([
      {
        event: "daily_total",
        timestamp: "2026-11-18T12:00:00.000Z",
        properties: {
          day: YESTERDAY,
          counter: "arrive:gods-of:search",
          total: 40,
          step: "arrive",
          page: "gods-of",
          source: "search",
          app: "mythos",
          $process_person_profile: false,
          distinct_id: "daily-count",
        },
      },
      {
        event: "daily_total",
        timestamp: "2026-11-18T12:00:00.000Z",
        properties: {
          day: YESTERDAY,
          counter: "onward:gods-of:search",
          total: 9,
          step: "onward",
          page: "gods-of",
          source: "search",
          app: "mythos",
          $process_person_profile: false,
          distinct_id: "daily-count",
        },
      },
      {
        event: "daily_total",
        timestamp: "2026-11-18T12:00:00.000Z",
        properties: {
          day: YESTERDAY,
          counter: "confirm:ok",
          total: 2,
          app: "mythos",
          $process_person_profile: false,
          distinct_id: "daily-count",
        },
      },
    ]);

    // The claim now lasts as long as the day's totals.
    expect(store.ttls.get(`mythos:count-forwarded:${YESTERDAY}`)).toBe(
      60 * 60 * 24 * 40,
    );

    // A second delivery of the same cron run reads the totals but sends nothing.
    const again = await handleDailyCountsRequest(get(), ENV, NOW);
    expect(again.status).toBe(200);
    expect((await again.json()).forwarded).toBe("already_sent");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("reads a named day and never forwards a day that is not finished", async () => {
    seed("2026-11-19", { "arrive:home:direct": "3", beacons: "3" });
    const res = await handleDailyCountsRequest(
      get("?day=2026-11-19"),
      ENV,
      NOW,
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      day: "2026-11-19",
      counts: { "arrive:home:direct": 3 },
      forwarded: "day_not_finished",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sends nothing for an empty day", async () => {
    const res = await handleDailyCountsRequest(get(), ENV, NOW);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      counts: {},
      beacons: 0,
      forwarded: "nothing_to_send",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("answers 502 and frees the claim when PostHog refuses, so the next run retries", async () => {
    seed(YESTERDAY, { "confirm-view": "4", beacons: "4" });
    fetchSpy.mockImplementationOnce(
      async () => new Response("nope", { status: 500 }),
    );
    const failed = await handleDailyCountsRequest(get(), ENV, NOW);
    expect(failed.status).toBe(502);
    expect(await failed.json()).toMatchObject({
      ok: false,
      counts: { "confirm-view": 4 },
      forwarded: "failed",
    });

    const retry = await handleDailyCountsRequest(get(), ENV, NOW);
    expect(retry.status).toBe(200);
    expect((await retry.json()).forwarded).toBe("sent");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("answers 502 without sending when analytics has no key", async () => {
    delete process.env.POSTHOG_KEY;
    seed(YESTERDAY, { "confirm-view": "1", beacons: "1" });
    const res = await handleDailyCountsRequest(get(), ENV, NOW);
    expect(res.status).toBe(502);
    expect(fetchSpy).not.toHaveBeenCalled();
    // The claim was given back.
    expect(store.kv.size).toBe(0);
  });

  it("answers 503 when the store cannot be read", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.stubEnv("NODE_ENV", "production");
    const res = await handleDailyCountsRequest(get(), ENV, NOW);
    vi.unstubAllEnvs();
    expect(res.status).toBe(503);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
