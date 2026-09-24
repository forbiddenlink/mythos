"use client";

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
const CookieConsent = dynamic(
  () =>
    import("@/components/privacy/CookieConsent").then(
      (mod) => mod.CookieConsent,
    ),
  { ssr: false },
);
const ConsentGatedPostHog = dynamic(
  () =>
    import("@/components/analytics/ConsentGatedPostHog").then(
      (mod) => mod.ConsentGatedPostHog,
    ),
  { ssr: false },
);
const WebVitals = dynamic(
  () => import("@/components/analytics/WebVitals").then((mod) => mod.WebVitals),
  { ssr: false },
);
export function GlobalClientAddons() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchRequested, setSearchRequested] = useState(false);

  // Capture intent before the lazy search bundle has finished loading.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchRequested(true);
        setSearchOpen((open) => !open);
      }
    };
    const openSearch = () => {
      setSearchRequested(true);
      setSearchOpen(true);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("open-command-palette", openSearch);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("open-command-palette", openSearch);
    };
  }, []);

  return (
    <>
      <ConsentGatedAnalytics />
      <ConsentGatedPostHog />
      <ConsentGatedSentry />
      <OfflineIndicator />
      {searchRequested ? (
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      ) : null}
      {pwaInstallEnabled ? <InstallPrompt /> : null}
      <CookieConsent />
      <WebVitals />
    </>
  );
}
