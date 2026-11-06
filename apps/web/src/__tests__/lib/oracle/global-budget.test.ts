import { afterEach, describe, expect, it, vi } from "vitest";

const incr = vi.fn();
const expire = vi.fn();
const decr = vi.fn();

vi.mock("@upstash/redis", () => ({
  Redis: class {
    incr = incr;
    expire = expire;
    decr = decr;
  },
}));

import {
  checkGlobalOracleBudget,
  releaseGlobalOracleBudget,
} from "@/lib/oracle/global-budget";

describe("checkGlobalOracleBudget", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    incr.mockReset();
    expire.mockReset();
    decr.mockReset();
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
    expect(await checkGlobalOracleBudget("oracle")).toEqual({
      allowed: true,
      reservation: expect.stringMatching(/^mythos:oracle:daily:/),
    });
  });

  it("release decrements the same daily key it incremented", async () => {
    configure("500");
    incr.mockResolvedValue(1);
    const admission = await checkGlobalOracleBudget();
    if (!admission.allowed) throw new Error("expected admission");
    await releaseGlobalOracleBudget(admission);
    expect(decr).toHaveBeenCalledWith(incr.mock.calls[0]![0]);
  });

  it("release refunds the day it reserved, even after UTC midnight", async () => {
    configure("500");
    incr.mockResolvedValue(1);
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-11-06T23:59:59.900Z"));
      const admission = await checkGlobalOracleBudget();
      if (!admission.allowed) throw new Error("expected admission");
      vi.setSystemTime(new Date("2026-11-07T00:00:00.100Z"));
      await releaseGlobalOracleBudget(admission);
    } finally {
      vi.useRealTimers();
    }
    expect(decr).toHaveBeenCalledWith("mythos:oracle:daily:2026-11-06");
  });

  it("release does nothing when the admission reserved no counter", async () => {
    await releaseGlobalOracleBudget({ allowed: true });
    expect(decr).not.toHaveBeenCalled();
  });

  it("release swallows a Redis failure", async () => {
    configure("500");
    decr.mockRejectedValue(new Error("down"));
    await expect(
      releaseGlobalOracleBudget({
        allowed: true,
        reservation: "mythos:oracle:daily:2026-11-06",
      }),
    ).resolves.toBeUndefined();
  });
});
