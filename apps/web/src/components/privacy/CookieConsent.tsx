"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "mythos-cookie-consent";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const hasConsentedRef = useRef<boolean | null>(null);

  useEffect(() => {
    // Check localStorage on mount
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored === "accepted" || stored === "rejected") {
      hasConsentedRef.current = true;
      return;
    }
    hasConsentedRef.current = false;
    // Show banner after a short delay for better UX
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = useCallback(() => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    hasConsentedRef.current = true;
    setIsVisible(false);
  }, []);

  const handleReject = useCallback(() => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    hasConsentedRef.current = true;
    setIsVisible(false);
  }, []);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    hasConsentedRef.current = true;
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
      className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6"
    >
      <div className="mx-auto max-w-4xl rounded-lg border border-gold/20 bg-background/95 p-4 shadow-xl backdrop-blur-sm md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2
              id="cookie-consent-title"
              className="font-display text-lg font-semibold text-foreground"
            >
              Cookie Preferences
            </h2>
            <p
              id="cookie-consent-description"
              className="mt-2 text-sm text-muted-foreground"
            >
              We use cookies to improve your browsing experience and understand
              how visitors use the site. By clicking &quot;Accept All&quot;, you
              consent to our use of cookies.{" "}
              <Link
                href="/privacy"
                className="text-gold underline hover:text-gold/80"
              >
                Learn more in our Privacy Policy
              </Link>
              .
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Dismiss cookie banner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={handleReject}
            className="rounded-md border border-gold/30 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Reject Non-Essential
          </button>
          <button
            onClick={handleAccept}
            className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-gold/90"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
