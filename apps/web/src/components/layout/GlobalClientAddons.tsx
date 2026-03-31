"use client";

import { LayoutEffects } from "@/components/effects/LayoutEffects";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import dynamic from "next/dynamic";

const GlobalSearch = dynamic(
  () =>
    import("@/components/search/GlobalSearch").then((mod) => mod.GlobalSearch),
  { ssr: false },
);
const OfflineIndicator = dynamic(
  () =>
    import("@/components/pwa/OfflineIndicator").then(
      (mod) => mod.OfflineIndicator,
    ),
  { ssr: false },
);
const InstallPrompt = dynamic(
  () =>
    import("@/components/pwa/InstallPrompt").then((mod) => mod.InstallPrompt),
  { ssr: false },
);
const RandomDiscoveryButton = dynamic(
  () =>
    import("@/components/discovery/RandomDiscoveryButton").then(
      (mod) => mod.RandomDiscoveryButton,
    ),
  { ssr: false },
);
const CookieConsent = dynamic(
  () =>
    import("@/components/privacy/CookieConsent").then(
      (mod) => mod.CookieConsent,
    ),
  { ssr: false },
);
const WebVitals = dynamic(
  () => import("@/components/analytics/WebVitals").then((mod) => mod.WebVitals),
  { ssr: false },
);
const AudioEnhancements = dynamic(
  () =>
    import("@/components/audio/AudioEnhancements").then(
      (mod) => mod.AudioEnhancements,
    ),
  { ssr: false },
);

export function GlobalClientAddons() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
      <OfflineIndicator />
      <GlobalSearch />
      <AudioEnhancements />
      <InstallPrompt />
      <LayoutEffects />
      <RandomDiscoveryButton />
      <CookieConsent />
      <WebVitals />
    </>
  );
}
