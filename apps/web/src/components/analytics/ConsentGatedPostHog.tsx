"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  resetAnalyticsSink,
  setAnalyticsSink,
  type AnalyticsProperties,
  type AnalyticsEventName,
} from "@/lib/analytics/events";
import { hasAnalyticsConsent } from "@/lib/privacy-consent";

type PostHogClient = {
  init: (key: string, options: Record<string, unknown>) => void;
  capture: (event: string, properties?: Record<string, unknown>) => void;
  get_distinct_id?: () => string;
  opt_out_capturing?: () => void;
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
  const started = useRef(false);

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
    if (!allowed || !key || started.current) return;
    started.current = true;

    let cancelled = false;

    void import("posthog-js")
      .then(({ default: posthog }) => {
        if (cancelled) return;

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

        cached = posthog as unknown as PostHogClient;

        setAnalyticsSink(
          (name: AnalyticsEventName, props: AnalyticsProperties) => {
            posthog.capture(name, props);
          },
        );
      })
      .catch(() => {
        started.current = false;
      });

    return () => {
      cancelled = true;
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
