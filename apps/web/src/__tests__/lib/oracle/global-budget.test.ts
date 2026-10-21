import { afterEach, describe, expect, it, vi } from "vitest";

const incr = vi.fn();
const expire = vi.fn();

vi.mock("@upstash/redis", () => ({
  Redis: class {
    incr = incr;
    expire = expire;
  },
}));

import { checkGlobalOracleBudget } from "@/lib/oracle/global-budget";

describe("checkGlobalOracleBudget", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    incr.mockReset();
    expire.mockReset();
  });

  function configure(cap: string) {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.test");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    vi.stubEnv("ORACLE_DAILY_REQUEST_CAP", cap);
  }

  it("counts oracle and quiz admissions in separate daily keys", async () => {
    configure("500");
    incr.mockResolvedValue(2);

    await checkGlobalOracleBudget();
    await checkGlobalOracleBudget("quiz");

    const keys = incr.mock.calls.map(([key]) => key as string);
    expect(keys[0]).toMatch(/^mythos:oracle:daily:\d{4}-\d{2}-\d{2}$/);
    expect(keys[1]).toMatch(/^mythos:quiz:daily:\d{4}-\d{2}-\d{2}$/);
  });

  it("refuses once a scope passes its cap without touching the other scope", async () => {
    configure("3");
    incr.mockImplementation(async (key: string) =>
      key.includes(":quiz:") ? 4 : 1,
    );

    expect(await checkGlobalOracleBudget("quiz")).toEqual({
      allowed: false,
      reason: "budget_exhausted",
    });
    expect(await checkGlobalOracleBudget("oracle")).toEqual({ allowed: true });
  });
});
