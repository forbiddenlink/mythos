import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { OracleGroundingResult } from "@/lib/oracle/grounding";

const state = vi.hoisted(() => ({
  reply: "The ancients knew. [Zeus](/deities/zeus) rules Olympus.",
  calls: [] as Array<{
    prompt: Array<{ role: string; content: unknown }>;
  }>,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    exception: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/oracle/rate-limit", () => ({
  checkOracleRateLimit: vi.fn(() => Promise.resolve({ allowed: true })),
  checkOracleAnonymousRateLimit: vi.fn(() =>
    Promise.resolve({ allowed: true }),
  ),
}));

const ZEUS_GROUNDING: OracleGroundingResult = {
  context:
    "REFERENCE (from Mythos Atlas):\n• Zeus (deity)\n  Path: /deities/zeus\n  Summary: King of the gods.",
  hitCount: 1,
  citations: [
    { type: "deity", slug: "zeus", title: "Zeus", path: "/deities/zeus" },
  ],
  primarySources: [{ title: "Hesiod, Theogony", locator: "71–73" }],
};

vi.mock("@/lib/oracle/grounding", () => ({
  getOracleGroundingForConversation: vi.fn(() =>
    Promise.resolve(ZEUS_GROUNDING),
  ),
}));

// A real AI SDK mock model, so the route's full streaming pipeline runs.
vi.mock("@ai-sdk/anthropic", async () => {
  const { MockLanguageModelV4 } = await import("ai/test");
  const model = new MockLanguageModelV4({
    doStream: async (options) => {
      state.calls.push({
        prompt: options.prompt as Array<{ role: string; content: unknown }>,
      });
      return {
        stream: new ReadableStream({
          start(controller) {
            controller.enqueue({ type: "stream-start", warnings: [] });
            controller.enqueue({ type: "text-start", id: "t1" });
            controller.enqueue({
              type: "text-delta",
              id: "t1",
              delta: state.reply,
            });
            controller.enqueue({ type: "text-end", id: "t1" });
            controller.enqueue({
              type: "finish",
              finishReason: { unified: "stop", raw: "end_turn" },
              usage: {
                inputTokens: {
                  total: 100,
                  noCache: 100,
                  cacheRead: 0,
                  cacheWrite: 0,
                },
                outputTokens: { total: 20, text: 20, reasoning: 0 },
              },
            });
            controller.close();
          },
        }),
      };
    },
  });
  return { anthropic: vi.fn(() => model) };
});

import { POST } from "@/app/api/oracle/route";
import { getOracleGroundingForConversation } from "@/lib/oracle/grounding";
import {
  checkOracleAnonymousRateLimit,
  checkOracleRateLimit,
} from "@/lib/oracle/rate-limit";
import { readOracleStream } from "@/lib/oracle/stream-client";
import { __resetOracleTokenBudgetForTests } from "@/lib/oracle/token-budget";

function oracleRequest(
  body: unknown,
  init?: {
    origin?: string | null;
    host?: string;
    headers?: Record<string, string>;
  },
): NextRequest {
  const headers = new Headers({ "Content-Type": "application/json" });
  const origin =
    init && "origin" in init ? init.origin : "http://localhost:3000";
  const host = init?.host ?? "localhost:3000";
  if (origin) headers.set("origin", origin);
  if (host) headers.set("host", host);
  for (const [k, v] of Object.entries(init?.headers ?? {})) headers.set(k, v);
  return new NextRequest("http://localhost:3000/api/oracle", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("Oracle API route", () => {
  beforeEach(() => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    vi.stubEnv("ORACLE_PROVIDER", "");
    state.calls.length = 0;
    state.reply = "The ancients knew. [Zeus](/deities/zeus) rules Olympus.";
    __resetOracleTokenBudgetForTests();
    vi.mocked(checkOracleRateLimit).mockResolvedValue({ allowed: true });
    vi.mocked(getOracleGroundingForConversation).mockResolvedValue(
      ZEUS_GROUNDING,
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 400 for invalid body", async () => {
    const res = await POST(oracleRequest({}));
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("Invalid request body");
  });

  it("returns 413 before parsing an oversized body", async () => {
    const res = await POST(
      oracleRequest({
        messages: [{ role: "user", content: "x".repeat(384 * 1024) }],
      }),
    );
    expect(res.status).toBe(413);
  });

  it("returns 403 when Origin header is missing", async () => {
    const res = await POST(
      oracleRequest(
        { messages: [{ role: "user", content: "Hello" }] },
        { origin: null },
      ),
    );
    expect(res.status).toBe(403);
  });

  it("returns 403 when Origin host does not match Host", async () => {
    const res = await POST(
      oracleRequest(
        { messages: [{ role: "user", content: "Hello" }] },
        { origin: "https://evil.example", host: "localhost:3000" },
      ),
    );
    expect(res.status).toBe(403);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(checkOracleRateLimit).mockResolvedValueOnce({
      allowed: false,
      reason: "rate_limited",
    });
    const res = await POST(
      oracleRequest(
        { messages: [{ role: "user", content: "Hello" }] },
        { headers: { "x-real-ip": "203.0.113.9" } },
      ),
    );
    expect(res.status).toBe(429);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toMatch(/rest/i);
  });

  it("returns 503 when rate limiting is misconfigured in production", async () => {
    vi.mocked(checkOracleAnonymousRateLimit).mockResolvedValueOnce({
      allowed: false,
      reason: "misconfigured",
    });
    const res = await POST(
      oracleRequest({ messages: [{ role: "user", content: "Hello" }] }),
    );
    expect(res.status).toBe(503);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toMatch(/rate limiting/i);
  });

  it("uses the per-IP bucket when an IP is known and the stricter anonymous bucket otherwise", async () => {
    await POST(
      oracleRequest(
        { messages: [{ role: "user", content: "Who is Zeus?" }] },
        { headers: { "x-real-ip": "203.0.113.9" } },
      ),
    );
    expect(checkOracleRateLimit).toHaveBeenCalledWith("203.0.113.9");

    await POST(
      oracleRequest(
        { messages: [{ role: "user", content: "Who is Zeus?" }] },
        { headers: { "user-agent": "curl/8" } },
      ),
    );
    expect(checkOracleAnonymousRateLimit).toHaveBeenCalledWith(
      expect.stringMatching(/^anon:[0-9a-f]{8}$/),
    );
  });

  it("returns 503 when ANTHROPIC_API_KEY is missing", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const res = await POST(
      oracleRequest({ messages: [{ role: "user", content: "Hello" }] }),
    );
    expect(res.status).toBe(503);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toMatch(/awakened|API key/i);
  });

  it("streams the answer with grounding metadata in the body, not headers", async () => {
    const res = await POST(
      oracleRequest({
        messages: [{ role: "user", content: "Who is Zeus?" }],
        locale: "en",
      }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Mythos-Citations")).toBeNull();
    expect(res.headers.get("content-type")).toMatch(/text\/event-stream/);

    const { text, sources } = await readOracleStream(res.body!);
    expect(text).toContain("[Zeus](/deities/zeus)");
    expect(sources).toEqual({
      hitCount: 1,
      entities: ZEUS_GROUNDING.citations,
      primarySources: ZEUS_GROUNDING.primarySources,
    });
    expect(state.calls).toHaveLength(1);
  });

  it("gives the model a grounding-only system prompt with the REFERENCE block", async () => {
    const res = await POST(
      oracleRequest({ messages: [{ role: "user", content: "Who is Zeus?" }] }),
    );
    await readOracleStream(res.body!);

    const system = state.calls[0]!.prompt.find((m) => m.role === "system");
    const content = String(system?.content);
    expect(content).toMatch(/Answer ONLY from the REFERENCE/);
    expect(content).toContain("Our sources don't cover that.");
    expect(content).toContain("Path: /deities/zeus");
    expect(content).toMatch(/markdown link/);
  });

  it("says 'not in our sources' without calling the model when grounding is empty", async () => {
    vi.mocked(getOracleGroundingForConversation).mockResolvedValueOnce({
      context: "",
      hitCount: 0,
      citations: [],
      primarySources: [],
    });
    const res = await POST(
      oracleRequest({
        messages: [{ role: "user", content: "Write me a Python script" }],
      }),
    );
    expect(res.status).toBe(200);
    const { text, sources } = await readOracleStream(res.body!);
    expect(text.startsWith("Our sources don't cover that.")).toBe(true);
    expect(sources?.hitCount).toBe(0);
    expect(state.calls).toHaveLength(0);
  });

  it("localises the not-in-sources reply", async () => {
    vi.mocked(getOracleGroundingForConversation).mockResolvedValueOnce({
      context: "",
      hitCount: 0,
      citations: [],
      primarySources: [],
    });
    const res = await POST(
      oracleRequest({
        messages: [{ role: "user", content: "¿Qué tiempo hace?" }],
        locale: "es",
      }),
    );
    const { text } = await readOracleStream(res.body!);
    expect(text.startsWith("Nuestras fuentes no cubren eso.")).toBe(true);
  });

  it("passes a model's own not-in-sources answer through unchanged", async () => {
    state.reply =
      "Our sources don't cover that. The Atlas tells of [Zeus](/deities/zeus), but not his breakfast.";
    const res = await POST(
      oracleRequest({
        messages: [{ role: "user", content: "What did Zeus eat?" }],
      }),
    );
    const { text } = await readOracleStream(res.body!);
    expect(text).toBe(state.reply);
  });

  it("trims long conversations before they reach the model", async () => {
    const history = Array.from({ length: 19 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `turn ${i} ${"x".repeat(1_000)}`,
    }));
    const res = await POST(
      oracleRequest({
        messages: [...history, { role: "user", content: "And Hera?" }],
      }),
    );
    await readOracleStream(res.body!);

    const convo = state.calls[0]!.prompt.filter((m) => m.role !== "system");
    expect(convo.length).toBeLessThanOrEqual(6);
    expect(convo[0]!.role).toBe("user");
    expect(JSON.stringify(convo.at(-1)!.content)).toContain("And Hera?");
  });

  it("returns 429 once the daily token budget is spent", async () => {
    vi.stubEnv("ORACLE_DAILY_TOKEN_CAP", "100");
    const res = await POST(
      oracleRequest({ messages: [{ role: "user", content: "Who is Zeus?" }] }),
    );
    expect(res.status).toBe(429);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toMatch(/capacity/i);
    expect(state.calls).toHaveLength(0);
  });

  it("does not silently switch to Groq when ORACLE_PROVIDER pins Anthropic", async () => {
    vi.stubEnv("ORACLE_PROVIDER", "anthropic");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("GROQ_API_KEY", "groq-key");
    const res = await POST(
      oracleRequest({ messages: [{ role: "user", content: "Who is Zeus?" }] }),
    );
    expect(res.status).toBe(503);
  });
});
