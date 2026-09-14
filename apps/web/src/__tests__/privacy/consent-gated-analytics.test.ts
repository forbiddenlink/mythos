import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const srcRoot = join(__dirname, "..", "..");

describe("analytics consent", () => {
  it("does not mount Vercel Analytics in the root layout", () => {
    const layout = readFileSync(join(srcRoot, "app/layout.tsx"), "utf8");
    expect(layout).not.toMatch(/from ["']@vercel\/analytics/);
    expect(layout).not.toMatch(/from ["']@vercel\/speed-insights/);
    expect(layout).not.toMatch(/<Analytics\s*\/>/);
    expect(layout).not.toMatch(/<SpeedInsights\s*\/>/);
  });

  it("keeps a consent-gated analytics component", () => {
    const gated = readFileSync(
      join(srcRoot, "components/analytics/ConsentGatedAnalytics.tsx"),
      "utf8",
    );
    expect(gated).toMatch(/hasAnalyticsConsent/);
    expect(gated).toMatch(/<Analytics\s*\/>/);
  });
});
