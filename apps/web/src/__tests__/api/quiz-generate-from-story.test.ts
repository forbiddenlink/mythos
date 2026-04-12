import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("POST /api/quiz/generate-from-story", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns 503 when Anthropic key is missing", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const { POST } = await import(
      "@/app/api/quiz/generate-from-story/route"
    );
    const req = new NextRequest(
      "http://localhost:3000/api/quiz/generate-from-story",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storySlug: "aeneid", count: 2 }),
      },
    );
    const res = await POST(req);
    expect(res.status).toBe(503);
  });

  it("returns 404 for unknown story slug", async () => {
    const { POST } = await import(
      "@/app/api/quiz/generate-from-story/route"
    );
    const req = new NextRequest(
      "http://localhost:3000/api/quiz/generate-from-story",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storySlug: "no-such-story-xyz", count: 1 }),
      },
    );
    const res = await POST(req);
    expect(res.status).toBe(404);
  });
});
