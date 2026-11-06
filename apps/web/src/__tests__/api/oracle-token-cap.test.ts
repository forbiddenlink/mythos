import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const budget = vi.hoisted(() => ({
  check: vi.fn(),
  release: vi.fn(),
  reserve: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logger: { exception: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock("@/lib/oracle/rate-limit", () => ({
  checkOracleRateLimit: vi.fn(() => Promise.resolve({ allowed: true })),
  checkOracleAnonymousRateLimit: vi.fn(() =>
    Promise.resolve({ allowed: true }),
  ),
}));
vi.mock("@/lib/oracle/grounding", () => ({
  getOracleGroundingForConversation: vi.fn(() =>
    Promise.resolve({
      context: "REFERENCE: Zeus",
      hitCount: 1,
      citations: [],
      primarySources: [],
    }),
  ),
}));
vi.mock("@/lib/oracle/global-budget", () => ({
  checkGlobalOracleBudget: budget.check,
  releaseGlobalOracleBudget: budget.release,
}));
vi.mock("@/lib/oracle/token-budget", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/oracle/token-budget")>()),
  reserveOracleTokens: budget.reserve,
}));

import { POST } from "@/app/api/oracle/route";

function oracleRequest(): NextRequest {
  return new NextRequest("http://localhost:3000/api/oracle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "http://localhost:3000",
      host: "localhost:3000",
    },
    body: JSON.stringify({ messages: [{ role: "user", content: "Zeus?" }] }),
  });
}

describe("Oracle route: token cap vs global request counter", () => {
  beforeEach(() => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.stubEnv("ORACLE_PROVIDER", "");
    vi.stubEnv("NEXT_PUBLIC_ORACLE_ENABLED", "true");
    budget.check.mockReset().mockResolvedValue({ allowed: true });
    budget.release.mockReset().mockResolvedValue(undefined);
    budget.reserve.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the request-counter slot when the token cap denies", async () => {
    budget.reserve.mockResolvedValue({
      allowed: false,
      reason: "budget_exhausted",
    });
    const res = await POST(oracleRequest());
    expect(res.status).toBe(429);
    expect(budget.check).toHaveBeenCalledTimes(1);
    expect(budget.release).toHaveBeenCalledTimes(1);
  });

  it("keeps failing closed when the token budget is misconfigured", async () => {
    budget.reserve.mockResolvedValue({
      allowed: false,
      reason: "misconfigured",
    });
    const res = await POST(oracleRequest());
    expect(res.status).toBe(503);
    expect(budget.release).toHaveBeenCalledTimes(1);
  });

  it("does not release when the request counter itself denies", async () => {
    budget.check.mockResolvedValue({
      allowed: false,
      reason: "budget_exhausted",
    });
    const res = await POST(oracleRequest());
    expect(res.status).toBe(429);
    expect(budget.reserve).not.toHaveBeenCalled();
    expect(budget.release).not.toHaveBeenCalled();
  });
});
