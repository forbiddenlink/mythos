"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import {
  hasGlobalPrivacyControl,
  notifyCookieConsentChanged,
} from "@/lib/privacy-consent";

const COOKIE_CONSENT_KEY = "mythos-cookie-consent";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [gpcActive, setGpcActive] = useState(false);
  const hasConsentedRef = useRef<boolean | null>(null);

  const showBanner = useCallback(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the browser GPC signal once on client mount
    setGpcActive(hasGlobalPrivacyControl());

    const openHandler = () => {
      showBanner();
    };
    window.addEventListener("mythos-cookie-consent-open", openHandler);

    let stored: string | null = null;
    try {
      stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    } catch {
      // localStorage blocked (SecurityError in strict browsers/iframes)
    }
    if (stored === "accepted" || stored === "rejected") {
      hasConsentedRef.current = true;
      return () =>
        window.removeEventListener("mythos-cookie-consent-open", openHandler);
    }
    hasConsentedRef.current = false;
    // Defer past first paint / LCP so the hero isn't crushed by consent chrome
    const timer = setTimeout(() => setIsVisible(true), 2800);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mythos-cookie-consent-open", openHandler);
    };
  }, [showBanner]);

  useEffect(() => {
    document.documentElement.classList.toggle("cookie-banner-open", isVisible);
    return () => {
      document.documentElement.classList.remove("cookie-banner-open");
    };
  }, [isVisible]);

  const handleAccept = useCallback(() => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    } catch {
      /* blocked */
    }
    hasConsentedRef.current = true;
    setIsVisible(false);
    notifyCookieConsentChanged();
  }, []);

  const handleReject = useCallback(() => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    } catch {
      /* blocked */
    }
    hasConsentedRef.current = true;
    setIsVisible(false);
    notifyCookieConsentChanged();
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed bottom-0 left-0 right-0 z-[60] p-3 md:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-md border border-border/80 bg-background/92 px-3 py-3 shadow-lg backdrop-blur-md md:px-4 md:py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2
                id="cookie-consent-title"
                className="font-serif text-sm font-semibold text-foreground"
              >
                Cookie Preferences
              </h2>
              <button
                onClick={handleDismiss}
                className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
                aria-label="Dismiss cookie banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p
              id="cookie-consent-description"
              className="mt-1 text-xs leading-relaxed text-muted-foreground"
            >
              Cookies help improve Mythos Atlas.{" "}
              <Link
                href="/privacy"
                className="text-gold underline hover:text-gold/80"
              >
                Privacy Policy
              </Link>
              {gpcActive ? " · GPC detected — analytics stay off." : null}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleDismiss}
              className="hidden rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex"
              aria-label="Dismiss cookie banner"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={handleReject}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              className="rounded-md border border-gold/40 bg-gold px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={gpcActive}
              title={
                gpcActive
                  ? "Analytics remain off while Global Privacy Control is enabled"
                  : undefined
              }
            >
              {gpcActive ? "Accept (GPC)" : "Accept"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
