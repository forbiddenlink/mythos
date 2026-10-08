import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetAnalyticsSink, trackEvent } from "@/lib/analytics/events";
import { notifyCookieConsentChanged } from "@/lib/privacy-consent";
import { ConsentGatedPostHog } from "@/components/analytics/ConsentGatedPostHog";

const posthog = vi.hoisted(() => ({
  init: vi.fn(),
  register: vi.fn(),
  capture: vi.fn(),
  opt_in_capturing: vi.fn(),
  opt_out_capturing: vi.fn(),
}));
vi.mock("posthog-js", () => ({ default: posthog }));
vi.mock("next/navigation", () => ({ usePathname: () => "/paths" }));

function consent(value: "accepted" | "rejected"): void {
  act(() => {
    localStorage.setItem("mythos-cookie-consent", value);
    notifyCookieConsentChanged();
  });
}

describe("PostHog consent lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    resetAnalyticsSink();
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    Object.defineProperty(navigator, "globalPrivacyControl", {
      configurable: true,
      value: false,
    });
  });
  afterEach(() => {
    cleanup();
    resetAnalyticsSink();
    vi.unstubAllEnvs();
  });

  it("does not initialize after consent is withdrawn while the SDK loads", async () => {
    render(<ConsentGatedPostHog />);
    consent("accepted");
    consent("rejected");
    await act(async () => {
      await Promise.resolve();
    });
    expect(posthog.init).not.toHaveBeenCalled();
    trackEvent("support_click", { placement: "cancelled-load" });
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it("drops pre-consent events and resumes only new events after reacceptance", async () => {
    render(<ConsentGatedPostHog />);
    trackEvent("support_click", { placement: "before" });
    expect(posthog.capture).not.toHaveBeenCalled();
    consent("accepted");
    await waitFor(() => expect(posthog.init).toHaveBeenCalledTimes(1));
    trackEvent("support_click", { placement: "first" });
    expect(posthog.capture).toHaveBeenLastCalledWith("support_click", {
      placement: "first",
    });
    consent("rejected");
    trackEvent("support_click", { placement: "withdrawn" });
    expect(posthog.capture).toHaveBeenCalledTimes(1);
    expect(posthog.opt_out_capturing).toHaveBeenCalled();
    consent("accepted");
    trackEvent("support_click", { placement: "resumed" });
    expect(posthog.opt_in_capturing).toHaveBeenCalledWith({
      captureEventName: false,
    });
    expect(posthog.capture).toHaveBeenCalledTimes(2);
    expect(posthog.capture).toHaveBeenLastCalledWith("support_click", {
      placement: "resumed",
    });
    expect(posthog.init).toHaveBeenCalledTimes(1);
  });

  it("never connects a sink when Global Privacy Control overrides accepted consent", () => {
    Object.defineProperty(navigator, "globalPrivacyControl", {
      configurable: true,
      value: true,
    });
    localStorage.setItem("mythos-cookie-consent", "accepted");
    render(<ConsentGatedPostHog />);
    trackEvent("support_click", { placement: "gpc" });
    expect(posthog.capture).not.toHaveBeenCalled();
    expect(posthog.opt_in_capturing).not.toHaveBeenCalled();
  });
});
