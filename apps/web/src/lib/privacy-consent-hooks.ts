import { useSyncExternalStore } from "react";
import {
  type CookieConsent,
  getCookieConsent,
  hasAnalyticsConsent,
  subscribeConsent,
} from "@/lib/privacy-consent";

// React hooks over the consent store. They live apart from privacy-consent.ts
// because server route handlers import that module (via analytics/events),
// and a React Server Component graph cannot include useSyncExternalStore.

/** The stored choice; null on the server and during hydration. */
export function useCookieConsent(): CookieConsent {
  return useSyncExternalStore(subscribeConsent, getCookieConsent, () => null);
}

/** Whether analytics may run (consent given, GPC off); false on the server. */
export function useAnalyticsConsent(): boolean {
  return useSyncExternalStore(
    subscribeConsent,
    hasAnalyticsConsent,
    () => false,
  );
}
