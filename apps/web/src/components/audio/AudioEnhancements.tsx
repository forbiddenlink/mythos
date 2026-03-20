"use client";

import { AudioProvider } from "./AudioContext";
import { AudioControls } from "./AudioControls";

export function AudioEnhancements() {
  return (
    <AudioProvider>
      <AudioControls />
    </AudioProvider>
  );
}
