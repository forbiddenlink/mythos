"use client";

import { useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { AchievementNotificationToggle } from "@/providers/achievement-notification-provider";

const RandomDiscoveryButton = dynamic(
  () =>
    import("@/components/discovery/RandomDiscoveryButton").then(
      (mod) => mod.RandomDiscoveryButton,
    ),
  { ssr: false },
);
const OracleChat = dynamic(
  () => import("@/components/oracle/OracleChat").then((mod) => mod.OracleChat),
  { ssr: false },
);
const AudioEnhancements = dynamic(
  () =>
    import("@/components/audio/AudioEnhancements").then(
      (mod) => mod.AudioEnhancements,
    ),
  {
    ssr: false,
    loading: () => (
      <p role="status" className="text-sm text-muted-foreground">
        Loading audio controls…
      </p>
    ),
  },
);

const subscribe = () => () => {};

export function FooterTools() {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioOpen, setAudioOpen] = useState(false);

  return (
    <section
      aria-label="Optional browsing tools"
      className="mt-10 border-t border-border/70 pt-4"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <RandomDiscoveryButton />
        {process.env.NEXT_PUBLIC_ORACLE_ENABLED === "true" && <OracleChat />}
        <Button
          variant="ghost"
          className="min-h-10 px-0 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
          disabled={!hydrated}
          aria-expanded={audioOpen}
          aria-controls="footer-audio-controls"
          onClick={() => {
            setAudioLoaded(true);
            setAudioOpen((open) => !open);
          }}
        >
          Ambient audio
        </Button>
        <AchievementNotificationToggle className="inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm text-muted-foreground" />
      </div>
      <div id="footer-audio-controls" hidden={!audioOpen} className="pt-4">
        {audioLoaded && <AudioEnhancements />}
      </div>
    </section>
  );
}
