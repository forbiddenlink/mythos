import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function postRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost:3000/api/quiz/generate-from-story", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "http://localhost:3000",
      host: "localhost:3000",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/quiz/generate-from-story", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_ORACLE_ENABLED", "true");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.doUnmock("@/lib/oracle/token-budget");
    vi.doUnmock("@/lib/oracle/global-budget");
  });

  it("reserves against the daily token budget and refuses when exhausted, before calling the model", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    const reserveOracleTokens = vi.fn().mockResolvedValue({
      allowed: false,
      reason: "budget_exhausted",
    });
    const settleOracleTokens = vi.fn();
    vi.doMock("@/lib/oracle/token-budget", () => ({
      estimateTokens: (s: string) => s.length,
      reserveOracleTokens,
      settleOracleTokens,
    }));

    const { POST } = await import("@/app/api/quiz/generate-from-story/route");
    const res = await POST(postRequest({ storySlug: "aeneid", count: 2 }));

    expect(res.status).toBe(429);
    expect(reserveOracleTokens).toHaveBeenCalledTimes(1);
    expect(settleOracleTokens).not.toHaveBeenCalled();
  });

  it("gives the global request slot back when the token budget refuses", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    const releaseGlobalOracleBudget = vi.fn().mockResolvedValue(undefined);
    vi.doMock("@/lib/oracle/global-budget", () => ({
      checkGlobalOracleBudget: vi
        .fn()
        .mockResolvedValue({ allowed: true, reservation: "quiz-key" }),
      releaseGlobalOracleBudget,
    }));
    vi.doMock("@/lib/oracle/token-budget", () => ({
      estimateTokens: (s: string) => s.length,
      reserveOracleTokens: vi
        .fn()
        .mockResolvedValue({ allowed: false, reason: "budget_exhausted" }),
      settleOracleTokens: vi.fn(),
    }));

    const { POST } = await import("@/app/api/quiz/generate-from-story/route");
    const res = await POST(postRequest({ storySlug: "aeneid", count: 2 }));

    expect(res.status).toBe(429);
    expect(releaseGlobalOracleBudget).toHaveBeenCalledWith({
      allowed: true,
      reservation: "quiz-key",
    });
  });

  it("returns 503 when the token budget store is misconfigured", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.doMock("@/lib/oracle/token-budget", () => ({
      estimateTokens: (s: string) => s.length,
      reserveOracleTokens: vi
        .fn()
        .mockResolvedValue({ allowed: false, reason: "misconfigured" }),
      settleOracleTokens: vi.fn(),
    }));

    const { POST } = await import("@/app/api/quiz/generate-from-story/route");
    const res = await POST(postRequest({ storySlug: "aeneid", count: 2 }));

    expect(res.status).toBe(503);
  });

  it("refuses with 503 while the Oracle flag is off, before any model call", async () => {
    vi.stubEnv("NEXT_PUBLIC_ORACLE_ENABLED", "false");
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    const { POST } = await import("@/app/api/quiz/generate-from-story/route");
    const res = await POST(postRequest({ storySlug: "titanomachy" }));
    expect(res.status).toBe(503);
  });

  it("returns 503 when Anthropic key is missing", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const { POST } = await import("@/app/api/quiz/generate-from-story/route");
    const req = new NextRequest(
      "http://localhost:3000/api/quiz/generate-from-story",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:3000",
          host: "localhost:3000",
        },
        body: JSON.stringify({ storySlug: "aeneid", count: 2 }),
      },
    );
    const res = await POST(req);
    expect(res.status).toBe(503);
  });

  it("returns 404 for unknown story slug", async () => {
    const { POST } = await import("@/app/api/quiz/generate-from-story/route");
    const req = new NextRequest(
      "http://localhost:3000/api/quiz/generate-from-story",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:3000",
          host: "localhost:3000",
        },
        body: JSON.stringify({ storySlug: "no-such-story-xyz", count: 1 }),
      },
    );
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("keys header-less requests per client instead of one shared anonymous bucket", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    const checkQuizRateLimit = vi
      .fn()
      .mockResolvedValue({ allowed: false, reason: "limited" });
    vi.doMock("@/lib/oracle/rate-limit", () => ({ checkQuizRateLimit }));

    const { POST } = await import("@/app/api/quiz/generate-from-story/route");
    const res = await POST(postRequest({ storySlug: "aeneid", count: 2 }));

    expect(res.status).toBe(429);
    expect(checkQuizRateLimit).toHaveBeenCalledTimes(1);
    expect(checkQuizRateLimit.mock.calls[0]![0]).toMatch(/^anon:/);
    vi.doUnmock("@/lib/oracle/rate-limit");
  });
});
