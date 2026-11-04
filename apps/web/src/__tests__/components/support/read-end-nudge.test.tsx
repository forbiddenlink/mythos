import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const track = vi.hoisted(() => vi.fn());
vi.mock("@/lib/analytics/events", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/analytics/events")>()),
  trackEvent: track,
}));

import { EntryCloser } from "@/components/layout/EntryCloser";
import { countValueMoments, recordValueMoment } from "@/lib/support-nudge";
import { BookmarksProvider } from "@/providers/bookmarks-provider";

// next/link prefetching observes its anchors too, so keep every observer and
// fire them all, as scrolling the whole closer into view would.
type Callback = (
  entries: Array<{ isIntersecting: boolean; target: Element }>,
) => void;
let observers: Array<{ cb: Callback; targets: Element[] }> = [];
function trigger(isIntersecting: boolean): void {
  for (const { cb, targets } of observers) {
    cb(targets.map((target) => ({ isIntersecting, target })));
  }
}

beforeEach(() => {
  localStorage.clear();
  track.mockClear();
  observers = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      private entry: { cb: Callback; targets: Element[] };
      constructor(cb: Callback) {
        this.entry = { cb, targets: [] };
        observers.push(this.entry);
      }
      observe(el: Element) {
        this.entry.targets.push(el);
      }
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => vi.unstubAllGlobals());

function renderCloser(props: Parameters<typeof EntryCloser>[0]) {
  return render(
    <BookmarksProvider>
      <EntryCloser {...props} />
    </BookmarksProvider>,
  );
}

describe("EntryCloser read-end support moment", () => {
  it("counts reading an entry to its end once, without asking on the first", () => {
    const first = renderCloser({ entityType: "deity", id: "zeus", name: "Zeus" });
    act(() => trigger(true));
    expect(countValueMoments()).toBe(1);
    expect(screen.queryByRole("complementary")).toBeNull();
    first.unmount();

    renderCloser({ entityType: "deity", id: "zeus", name: "Zeus" });
    act(() => trigger(true));
    expect(countValueMoments()).toBe(1);
  });

  it("keeps a deity and a pantheon with the same id apart", () => {
    const first = renderCloser({ entityType: "deity", id: "x", name: "X" });
    act(() => trigger(true));
    first.unmount();
    renderCloser({ entityType: "pantheon", id: "x", name: "X" });
    act(() => trigger(true));
    expect(countValueMoments()).toBe(2);
  });

  it("asks on the second value moment and tags the placement", () => {
    recordValueMoment("quiz_completed");
    renderCloser({ entityType: "creature", id: "hydra", name: "Hydra" });
    act(() => trigger(true));
    expect(screen.getByRole("complementary")).toHaveTextContent(
      "Enjoying the atlas?",
    );
    expect(track).toHaveBeenCalledWith("support_nudge_shown", {
      from: "entry_read_end",
    });
  });

  it("leaves stories to StoryEndNudge so a story is not counted twice", () => {
    renderCloser({ entityType: "story", id: "titanomachy", name: "T" });
    act(() => trigger(true));
    expect(countValueMoments()).toBe(0);
  });
});
