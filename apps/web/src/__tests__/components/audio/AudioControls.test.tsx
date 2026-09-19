import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AudioControls } from "@/components/audio/AudioControls";

const setVolume = vi.fn();
vi.mock("@/components/audio/AudioContext", () => ({
  useAudio: () => ({
    isMuted: true,
    toggleMute: vi.fn(),
    volume: 0.5,
    setVolume,
  }),
}));

describe("AudioControls", () => {
  it("names the volume slider and supports keyboard adjustment", () => {
    render(<AudioControls />);
    const slider = screen.getByRole("slider", { name: "Ambient audio volume" });
    slider.focus();
    fireEvent.keyDown(slider, { key: "End" });
    expect(setVolume).toHaveBeenCalledWith(1);
  });
});
