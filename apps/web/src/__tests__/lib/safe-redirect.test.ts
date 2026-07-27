import { describe, expect, it } from "vitest";
import { safeSameOriginRedirect } from "@/lib/safe-redirect";

describe("safeSameOriginRedirect", () => {
  const base = "https://mythosatlas.com/api/preview/exit";

  it("allows relative same-origin paths", () => {
    const url = safeSameOriginRedirect("/stories/zeus", base);
    expect(url.toString()).toBe("https://mythosatlas.com/stories/zeus");
  });

  it("rejects absolute external URLs", () => {
    const url = safeSameOriginRedirect("https://evil.example/phish", base);
    expect(url.toString()).toBe("https://mythosatlas.com/");
  });

  it("rejects protocol-relative URLs", () => {
    const url = safeSameOriginRedirect("//evil.example/phish", base);
    expect(url.toString()).toBe("https://mythosatlas.com/");
  });

  it("falls back when target is empty", () => {
    const url = safeSameOriginRedirect(null, base, "/pantheons");
    expect(url.toString()).toBe("https://mythosatlas.com/pantheons");
  });
});
