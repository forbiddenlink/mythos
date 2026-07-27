"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect, useState } from "react";
import { hasAnalyticsConsent } from "@/lib/privacy-consent";

/**
 * Load Vercel Analytics / Speed Insights only after explicit cookie consent
 * (and when Global Privacy Control is not set).
 */
export function ConsentGatedAnalytics() {
  const [allowed, setAllowed] = useState(false);

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

  if (!allowed) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
