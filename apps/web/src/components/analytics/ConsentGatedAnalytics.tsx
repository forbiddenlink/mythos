"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useAnalyticsConsent } from "@/lib/privacy-consent-hooks";

/**
 * Load Vercel Analytics / Speed Insights only after explicit cookie consent
 * (and when Global Privacy Control is not set).
 */
export function ConsentGatedAnalytics() {
  const allowed = useAnalyticsConsent();

  if (!allowed) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
