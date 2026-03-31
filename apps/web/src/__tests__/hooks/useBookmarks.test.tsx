import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { type ReactNode } from "react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { BookmarksProvider } from "@/providers/bookmarks-provider";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

function wrapper({ children }: { children: ReactNode }) {
  return <BookmarksProvider>{children}</BookmarksProvider>;
}

describe("useBookmarks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("context requirement", () => {
    it("should throw error when used outside BookmarksProvider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useBookmarks());
      }).toThrow("useBookmarks must be used within a BookmarksProvider");

      consoleSpy.mockRestore();
    });

    it("should not throw when used within BookmarksProvider", () => {
      expect(() => {
        renderHook(() => useBookmarks(), { wrapper });
      }).not.toThrow();
    });
  });

  describe("initial state", () => {
    it("should return empty bookmarks array initially", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });
      expect(result.current.bookmarks).toEqual([]);
    });

    it("should return empty reading progress initially", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });
      expect(result.current.readingProgress).toEqual({});
    });
  });

  describe("toggleBookmark", () => {
    it("should add a bookmark when item is not bookmarked", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.toggleBookmark("deity", "zeus");
      });

      expect(result.current.bookmarks).toHaveLength(1);
      expect(result.current.bookmarks[0]).toMatchObject({
        type: "deity",
        id: "zeus",
      });
      expect(result.current.bookmarks[0].timestamp).toBeDefined();
    });

    it("should remove a bookmark when item is already bookmarked", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      // Add bookmark
      act(() => {
        result.current.toggleBookmark("deity", "zeus");
      });
      expect(result.current.bookmarks).toHaveLength(1);

      // Remove bookmark
      act(() => {
        result.current.toggleBookmark("deity", "zeus");
      });
      expect(result.current.bookmarks).toHaveLength(0);
    });

    it("should add multiple bookmarks of different types", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.toggleBookmark("deity", "zeus");
        result.current.toggleBookmark("story", "titanomachy");
        result.current.toggleBookmark("pantheon", "greek");
      });

      expect(result.current.bookmarks).toHaveLength(3);
    });

    it("should handle multiple bookmarks of same type", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.toggleBookmark("deity", "zeus");
        result.current.toggleBookmark("deity", "athena");
        result.current.toggleBookmark("deity", "poseidon");
      });

      expect(result.current.bookmarks).toHaveLength(3);
      const deityIds = result.current.bookmarks.map((b) => b.id);
      expect(deityIds).toContain("zeus");
      expect(deityIds).toContain("athena");
      expect(deityIds).toContain("poseidon");
    });

    it("should only remove the specific bookmark when toggling", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.toggleBookmark("deity", "zeus");
        result.current.toggleBookmark("deity", "athena");
      });
      expect(result.current.bookmarks).toHaveLength(2);

      act(() => {
        result.current.toggleBookmark("deity", "zeus");
      });

      expect(result.current.bookmarks).toHaveLength(1);
      expect(result.current.bookmarks[0].id).toBe("athena");
    });
  });

  describe("isBookmarked", () => {
    it("should return false when item is not bookmarked", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });
      expect(result.current.isBookmarked("deity", "zeus")).toBe(false);
    });

    it("should return true when item is bookmarked", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.toggleBookmark("deity", "zeus");
      });

      expect(result.current.isBookmarked("deity", "zeus")).toBe(true);
    });

    it("should return false for different type with same id", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.toggleBookmark("deity", "zeus");
      });

      expect(result.current.isBookmarked("deity", "zeus")).toBe(true);
      expect(result.current.isBookmarked("story", "zeus")).toBe(false);
    });

    it("should return false for same type with different id", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.toggleBookmark("deity", "zeus");
      });

      expect(result.current.isBookmarked("deity", "zeus")).toBe(true);
      expect(result.current.isBookmarked("deity", "athena")).toBe(false);
    });

    it("should return false after removing bookmark", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.toggleBookmark("deity", "zeus");
      });
      expect(result.current.isBookmarked("deity", "zeus")).toBe(true);

      act(() => {
        result.current.toggleBookmark("deity", "zeus");
      });
      expect(result.current.isBookmarked("deity", "zeus")).toBe(false);
    });
  });

  describe("getBookmarks", () => {
    it("should return all bookmarks when no type specified", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.toggleBookmark("deity", "zeus");
        result.current.toggleBookmark("story", "titanomachy");
        result.current.toggleBookmark("pantheon", "greek");
      });

      const allBookmarks = result.current.getBookmarks();
      expect(allBookmarks).toHaveLength(3);
    });

    it("should filter bookmarks by type", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.toggleBookmark("deity", "zeus");
        result.current.toggleBookmark("deity", "athena");
        result.current.toggleBookmark("story", "titanomachy");
        result.current.toggleBookmark("pantheon", "greek");
      });

      const deityBookmarks = result.current.getBookmarks("deity");
      expect(deityBookmarks).toHaveLength(2);
      expect(deityBookmarks.every((b) => b.type === "deity")).toBe(true);

      const storyBookmarks = result.current.getBookmarks("story");
      expect(storyBookmarks).toHaveLength(1);
      expect(storyBookmarks[0].id).toBe("titanomachy");

      const pantheonBookmarks = result.current.getBookmarks("pantheon");
      expect(pantheonBookmarks).toHaveLength(1);
      expect(pantheonBookmarks[0].id).toBe("greek");
    });

    it("should return empty array when no bookmarks of specified type", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.toggleBookmark("deity", "zeus");
      });

      const storyBookmarks = result.current.getBookmarks("story");
      expect(storyBookmarks).toHaveLength(0);
    });

    it("should return empty array when no bookmarks exist", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      expect(result.current.getBookmarks()).toHaveLength(0);
      expect(result.current.getBookmarks("deity")).toHaveLength(0);
    });
  });

  describe("reading progress", () => {
    it("should return 0 for story with no progress", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });
      expect(result.current.getReadingProgress("titanomachy")).toBe(0);
    });

    it("should set and get reading progress", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.setReadingProgress("titanomachy", 50);
      });

      expect(result.current.getReadingProgress("titanomachy")).toBe(50);
    });

    it("should clamp progress to 0-100 range", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.setReadingProgress("story1", 150);
      });
      expect(result.current.getReadingProgress("story1")).toBe(100);

      act(() => {
        result.current.setReadingProgress("story2", -50);
      });
      expect(result.current.getReadingProgress("story2")).toBe(0);
    });

    it("should update reading progress for same story", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.setReadingProgress("titanomachy", 25);
      });
      expect(result.current.getReadingProgress("titanomachy")).toBe(25);

      act(() => {
        result.current.setReadingProgress("titanomachy", 75);
      });
      expect(result.current.getReadingProgress("titanomachy")).toBe(75);
    });

    it("should track progress for multiple stories independently", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.setReadingProgress("story1", 25);
        result.current.setReadingProgress("story2", 50);
        result.current.setReadingProgress("story3", 100);
      });

      expect(result.current.getReadingProgress("story1")).toBe(25);
      expect(result.current.getReadingProgress("story2")).toBe(50);
      expect(result.current.getReadingProgress("story3")).toBe(100);
    });

    it("should store reading progress in readingProgress object", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.setReadingProgress("titanomachy", 50);
      });

      expect(result.current.readingProgress["titanomachy"]).toBeDefined();
      expect(result.current.readingProgress["titanomachy"].percentage).toBe(50);
      expect(result.current.readingProgress["titanomachy"].storyId).toBe(
        "titanomachy",
      );
      expect(
        result.current.readingProgress["titanomachy"].updatedAt,
      ).toBeDefined();
    });
  });

  describe("bookmark types", () => {
    it("should handle deity bookmarks", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.toggleBookmark("deity", "zeus");
      });

      expect(result.current.bookmarks[0].type).toBe("deity");
    });

    it("should handle story bookmarks", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.toggleBookmark("story", "titanomachy");
      });

      expect(result.current.bookmarks[0].type).toBe("story");
    });

    it("should handle pantheon bookmarks", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.toggleBookmark("pantheon", "greek");
      });

      expect(result.current.bookmarks[0].type).toBe("pantheon");
    });
  });

  describe("edge cases", () => {
    it("should handle rapid toggle operations", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.toggleBookmark("deity", "zeus");
        result.current.toggleBookmark("deity", "zeus");
        result.current.toggleBookmark("deity", "zeus");
      });

      // Odd number of toggles = bookmarked
      expect(result.current.isBookmarked("deity", "zeus")).toBe(true);
    });

    it("should handle empty string id", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.toggleBookmark("deity", "");
      });

      expect(result.current.isBookmarked("deity", "")).toBe(true);
    });

    it("should handle special characters in id", () => {
      const { result } = renderHook(() => useBookmarks(), { wrapper });

      act(() => {
        result.current.toggleBookmark("deity", "ah-puch-mayan");
      });

      expect(result.current.isBookmarked("deity", "ah-puch-mayan")).toBe(true);
    });
  });
});
