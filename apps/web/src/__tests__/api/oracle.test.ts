import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ORACLE_GROUNDING_HITS_HEADER } from "@/lib/oracle/constants";

vi.mock("@/lib/logger", () => ({
  logger: { exception: vi.fn(), info: vi.fn() },
}));

vi.mock("@/lib/oracle/rate-limit", () => ({
  checkOracleRateLimit: vi.fn(() => Promise.resolve(true)),
}));

vi.mock("@/lib/oracle/grounding", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/oracle/grounding")>();
  return {
    ...actual,
    getOracleGrounding: vi.fn(() =>
      Promise.resolve({ context: "", hitCount: 0, citations: [] }),
    ),
  };
});

const { streamText, toTextStreamResponse } = vi.hoisted(() => {
  const toTextStreamResponse = vi.fn(() => {
    const h = new Headers();
    h.set(ORACLE_GROUNDING_HITS_HEADER, "0");
    return new Response("The ancients knew.", { status: 200, headers: h });
  });
  const streamText = vi.fn((_options: unknown) => ({
    toTextStreamResponse,
  }));
  return { streamText, toTextStreamResponse };
});

vi.mock("ai", () => ({
  streamText,
}));

vi.mock("@ai-sdk/anthropic", () => ({
  anthropic: vi.fn(() => ({})),
}));

import { POST } from "@/app/api/oracle/route";
import { checkOracleRateLimit } from "@/lib/oracle/rate-limit";

describe("Oracle API route", () => {
  beforeEach(() => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    toTextStreamResponse.mockClear();
    streamText.mockClear();
    vi.mocked(checkOracleRateLimit).mockResolvedValue(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function oracleRequest(
    body: unknown,
    init?: { origin?: string; host?: string },
  ): NextRequest {
    const headers = new Headers({ "Content-Type": "application/json" });
    if (init?.origin) headers.set("origin", init.origin);
    if (init?.host) headers.set("host", init.host);
    return new NextRequest("http://localhost:3000/api/oracle", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  }

  it("returns 400 for invalid body", async () => {
    const req = oracleRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("Invalid request body");
  });

  it("returns 403 when Origin host does not match Host", async () => {
    const req = oracleRequest(
      { messages: [{ role: "user", content: "Hello" }] },
      { origin: "https://evil.example", host: "localhost:3000" },
    );
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(checkOracleRateLimit).mockResolvedValueOnce(false);
    const req = oracleRequest({
      messages: [{ role: "user", content: "Hello" }],
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toMatch(/rest/i);
  });

  it("returns 503 when ANTHROPIC_API_KEY is missing", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const req = oracleRequest({
      messages: [{ role: "user", content: "Hello" }],
    });
    const res = await POST(req);
    expect(res.status).toBe(503);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toMatch(/awakened|API key/i);
  });

  it("returns 200 stream when successful", async () => {
    const req = oracleRequest({
      messages: [{ role: "user", content: "Who is Zeus?" }],
      locale: "en",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(streamText).toHaveBeenCalled();
    const text = await res.text();
    expect(text).toContain("ancients");
    expect(res.headers.get(ORACLE_GROUNDING_HITS_HEADER)).toBe("0");
  });
});
