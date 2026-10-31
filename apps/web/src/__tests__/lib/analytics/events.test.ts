import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ANALYTICS_EVENTS,
  isAnalyticsEventName,
  hasValidLearningEventProperties,
  normalizeSearchTerm,
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

  it("drops events without consent instead of holding them for later", () => {
    trackEvent("support_click", { placement: "before-consent" });
    localStorage.setItem("mythos-cookie-consent", "accepted");
    const sink = vi.fn();
    setAnalyticsSink(sink);

    expect(sink).not.toHaveBeenCalled();
  });

  it("delivers events tracked by a consenting visitor while the SDK is still loading", () => {
    localStorage.setItem("mythos-cookie-consent", "accepted");
    trackEvent("support_page_viewed", { from: "support_page" });
    const sink = vi.fn();
    setAnalyticsSink(sink);

    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink).toHaveBeenCalledWith("support_page_viewed", {
      from: "support_page",
    });
    sink.mockClear();
    setAnalyticsSink(sink);
    expect(sink).not.toHaveBeenCalled();
  });

  it("discards held events when consent is withdrawn before the SDK loads", () => {
    localStorage.setItem("mythos-cookie-consent", "accepted");
    trackEvent("support_click", { placement: "footer" });
    resetAnalyticsSink();
    const sink = vi.fn();
    setAnalyticsSink(sink);

    expect(sink).not.toHaveBeenCalled();
  });

  it("holds at most a small number of events while the SDK loads", () => {
    localStorage.setItem("mythos-cookie-consent", "accepted");
    for (let i = 0; i < 50; i += 1) {
      trackEvent("support_click", { placement: `p${i}` });
    }
    const sink = vi.fn();
    setAnalyticsSink(sink);

    expect(sink).toHaveBeenCalledTimes(20);
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

describe("learning click event contracts", () => {
  it("accepts a real selected stop, including the last stop without claiming completion", () => {
    expect(
      hasValidLearningEventProperties("journey_stop_selected", {
        journeySlug: "odysseus-journey",
        stopIndex: 8,
        stopCount: 8,
      }),
    ).toBe(true);
  });
  it.each([
    { journeySlug: "odysseus-journey", stopIndex: 0, stopCount: 8 },
    { journeySlug: "odysseus-journey", stopIndex: 9, stopCount: 8 },
    { journeySlug: "odysseus-journey", stopIndex: 1.5, stopCount: 8 },
    { journeySlug: "reader typed text", stopIndex: 1, stopCount: 8 },
    { journeySlug: "a".repeat(101), stopIndex: 1, stopCount: 8 },
    { journeySlug: "odysseus", stopIndex: 1e100, stopCount: 1e100 },
    { journeySlug: "odysseus", stopIndex: 1, stopCount: 1001 },
    {
      journeySlug: "odysseus-journey",
      stopIndex: 1,
      stopCount: 8,
      raw: "private",
    },
  ])("rejects an invalid or extra stop payload %j", (properties) => {
    expect(
      hasValidLearningEventProperties("journey_stop_selected", properties),
    ).toBe(false);
  });
  it("drops invalid learning events before sending them to a browser sink", () => {
    const sink = vi.fn();
    setAnalyticsSink(sink);
    trackEvent("journey_stop_selected", {
      journeySlug: "odysseus",
      stopIndex: 3,
      stopCount: 2,
    });
    expect(sink).not.toHaveBeenCalled();
    resetAnalyticsSink();
  });
  it("validates goal and action without sending personalized preferences or path names", () => {
    const valid = {
      goal: "pantheon-mastery",
      entityType: "deity",
      slug: "odin",
      action: "continue",
    };
    expect(
      hasValidLearningEventProperties("learning_path_step_selected", valid),
    ).toBe(true);
    for (const invalid of [
      { ...valid, goal: "raw text" },
      { ...valid, action: "completed" },
      { ...valid, entityType: "unknown" },
      { ...valid, slug: "a".repeat(101) },
      { ...valid, preferences: "private" },
    ]) {
      expect(
        hasValidLearningEventProperties("learning_path_step_selected", invalid),
      ).toBe(false);
    }
  });
});

describe("zero-result search term", () => {
  it("normalises a term to lowercase and collapsed whitespace", () => {
    expect(normalizeSearchTerm("  Maui  ")).toBe("maui");
    expect(normalizeSearchTerm("Ｚｅｕｓ")).toBe("zeus");
  });

  it("refuses over-long input instead of truncating it", () => {
    expect(normalizeSearchTerm("x".repeat(60))).toBe("x".repeat(60));
    expect(normalizeSearchTerm("x".repeat(61))).toBeNull();
    // An email whose "@" would sit past the cap must not leak its prefix.
    expect(normalizeSearchTerm(`${"a".repeat(70)}@example.com`)).toBeNull();
    expect(normalizeSearchTerm(`${"b".repeat(65)}://evil.example`)).toBeNull();
  });

  it.each(["example.com", "loki@x", "a/b", "q=loki", "what?", "zeus2", "r2d2"])(
    "rejects punctuation and digits: %j",
    (raw) => {
      expect(normalizeSearchTerm(raw)).toBeNull();
    },
  );

  it("rejects digits split by letters and any multi-word term", () => {
    expect(normalizeSearchTerm("call five five 5 5 5 1 2 3")).toBeNull();
    expect(normalizeSearchTerm("a1b2c3d4e5f6")).toBeNull();
    expect(normalizeSearchTerm("one two three four five six")).toBeNull();
    expect(normalizeSearchTerm("maui hook")).toBeNull();
  });

  it("never sends a typed full name", () => {
    expect(normalizeSearchTerm("jane doe")).toBeNull();
    expect(normalizeSearchTerm("Jane  Doe")).toBeNull();
    expect(
      hasValidLearningEventProperties("search_no_results", {
        term: "jane doe",
      }),
    ).toBe(false);
  });

  it.each([
    ["Ζεύς", "ζεύς"],
    ["Ἀθηνᾶ", "ἀθηνᾶ"],
    ["इन्द्र", "इन्द्र"],
    ["Ma'ui", "ma'ui"],
    ["Ra-Horakhty", "ra-horakhty"],
  ])("keeps mythology names in any script: %j", (raw, expected) => {
    expect(normalizeSearchTerm(raw)).toBe(expected);
  });

  it.each([
    "",
    " ",
    "a",
    "me@example.com",
    "https://example.com/page",
    "www.example.com",
    "call 5551234567",
    "x".repeat(200),
  ])("refuses to record %j", (raw) => {
    expect(normalizeSearchTerm(raw)).toBeNull();
  });

  it("accepts a plain term and rejects extra fields or oversize terms", () => {
    expect(
      hasValidLearningEventProperties("search_no_results", { term: "loki" }),
    ).toBe(true);
    for (const invalid of [
      { term: "loki", raw: "x" },
      { term: "" },
      { term: "a".repeat(61) },
      { term: "me@example.com" },
      { term: 5 },
      {},
    ]) {
      expect(
        hasValidLearningEventProperties("search_no_results", invalid),
      ).toBe(false);
    }
  });

  it("sends the term through the sink as a plain string property", () => {
    const sink = vi.fn();
    setAnalyticsSink(sink);
    trackEvent("search_no_results", { term: "loki" });
    expect(sink).toHaveBeenCalledWith("search_no_results", { term: "loki" });
    resetAnalyticsSink();
  });
});
