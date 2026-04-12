import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

describe("revalidate API route — production auth", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("POST returns 503 when webhook secret is not configured in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VITEST", "");
    vi.stubEnv("HYGRAPH_WEBHOOK_SECRET", "");
    const { POST } = await import("@/app/api/revalidate/route");
    const req = new NextRequest("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "publish", data: {} }),
    });
    const res = await POST(req);
    expect(res.status).toBe(503);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("Webhook not configured");
  });

  it("POST returns 401 when signature does not match in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VITEST", "");
    vi.stubEnv("HYGRAPH_WEBHOOK_SECRET", "expected-secret");
    const { POST } = await import("@/app/api/revalidate/route");
    const req = new NextRequest("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hygraph-signature": "wrong",
      },
      body: JSON.stringify({ operation: "publish", data: {} }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("GET returns 503 when REVALIDATE_SECRET is not set in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VITEST", "");
    vi.stubEnv("REVALIDATE_SECRET", "");
    const { GET } = await import("@/app/api/revalidate/route");
    const req = new NextRequest("http://localhost:3000/api/revalidate");
    const res = await GET(req);
    expect(res.status).toBe(503);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("Manual revalidation not configured");
  });
});
