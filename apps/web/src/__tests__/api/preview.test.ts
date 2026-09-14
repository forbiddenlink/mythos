import { describe, expect, it } from "vitest";
import { GET as previewGet } from "@/app/api/preview/route";
import { GET as previewExitGet } from "@/app/api/preview/exit/route";

describe("Hygraph preview routes — disabled", () => {
  it("GET /api/preview returns 410 Gone", async () => {
    const res = await previewGet();
    expect(res.status).toBe(410);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toMatch(/disabled/i);
  });

  it("GET /api/preview/exit returns 410 Gone", async () => {
    const res = await previewExitGet();
    expect(res.status).toBe(410);
  });
});
