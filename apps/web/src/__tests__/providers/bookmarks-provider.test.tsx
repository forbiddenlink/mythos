import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
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

describe("creature, artifact and location saves", () => {
  it.each(["creature", "artifact", "location"] as const)(
    "toggles and persists %s bookmarks",
    (type) => {
      const { result } = renderHook(() => useContext(BookmarksContext)!, {
        wrapper,
      });
      act(() => result.current.toggleBookmark(type, "x"));
      expect(result.current.isBookmarked(type, "x")).toBe(true);
      expect(result.current.getBookmarks(type)).toHaveLength(1);
      expect(localStorage.getItem("mythos-atlas-bookmarks")).toContain(type);
      act(() => result.current.toggleBookmark(type, "x"));
      expect(result.current.isBookmarked(type, "x")).toBe(false);
    },
  );

  it("loads stored creature, artifact and location saves and drops unknown types", () => {
    localStorage.setItem(
      "mythos-atlas-bookmarks",
      JSON.stringify([
        { type: "creature", id: "a", timestamp: 1 },
        { type: "artifact", id: "b", timestamp: 2 },
        { type: "location", id: "c", timestamp: 3 },
        { type: "bogus", id: "d", timestamp: 4 },
      ]),
    );
    const { result } = renderHook(() => useContext(BookmarksContext)!, {
      wrapper,
    });
    expect(result.current.bookmarks.map((b) => b.type)).toEqual([
      "creature",
      "artifact",
      "location",
    ]);
  });
});
