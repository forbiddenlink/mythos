import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

function postRequest(body: Record<string, unknown>) {
  return new NextRequest(
    "http://localhost:3000/api/quiz/generate-from-story",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "http://localhost:3000",
        host: "localhost:3000",
      },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/quiz/generate-from-story", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.doUnmock("@/lib/oracle/token-budget");
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
});
