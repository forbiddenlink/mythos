"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { resetAnalyticsSink, setAnalyticsSink } from "@/lib/analytics/events";
import { hasAnalyticsConsent } from "@/lib/privacy-consent";

type PostHogClient = {
  init: (key: string, options: Record<string, unknown>) => void;
  capture: (event: string, properties?: Record<string, unknown>) => void;
  get_distinct_id?: () => string;
  opt_out_capturing?: () => void;
  opt_in_capturing?: (options: { captureEventName: false }) => void;
};

let cached: PostHogClient | null = null;

/** Exposed so beacons sent outside React can tag themselves with the same id. */
export function getPostHogDistinctId(): string | undefined {
  try {
    return cached?.get_distinct_id?.();
  } catch {
    return undefined;
  }
}

/**
 * Loads PostHog only after explicit cookie consent, and only when a project key
 * is configured. Until then `trackEvent` has no sink and silently drops every
 * event, so nothing is buffered and replayed after the fact.
 *
 * Requests go through the same-origin `/ingest` rewrite (see next.config.ts) so
 * a content blocker does not quietly delete the traffic that decides what gets
 * built next.
 */
export function ConsentGatedPostHog() {
  const [allowed, setAllowed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const sync = () => setAllowed(hasAnalyticsConsent());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("mythos-cookie-consent", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("mythos-cookie-consent", sync);
    };
  }, []);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!allowed || !key) return;

    const connect = (client: PostHogClient): void => {
      client.opt_in_capturing?.({ captureEventName: false });
      setAnalyticsSink((name, props) => {
        if (hasAnalyticsConsent()) client.capture(name, props);
      });
    };

    if (cached) {
      connect(cached);
      return () => resetAnalyticsSink();
    }

    let cancelled = false;

    void import("posthog-js")
      .then(({ default: posthog }) => {
        if (cancelled || !hasAnalyticsConsent()) return;

        posthog.init(key, {
          api_host: "/ingest",
          ui_host:
            process.env.NEXT_PUBLIC_POSTHOG_UI_HOST ?? "https://us.posthog.com",
          defaults: "2025-05-24",
          capture_pageview: "history_change",
          persistence: "localStorage+cookie",
          autocapture: false,
          disable_session_recording: true,
          person_profiles: "identified_only",
        });
        // Identifies this app in its configured PostHog project.
        posthog.register({
          app: "mythos",
          environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "development",
          app_version:
            process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ||
            "local",
        });

        cached = posthog as unknown as PostHogClient;

        connect(cached);
      })
      .catch(() => {
        // A later consent change or mount can retry loading the SDK.
      });

    return () => {
      cancelled = true;
      resetAnalyticsSink();
    };
  }, [allowed]);

  useEffect(() => {
    if (allowed) return;
    resetAnalyticsSink();
    try {
      cached?.opt_out_capturing?.();
    } catch {
      // Opting out is best effort; the sink reset already stops new events.
    }
  }, [allowed, pathname]);

  return null;
}
