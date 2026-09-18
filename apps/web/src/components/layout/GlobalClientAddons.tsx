"use client";

import { LayoutEffects } from "@/components/effects/LayoutEffects";
import { ConsentGatedAnalytics } from "@/components/analytics/ConsentGatedAnalytics";
import { ConsentGatedSentry } from "@/components/analytics/ConsentGatedSentry";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  // Capture intent before the lazy search bundle has finished loading.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    const openSearch = () => setSearchOpen(true);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("open-command-palette", openSearch);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("open-command-palette", openSearch);
    };
  }, []);

  // Audio starts muted and its controls are not needed for the first paint.
  // Wait until the page has loaded, then use the first idle period while
  // keeping a bounded fallback for browsers without requestIdleCallback.
  useEffect(() => {
    let idleCallback: number | undefined;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    const idleWindow = window as Partial<
      Pick<Window, "requestIdleCallback" | "cancelIdleCallback">
    >;

    const enableAudio = () => {
      if (idleWindow.requestIdleCallback) {
        idleCallback = idleWindow.requestIdleCallback(
          () => setAudioReady(true),
          {
            timeout: 1200,
          },
        );
        return;
      }
      fallbackTimer = globalThis.setTimeout(() => setAudioReady(true), 0);
    };

    if (document.readyState === "complete") {
      enableAudio();
    } else {
      window.addEventListener("load", enableAudio, { once: true });
    }

    return () => {
      window.removeEventListener("load", enableAudio);
      if (idleCallback !== undefined) {
        idleWindow.cancelIdleCallback?.(idleCallback);
      }
      if (fallbackTimer !== undefined) {
        globalThis.clearTimeout(fallbackTimer);
      }
    };
  }, []);

  return (
    <>
      <ConsentGatedAnalytics />
      <ConsentGatedSentry />
      <OfflineIndicator />
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      {audioReady ? <AudioEnhancements /> : null}
      {pwaInstallEnabled ? <InstallPrompt /> : null}
      <LayoutEffects />
      <RandomDiscoveryButton />
      <CookieConsent />
      <WebVitals />
    </>
  );
}
