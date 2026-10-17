import { describe, expect, it } from "vitest";
import { isProductionHostname } from "@/lib/analytics/production-host";

describe("isProductionHostname", () => {
  it("accepts the live site", () => {
    expect(isProductionHostname("mythosatlas.com")).toBe(true);
    expect(isProductionHostname("www.mythosatlas.com")).toBe(true);
  });

  it("refuses local builds, previews and look-alikes", () => {
    for (const hostname of [
      "localhost",
      "127.0.0.1",
      "mythos-git-feature.vercel.app",
      "mythosatlas.com.evil.test",
      "staging.mythosatlas.com",
    ]) {
      expect(isProductionHostname(hostname), hostname).toBe(false);
    }
  });
});
