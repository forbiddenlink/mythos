import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ANALYTICS_EVENTS,
  isAnalyticsEventName,
  resetAnalyticsSink,
  setAnalyticsSink,
  trackEvent,
} from "@/lib/analytics/events";

describe("analytics event taxonomy", () => {
  beforeEach(() => {
    resetAnalyticsSink();
    localStorage.clear();
  });

  it("exposes a closed set of event names", () => {
    expect(ANALYTICS_EVENTS.length).toBeGreaterThan(0);
    expect(new Set(ANALYTICS_EVENTS).size).toBe(ANALYTICS_EVENTS.length);
    for (const name of ANALYTICS_EVENTS) {
      // snake_case only — PostHog groups badly on mixed casing
      expect(name).toMatch(/^[a-z][a-z0-9_]*$/);
    }
  });

  it("validates event names at runtime", () => {
    expect(isAnalyticsEventName("support_click")).toBe(true);
    expect(isAnalyticsEventName("newsletter_signup")).toBe(true);
    expect(isAnalyticsEventName("definitely_not_an_event")).toBe(false);
  });

  it("drops events when no sink is registered", () => {
    expect(() =>
      trackEvent("support_click", { placement: "footer" }),
    ).not.toThrow();
  });

  it("forwards name and properties to the registered sink", () => {
    const sink = vi.fn();
    setAnalyticsSink(sink);

    trackEvent("quiz_completed", {
      quizId: "mythology-quiz",
      score: 8,
      total: 10,
    });

    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink).toHaveBeenCalledWith("quiz_completed", {
      quizId: "mythology-quiz",
      score: 8,
      total: 10,
    });
  });

  it("never lets a throwing sink break the caller", () => {
    setAnalyticsSink(() => {
      throw new Error("posthog exploded");
    });

    expect(() =>
      trackEvent("support_click", { placement: "footer" }),
    ).not.toThrow();
  });

  it("strips properties whose values are not primitives", () => {
    const sink = vi.fn();
    setAnalyticsSink(sink);

    trackEvent("oracle_asked", {
      grounded: true,
      // @ts-expect-error deliberately passing a disallowed payload shape
      raw: { question: "who is Loki" },
    });

    expect(sink).toHaveBeenCalledWith("oracle_asked", { grounded: true });
  });
});
