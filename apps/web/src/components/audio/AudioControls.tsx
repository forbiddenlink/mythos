"use client";

import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX } from "lucide-react";
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
            className="h-12 w-12 rounded-full border-gold/40 bg-midnight/80 text-gold shadow-lg backdrop-blur-sm hover:bg-gold/10 hover:border-gold animate-in fade-in zoom-in duration-300"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute Ambient Audio" : "Mute Ambient Audio"}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
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
