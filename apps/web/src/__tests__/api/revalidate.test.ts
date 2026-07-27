import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/revalidate/route";

describe("revalidate API route — disabled", () => {
  it("POST returns 410 Gone", async () => {
    const req = new NextRequest("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "publish", data: {} }),
    });
    const res = await POST();
    expect(res.status).toBe(410);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toMatch(/disabled/i);
  });

  it("GET returns 410 Gone", async () => {
    const res = await GET();
    expect(res.status).toBe(410);
  });
});
