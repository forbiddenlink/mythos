import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const instances: Array<{ play: ReturnType<typeof vi.fn> }> = [];

vi.mock("howler", () => {
  class Howl {
    play = vi.fn();
    fade = vi.fn();
    mute = vi.fn();
    volume = vi.fn();
    unload = vi.fn();
    playing = vi.fn(() => false);
    state = vi.fn(() => "loaded");
    once = vi.fn();
    constructor() {
      instances.push(this);
    }
  }
  return { Howl };
});

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import { AudioProvider, useAudio } from "@/components/audio/AudioContext";

describe("AudioProvider toggleMute", () => {
  beforeEach(() => {
    instances.length = 0;
  });

  it("plays the first track on unmute when no track is loaded", async () => {
    const { result } = renderHook(() => useAudio(), {
      wrapper: AudioProvider,
    });
    expect(result.current.isMuted).toBe(true);

    await act(async () => {
      await result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(false);
    expect(result.current.isPlaying).toBe(true);
    expect(instances).toHaveLength(1);
    expect(instances[0].play).toHaveBeenCalled();
  });
});
