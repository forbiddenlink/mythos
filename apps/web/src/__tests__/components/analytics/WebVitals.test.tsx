import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const handlers: Array<(m: unknown) => void> = [];
vi.mock("web-vitals", () => {
  const reg = (cb: (m: unknown) => void) => handlers.push(cb);
  return { onCLS: reg, onFCP: reg, onINP: reg, onLCP: reg, onTTFB: reg };
});
vi.mock("@/components/analytics/ConsentGatedPostHog", () => ({
  getPostHogDistinctId: () => "id",
}));
vi.mock("@/lib/privacy-consent", () => ({ hasAnalyticsConsent: () => true }));

import { WebVitals } from "@/components/analytics/WebVitals";

const metric = {
  id: "1",
  name: "LCP",
  value: 1,
  rating: "good",
  delta: 1,
  navigationType: "navigate",
};

describe("WebVitals", () => {
  const beacon = vi.fn(() => true);
  beforeEach(() => {
    handlers.length = 0;
    beacon.mockClear();
    Object.defineProperty(navigator, "sendBeacon", {
      value: beacon,
      configurable: true,
    });
  });
  afterEach(() => vi.unstubAllEnvs());

  it("does not POST when PostHog is not configured", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    render(<WebVitals />);
    for (const h of handlers) h(metric);
    expect(beacon).not.toHaveBeenCalled();
  });

  it("POSTs to the vitals route when configured and consented", () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    render(<WebVitals />);
    for (const h of handlers) h(metric);
    expect(beacon).toHaveBeenCalledWith(
      "/api/analytics/vitals",
      expect.any(String),
    );
  });
});
