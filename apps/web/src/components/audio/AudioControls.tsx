"use client";

import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Slider } from "@/components/ui/slider";
import { MythosMark } from "@/components/icons/mythos-marks";
import { useAudio } from "./AudioContext";

export function AudioControls() {
  const { isMuted, toggleMute, volume, setVolume } = useAudio();

  return (
    <div className="fixed bottom-20 right-6 z-40">
      <HoverCard openDelay={0} closeDelay={200}>
        <HoverCardTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="relative h-12 w-12 border border-gold/40 bg-midnight/80 text-gold shadow-lg backdrop-blur-sm hover:bg-gold/10 hover:border-gold animate-in fade-in zoom-in duration-300"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute Ambient Audio" : "Mute Ambient Audio"}
          >
            <span className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-gold/50" />
            <span className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-gold/50" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-gold/50" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-gold/50" />
            <MythosMark
              id="lyre"
              className={`relative h-5 w-5 ${isMuted ? "opacity-35" : ""}`}
            />
            {isMuted ? (
              <span className="pointer-events-none absolute inset-x-2 top-1/2 h-px -rotate-45 bg-gold/80" />
            ) : null}
          </Button>
        </HoverCardTrigger>
        <HoverCardContent
          side="top"
          className="w-40 border-gold/40 bg-midnight/90 backdrop-blur-md p-4"
        >
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase text-gold/80 tracking-wider">
              Ambient Audio
            </h4>
            <Slider
              defaultValue={[volume]}
              max={1}
              step={0.01}
              onValueChange={(vals) => setVolume(vals[0])}
              className="mt-2"
            />
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
