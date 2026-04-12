import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/oracle/semantic", () => ({
  semanticSearchResults: vi.fn().mockResolvedValue([]),
}));

describe("POST /api/search", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("returns merged lexical results for a deity name", async () => {
    const { POST } = await import("@/app/api/search/route");
    const req = new NextRequest("http://localhost:3000/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "Zeus", limit: 10 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      results: Array<{ slug: string; title: string }>;
    };
    expect(json.results.some((r) => r.slug === "zeus")).toBe(true);
  });

  it("returns 400 for invalid body", async () => {
    const { POST } = await import("@/app/api/search/route");
    const req = new NextRequest("http://localhost:3000/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
