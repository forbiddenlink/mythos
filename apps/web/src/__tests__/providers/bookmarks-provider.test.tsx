import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";
import { useContext, type ReactNode } from "react";
import {
  BookmarksContext,
  BookmarksProvider,
} from "@/providers/bookmarks-provider";

function wrapper({ children }: { children: ReactNode }) {
  return <BookmarksProvider>{children}</BookmarksProvider>;
}
beforeEach(() => localStorage.clear());
afterEach(cleanup);
describe("saved reading recovery", () => {
  it.each([
    "null",
    "[]",
    '"bad"',
    '{"story":null}',
    '{"story":{"storyId":"story","percentage":150,"updatedAt":1}}',
  ])("ignores malformed reading progress %s", (saved) => {
    localStorage.setItem("mythos-atlas-reading-progress", saved);
    const { result } = renderHook(() => useContext(BookmarksContext)!, {
      wrapper,
    });
    expect(result.current.getReadingProgress("story")).toBe(0);
  });
  it("preserves valid saves and legacy hero migration alongside malformed records", () => {
    localStorage.setItem(
      "mythos-atlas-bookmarks",
      JSON.stringify([
        null,
        {},
        { type: "story", id: "hero-heracles", timestamp: 1 },
        { type: "deity", id: "athena", timestamp: 2 },
      ]),
    );
    const { result } = renderHook(() => useContext(BookmarksContext)!, {
      wrapper,
    });
    expect(result.current.isBookmarked("hero", "heracles")).toBe(true);
    expect(result.current.isBookmarked("deity", "athena")).toBe(true);
    expect(result.current.bookmarks).toHaveLength(2);
  });
});
