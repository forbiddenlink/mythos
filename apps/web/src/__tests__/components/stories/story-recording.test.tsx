import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("@/data/story-audio.json", () => ({
  default: { aeneid: { bytes: 1000, seconds: 300 } },
}));

import {
  StoryRecording,
  hasStoryRecording,
} from "@/components/stories/StoryRecording";

describe("StoryRecording", () => {
  it("renders a lazy audio player only for slugs with a recording", () => {
    const { container } = render(<StoryRecording slug="aeneid" />);
    const audio = container.querySelector("audio");
    expect(audio?.getAttribute("src")).toBe("/audio/stories/aeneid.mp3");
    expect(audio?.getAttribute("preload")).toBe("none");
    expect(container.textContent).toContain("about 5 min");
  });

  it("renders nothing when no recording exists", () => {
    const { container } = render(<StoryRecording slug="titanomachy" />);
    expect(container.firstChild).toBeNull();
    expect(hasStoryRecording("titanomachy")).toBe(false);
    expect(hasStoryRecording("constructor")).toBe(false);
  });
});
