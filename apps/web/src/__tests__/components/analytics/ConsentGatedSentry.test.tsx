import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConsentGatedSentry } from "@/components/analytics/ConsentGatedSentry";
import { notifyCookieConsentChanged } from "@/lib/privacy-consent";

const sentry = vi.hoisted(() => ({ init: vi.fn(), close: vi.fn() }));
vi.mock("@sentry/nextjs", () => sentry);

function consent(value: "accepted" | "rejected"): void {
  act(() => {
    localStorage.setItem("mythos-cookie-consent", value);
    notifyCookieConsentChanged();
  });
}

describe("Sentry consent lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://public@example.com/1");
    Object.defineProperty(navigator, "globalPrivacyControl", {
      configurable: true,
      value: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it("does not initialize after consent is withdrawn during SDK loading", async () => {
    localStorage.setItem("mythos-cookie-consent", "accepted");
    render(<ConsentGatedSentry />);
    consent("rejected");
    await act(async () => vi.dynamicImportSettled());
    expect(sentry.init).not.toHaveBeenCalled();
  });

  it("resumes when consent is restored while shutdown is pending", async () => {
    let finishClose!: () => void;
    sentry.close.mockImplementationOnce(
      () => new Promise<void>((resolve) => (finishClose = resolve)),
    );
    localStorage.setItem("mythos-cookie-consent", "accepted");
    render(<ConsentGatedSentry />);
    await waitFor(() => expect(sentry.init).toHaveBeenCalledTimes(1));
    consent("rejected");
    await waitFor(() => expect(sentry.close).toHaveBeenCalledTimes(1));
    consent("accepted");
    await act(async () => finishClose());
    await waitFor(() => expect(sentry.init).toHaveBeenCalledTimes(2));
  });

  it("initializes once when multiple consent events arrive during loading", async () => {
    localStorage.setItem("mythos-cookie-consent", "accepted");
    render(<ConsentGatedSentry />);
    consent("accepted");
    consent("accepted");
    await act(async () => vi.dynamicImportSettled());
    expect(sentry.init).toHaveBeenCalledTimes(1);
  });
});
