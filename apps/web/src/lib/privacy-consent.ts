const COOKIE_CONSENT_KEY = "mythos-cookie-consent";

export type CookieConsent = "accepted" | "rejected" | null;

export function getCookieConsent(): CookieConsent {
  if (globalThis.window === undefined) return null;

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored === "accepted" || stored === "rejected") {
      return stored;
    }
    return null;
  } catch {
    return null;
  }
}

/** True when the browser sends Global Privacy Control / Do Not Track-style signals. */
export function hasGlobalPrivacyControl(): boolean {
  if (globalThis.window === undefined) return false;
  const nav = navigator as Navigator & {
    globalPrivacyControl?: boolean;
  };
  return nav.globalPrivacyControl === true;
}

export function hasAnalyticsConsent(): boolean {
  if (hasGlobalPrivacyControl()) return false;
  return getCookieConsent() === "accepted";
}

export function notifyCookieConsentChanged(): void {
  if (globalThis.window === undefined) return;
  window.dispatchEvent(new Event("mythos-cookie-consent"));
}
