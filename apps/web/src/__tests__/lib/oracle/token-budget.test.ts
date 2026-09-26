import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redisStore = vi.hoisted(() => new Map<string, number>());

vi.mock("@upstash/redis", () => ({
  Redis: class {
    async incrby(key: string, n: number) {
      const v = (redisStore.get(key) ?? 0) + n;
      redisStore.set(key, v);
      return v;
    }
    async decrby(key: string, n: number) {
      const v = (redisStore.get(key) ?? 0) - n;
      redisStore.set(key, v);
      return v;
    }
    async expire() {
      return 1;
    }
  },
}));

import {
  __memoryTokensUsedToday,
  __resetOracleTokenBudgetForTests,
  DEFAULT_DAILY_TOKEN_CAP,
  dailyTokenCap,
  estimateOracleRequestTokens,
  estimateTokens,
  reserveOracleTokens,
  settleOracleTokens,
} from "@/lib/oracle/token-budget";

describe("oracle token budget", () => {
  beforeEach(() => {
    __resetOracleTokenBudgetForTests();
    redisStore.clear();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("estimates tokens pessimistically and includes the output ceiling", () => {
    expect(estimateTokens("")).toBe(0);
    expect(estimateTokens("abcdef")).toBe(2);
    const est = estimateOracleRequestTokens({
      system: "s".repeat(300),
      messages: [{ content: "m".repeat(30) }],
      maxOutputTokens: 800,
    });
    expect(est).toBe(100 + 10 + 4 + 800);
  });

  it("reads ORACLE_DAILY_TOKEN_CAP with a sane default", () => {
    expect(dailyTokenCap()).toBe(DEFAULT_DAILY_TOKEN_CAP);
    vi.stubEnv("ORACLE_DAILY_TOKEN_CAP", "5000");
    expect(dailyTokenCap()).toBe(5000);
    vi.stubEnv("ORACLE_DAILY_TOKEN_CAP", "nonsense");
    expect(dailyTokenCap()).toBe(DEFAULT_DAILY_TOKEN_CAP);
  });

  it("reserves in development without Upstash and rejects past the cap", async () => {
    vi.stubEnv("ORACLE_DAILY_TOKEN_CAP", "1000");
    const first = await reserveOracleTokens(600);
    expect(first.allowed).toBe(true);
    const second = await reserveOracleTokens(600);
    expect(second).toEqual({ allowed: false, reason: "budget_exhausted" });
    expect(__memoryTokensUsedToday()).toBe(600);
  });

  it("settles a reservation to the actual usage", async () => {
    const r = await reserveOracleTokens(900);
    if (!r.allowed) throw new Error("expected reservation");
    await settleOracleTokens(r.reservation, 250);
    expect(__memoryTokensUsedToday()).toBe(250);
  });

  it("keeps the estimate when actual usage is unknown", async () => {
    const r = await reserveOracleTokens(900);
    if (!r.allowed) throw new Error("expected reservation");
    await settleOracleTokens(r.reservation, undefined);
    expect(__memoryTokensUsedToday()).toBe(900);
  });

  it("fails closed in production without Upstash", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(reserveOracleTokens(10)).resolves.toEqual({
      allowed: false,
      reason: "misconfigured",
    });
  });

  describe("with Upstash", () => {
    beforeEach(() => {
      vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
      vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
      vi.stubEnv("ORACLE_DAILY_TOKEN_CAP", "1000");
    });

    it("reserves atomically and releases a rejected reservation", async () => {
      expect((await reserveOracleTokens(700)).allowed).toBe(true);
      expect(await reserveOracleTokens(700)).toEqual({
        allowed: false,
        reason: "budget_exhausted",
      });
      const [value] = [...redisStore.values()];
      expect(value).toBe(700);
    });

    it("applies the settlement delta to the shared counter", async () => {
      const r = await reserveOracleTokens(700);
      if (!r.allowed) throw new Error("expected reservation");
      await settleOracleTokens(r.reservation, 200);
      const [value] = [...redisStore.values()];
      expect(value).toBe(200);
      expect((await reserveOracleTokens(700)).allowed).toBe(true);
    });
  });
});
