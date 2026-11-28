import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CookieConsent } from "@/components/privacy/CookieConsent";
import { hasAnalyticsConsent } from "@/lib/privacy-consent";

let localStorageData: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageData[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageData[key] = value;
  }),
  clear: vi.fn(() => {
    localStorageData = {};
  }),
};

describe("CookieConsent", () => {
  beforeEach(() => {
    localStorageData = {};
    Object.defineProperty(globalThis, "localStorage", {
      value: localStorageMock,
      configurable: true,
      writable: true,
    });
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("persists dismissal as rejected and keeps analytics disabled", () => {
    render(<CookieConsent />);
    act(() => vi.advanceTimersByTime(2800));

    fireEvent.click(
      screen.getAllByRole("button", { name: "Dismiss cookie banner" })[0]!,
    );

    expect(localStorage.getItem("mythos-cookie-consent")).toBe("rejected");
    expect(hasAnalyticsConsent()).toBe(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("stays hidden after dismissal but opens from the footer settings event", () => {
    localStorage.setItem("mythos-cookie-consent", "rejected");
    render(<CookieConsent />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new Event("mythos-cookie-consent-open"));
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("clears the initial prompt when preferences are opened before it runs", () => {
    render(<CookieConsent />);
    act(() => {
      window.dispatchEvent(new Event("mythos-cookie-consent-open"));
    });
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    act(() => vi.advanceTimersByTime(2800));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("focuses Reject when settings are opened while the prompt is visible", () => {
    render(<CookieConsent />);
    act(() => vi.advanceTimersByTime(2800));
    act(() => {
      window.dispatchEvent(new Event("mythos-cookie-consent-open"));
    });

    expect(screen.getByRole("button", { name: "Reject" })).toHaveFocus();
  });
});
