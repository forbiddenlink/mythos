import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const track = vi.hoisted(() => vi.fn());
vi.mock("@/lib/analytics/events", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/analytics/events")>()),
  trackEvent: track,
}));

import { StoryEndNudge } from "@/components/stories/StoryEndNudge";
import { countValueMoments, recordValueMoment } from "@/lib/support-nudge";

let trigger: (isIntersecting: boolean) => void = () => {};

beforeEach(() => {
  localStorage.clear();
  track.mockClear();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
        trigger = (isIntersecting) => cb([{ isIntersecting }]);
      }
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => vi.unstubAllGlobals());

describe("StoryEndNudge", () => {
  it("does nothing until the reader reaches the end", () => {
    render(<StoryEndNudge storySlug="titanomachy" />);
    expect(countValueMoments()).toBe(0);
    act(() => trigger(false));
    expect(countValueMoments()).toBe(0);
    expect(screen.queryByRole("complementary")).toBeNull();
  });

  it("counts the finished story as one value moment without asking yet", () => {
    render(<StoryEndNudge storySlug="titanomachy" />);
    act(() => trigger(true));
    expect(countValueMoments()).toBe(1);
    expect(screen.queryByRole("complementary")).toBeNull();
    expect(track).not.toHaveBeenCalled();
  });

  it("counts re-reading the same story only once", () => {
    const first = render(<StoryEndNudge storySlug="titanomachy" />);
    act(() => trigger(true));
    first.unmount();
    render(<StoryEndNudge storySlug="titanomachy" />);
    act(() => trigger(true));
    expect(countValueMoments()).toBe(1);
    expect(screen.queryByRole("complementary")).toBeNull();
  });

  it("counts finishing a different story", () => {
    const first = render(<StoryEndNudge storySlug="titanomachy" />);
    act(() => trigger(true));
    first.unmount();
    render(<StoryEndNudge storySlug="ragnarok" />);
    act(() => trigger(true));
    expect(countValueMoments()).toBe(2);
  });

  it("shows the nudge on the second value moment and reports the impression", () => {
    recordValueMoment("quiz_completed");
    render(<StoryEndNudge storySlug="titanomachy" />);
    act(() => trigger(true));
    expect(screen.getByRole("complementary")).toHaveTextContent(
      "$5 suggested and any amount from $1",
    );
    expect(track).toHaveBeenCalledWith("support_nudge_shown", {
      from: "story_read_end",
    });
    expect(track).not.toHaveBeenCalledWith(
      "support_page_viewed",
      expect.anything(),
    );
  });

  it("stays silent during the cooldown after an ask", () => {
    recordValueMoment("quiz_completed");
    recordValueMoment("quiz_completed");
    localStorage.setItem("mythos_support_nudge_shown_at", String(Date.now()));
    render(<StoryEndNudge storySlug="titanomachy" />);
    act(() => trigger(true));
    expect(screen.queryByRole("complementary")).toBeNull();
  });
});
