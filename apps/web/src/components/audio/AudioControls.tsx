"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudio } from "./AudioContext";

export function AudioControls() {
  const { isMuted, toggleMute, volume, setVolume } = useAudio();

  return (
    <div className="flex max-w-sm flex-wrap items-center gap-4 rounded-lg border border-border bg-background p-4">
      <Button
        variant="outline"
        className="min-h-11"
        onClick={toggleMute}
        aria-pressed={!isMuted}
        aria-label={isMuted ? "Unmute Ambient Audio" : "Mute Ambient Audio"}
      >
        {isMuted ? "Turn sound on" : "Turn sound off"}
      </Button>
      <div className="min-w-32 flex-1 space-y-3">
        <p id="ambient-volume-label" className="text-sm text-muted-foreground">
          Volume
        </p>
        <Slider
          aria-label="Ambient audio volume"
          value={[volume]}
          max={1}
          step={0.01}
          onValueChange={(values) => setVolume(values[0])}
        />
      </div>
    </div>
  );
}
