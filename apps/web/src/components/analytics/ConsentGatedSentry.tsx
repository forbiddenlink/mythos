"use client";

import { useEffect, useRef } from "react";
import { hasAnalyticsConsent } from "@/lib/privacy-consent";

/**
 * Initialize/teardown client Sentry only after analytics consent (and never when GPC is on).
 * Server-side Sentry remains for request errors without browser cookies.
 */
export function ConsentGatedSentry() {
  const activeRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      const allowed = hasAnalyticsConsent();
      if (allowed && !activeRef.current) {
        const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
        if (!dsn || process.env.NODE_ENV !== "production") return;

        try {
          const Sentry = await import("@sentry/nextjs");
          if (cancelled) return;
          const replayEnabled =
            process.env.NEXT_PUBLIC_SENTRY_REPLAY_ENABLED === "true";
          Sentry.init({
            dsn,
            tracesSampleRate:
              Number.parseFloat(
                process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "0.15",
              ) || 0.15,
            debug: false,
            ignoreErrors: ["closest is not a function"],
            replaysOnErrorSampleRate: replayEnabled ? 1 : 0,
            replaysSessionSampleRate: replayEnabled ? 0.1 : 0,
            integrations: replayEnabled
              ? [
                  Sentry.replayIntegration({
                    maskAllText: true,
                    blockAllMedia: true,
                  }),
                ]
              : [],
            enabled: true,
          });
          activeRef.current = true;
        } catch {
          // Ignore Sentry load failures
        }
      } else if (!allowed && activeRef.current) {
        try {
          const Sentry = await import("@sentry/nextjs");
          if (cancelled) return;
          await Sentry.close(2000);
          activeRef.current = false;
        } catch {
          activeRef.current = false;
        }
      }
    };

    const onConsent = () => {
      void sync();
    };

    void sync();
    window.addEventListener("storage", onConsent);
    window.addEventListener("mythos-cookie-consent", onConsent);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onConsent);
      window.removeEventListener("mythos-cookie-consent", onConsent);
    };
  }, []);

  return null;
}
