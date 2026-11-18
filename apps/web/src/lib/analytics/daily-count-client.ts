import { isProductionHostname } from "@/lib/analytics/production-host";
import { type CountBeacon, isAutomatedUserAgent } from "@/lib/daily-counts";
import { postBeacon } from "@/lib/http/post-beacon";
import {
  getCookieConsent,
  hasGlobalPrivacyControl,
} from "@/lib/privacy-consent";

/**
 * Whether this browser may add to the anonymous daily counts.
 *
 * The count needs no consent because it stores nothing about the visitor, but
 * a visitor who said no is still left out: Global Privacy Control or a
 * rejected cookie banner both switch it off. Only the live site counts, so
 * local builds and test runs add nothing.
 */
function mayCount(): boolean {
  return (
    isProductionHostname(window.location.hostname) &&
    navigator.webdriver !== true &&
    !isAutomatedUserAgent(navigator.userAgent) &&
    !hasGlobalPrivacyControl() &&
    getCookieConsent() !== "rejected"
  );
}

/** Sends one count when this browser may be counted. Never throws. */
export function sendCount(beacon: CountBeacon): void {
  try {
    if (mayCount()) postBeacon("/api/count", JSON.stringify(beacon));
  } catch {
    // A count that cannot be sent is dropped.
  }
}
