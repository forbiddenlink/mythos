"use client";

import { LayoutEffects } from "@/components/effects/LayoutEffects";
import { ConsentGatedAnalytics } from "@/components/analytics/ConsentGatedAnalytics";
import { ConsentGatedSentry } from "@/components/analytics/ConsentGatedSentry";
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

const pwaInstallEnabled = process.env.NEXT_PUBLIC_PWA_INSTALL_PROMPT === "true";
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
      <ConsentGatedAnalytics />
      <ConsentGatedSentry />
      <OfflineIndicator />
      <GlobalSearch />
      <AudioEnhancements />
      {pwaInstallEnabled ? <InstallPrompt /> : null}
      <LayoutEffects />
      <RandomDiscoveryButton />
      <CookieConsent />
      <WebVitals />
    </>
  );
}
