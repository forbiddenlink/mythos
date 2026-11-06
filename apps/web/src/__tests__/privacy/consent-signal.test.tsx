import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CONSENT_EVENT,
  COOKIE_CONSENT_KEY,
  setCookieConsent,
  subscribeConsent,
} from "@/lib/privacy-consent";
import {
  useAnalyticsConsent,
  useCookieConsent,
} from "@/lib/privacy-consent-hooks";

describe("consent signal owner", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps the persisted key and event names", () => {
    expect(COOKIE_CONSENT_KEY).toBe("mythos-cookie-consent");
    expect(CONSENT_EVENT).toBe("mythos-cookie-consent");
  });

  it("setCookieConsent persists and notifies subscribers", () => {
    const cb = vi.fn();
    const off = subscribeConsent(cb);
    setCookieConsent("accepted");
    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBe("accepted");
    expect(cb).toHaveBeenCalledTimes(1);
    off();
    setCookieConsent("rejected");
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("subscribeConsent reacts to cross-tab storage events", () => {
    const cb = vi.fn();
    const off = subscribeConsent(cb);
    window.dispatchEvent(new Event("storage"));
    expect(cb).toHaveBeenCalledTimes(1);
    off();
  });

  it("useCookieConsent follows changes", () => {
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current).toBeNull();
    act(() => setCookieConsent("accepted"));
    expect(result.current).toBe("accepted");
  });

  it("useAnalyticsConsent is true only when accepted", () => {
    const { result } = renderHook(() => useAnalyticsConsent());
    expect(result.current).toBe(false);
    act(() => setCookieConsent("accepted"));
    expect(result.current).toBe(true);
    act(() => setCookieConsent("rejected"));
    expect(result.current).toBe(false);
  });

  it("Global Privacy Control still blocks analytics after acceptance", () => {
    vi.stubGlobal("navigator", { ...navigator, globalPrivacyControl: true });
    const { result } = renderHook(() => useAnalyticsConsent());
    act(() => setCookieConsent("accepted"));
    expect(result.current).toBe(false);
  });
});
