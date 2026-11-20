import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const host = vi.hoisted(() => ({ production: true }));

vi.mock("@/lib/analytics/production-host", () => ({
  isProductionHostname: () => host.production,
}));

import { sendCount } from "@/lib/analytics/daily-count-client";
import { COOKIE_CONSENT_KEY } from "@/lib/privacy-consent";

const beacon = { step: "arrive", page: "deity", source: "search" } as const;
const postCount = vi.fn(async () => new Response());

function setNavigator(name: string, value: unknown) {
  Object.defineProperty(navigator, name, { value, configurable: true });
}

beforeEach(() => {
  host.production = true;
  postCount.mockClear();
  localStorage.clear();
  vi.stubGlobal("fetch", postCount);
  setNavigator("webdriver", false);
  setNavigator("globalPrivacyControl", undefined);
  setNavigator(
    "userAgent",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("sendCount", () => {
  it("posts the closed-list fields and nothing else", () => {
    sendCount(beacon);
    expect(postCount).toHaveBeenCalledTimes(1);
    expect(postCount).toHaveBeenCalledWith(
      "/api/count",
      {
        method: "POST",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        headers: { "Content-Type": "application/json" },
        body: '{"step":"arrive","page":"deity","source":"search"}',
        keepalive: true,
      },
    );
  });

  it("counts a visitor who has not answered the cookie banner", () => {
    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBeNull();
    sendCount(beacon);
    expect(postCount).toHaveBeenCalledTimes(1);
  });

  it("counts a visitor who accepted", () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    sendCount(beacon);
    expect(postCount).toHaveBeenCalledTimes(1);
  });

  it("leaves out a visitor who rejected the cookie banner", () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    sendCount(beacon);
    expect(postCount).not.toHaveBeenCalled();
  });

  it("leaves out a browser that sends Global Privacy Control, even after accept", () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setNavigator("globalPrivacyControl", true);
    sendCount(beacon);
    expect(postCount).not.toHaveBeenCalled();
  });

  it("sends nothing away from the live site", () => {
    host.production = false;
    sendCount(beacon);
    expect(postCount).not.toHaveBeenCalled();
  });

  it("sends nothing from an automated browser", () => {
    setNavigator("webdriver", true);
    sendCount(beacon);
    setNavigator("webdriver", false);
    setNavigator("userAgent", "Mozilla/5.0 (compatible; Googlebot/2.1)");
    sendCount(beacon);
    expect(postCount).not.toHaveBeenCalled();
  });

  it("never throws when the browser refuses the beacon", () => {
    postCount.mockImplementationOnce(() => {
      throw new Error("blocked");
    });
    expect(() => sendCount(beacon)).not.toThrow();
  });
});
