import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/data/name-audio.json", () => ({ default: ["zeus"] }));

import { PronunciationDisplay } from "@/components/ui/pronunciation";

const pron = { ipa: "/zjuːs/", phonetic: "ZYOOS" };

describe("PronunciationDisplay audio", () => {
  const speak = vi.fn();
  const play = vi.fn();
  const audioCtor = vi.fn();
  let rejectPlay = false;

  beforeEach(() => {
    rejectPlay = false;
    Object.defineProperty(globalThis, "speechSynthesis", {
      configurable: true,
      value: { speak, cancel: vi.fn() },
    });
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        constructor(public text: string) {}
      },
    );
    play.mockImplementation(() =>
      rejectPlay ? Promise.reject(new Error("blocked")) : Promise.resolve(),
    );
    vi.stubGlobal(
      "Audio",
      class {
        constructor(src: string) {
          audioCtor(src);
        }
        play = play;
        pause = vi.fn();
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  async function openAndClickListen(slug?: string) {
    const user = userEvent.setup();
    render(<PronunciationDisplay pronunciation={pron} audioSlug={slug} />);
    await user.hover(screen.getByText("[ZYOOS]"));
    fireEvent.click(await screen.findByRole("button", { name: /^Listen/i }));
  }

  it("plays the recorded clip when one exists", async () => {
    await openAndClickListen("zeus");
    expect(audioCtor).toHaveBeenCalledWith("/audio/names/zeus.mp3");
    expect(speak).not.toHaveBeenCalled();
  });

  it("uses browser speech when no clip exists for the slug", async () => {
    await openAndClickListen("hera");
    expect(audioCtor).not.toHaveBeenCalled();
    expect(speak).toHaveBeenCalledTimes(1);
  });

  it("falls back to browser speech once when playback is rejected", async () => {
    rejectPlay = true;
    await openAndClickListen("zeus");
    await vi.waitFor(() => expect(speak).toHaveBeenCalledTimes(1));
  });
});
