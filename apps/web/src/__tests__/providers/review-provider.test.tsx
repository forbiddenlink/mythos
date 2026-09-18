import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ProgressProvider } from "@/providers/progress-provider";
import { ReviewProvider, useReview } from "@/providers/review-provider";
import { addDaysToLocalDate, getLocalYesterday } from "@/lib/date";

const PROGRESS_STORAGE_KEY = "mythos-atlas-progress";

function Providers({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ProgressProvider>
      <ReviewProvider>{children}</ReviewProvider>
    </ProgressProvider>
  );
}

let localStorageData: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageData[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageData[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageData[key];
  }),
  clear: vi.fn(() => {
    localStorageData = {};
  }),
};

describe("ReviewProvider", () => {
  beforeEach(() => {
    localStorageData = {};
    Object.defineProperty(globalThis, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ deitiesViewed: ["zeus"] }),
    );
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("generates a stable deck from explored content and records a review", async () => {
    const { result } = renderHook(() => useReview(), { wrapper: Providers });

    await act(async () => {
      await result.current.generateCardsFromProgress();
    });

    await waitFor(() => {
      expect(result.current.dueCount).toBeGreaterThan(0);
    });

    const initialDueCount = result.current.dueCount;

    await act(async () => {
      await result.current.generateCardsFromProgress();
    });

    expect(result.current.dueCount).toBe(initialDueCount);
    expect(result.current.getCardState("domain-match:zeus")).toBeDefined();

    act(() => result.current.reviewCard("domain-match:zeus", 3));

    expect(result.current.dueCount).toBe(initialDueCount - 1);
    expect(result.current.getTodayStats()).toEqual({
      reviewed: 1,
      correct: 1,
      accuracy: 100,
    });
    expect(result.current.reviewState.stats.currentStreak).toBe(1);
    expect(result.current.reviewState.stats.longestStreak).toBe(1);
  });

  it("advances a streak only once when reviewing on a new day", async () => {
    localStorage.setItem(
      "mythos-atlas-review",
      JSON.stringify({
        lastReviewDate: getLocalYesterday(),
        stats: {
          totalReviewed: 3,
          currentStreak: 3,
          longestStreak: 3,
          averageAccuracy: 100,
          correctToday: 0,
          incorrectToday: 0,
        },
      }),
    );

    const { result } = renderHook(() => useReview(), { wrapper: Providers });

    await waitFor(() => {
      expect(result.current.reviewState.stats.currentStreak).toBe(3);
    });

    await act(async () => {
      await result.current.generateCardsFromProgress();
    });

    act(() => result.current.reviewCard("domain-match:zeus", 3));
    expect(result.current.reviewState.stats.currentStreak).toBe(4);

    act(() => result.current.reviewCard("pantheon-match:zeus", 3));
    expect(result.current.reviewState.stats.currentStreak).toBe(4);
  });

  it("shows saved due cards and expires a missed streak without loading card sources", async () => {
    localStorage.setItem(
      "mythos-atlas-review",
      JSON.stringify({
        cards: {
          "domain-match:zeus": {
            interval: 1,
            nextReview: getLocalYesterday(),
            easeFactor: 2.5,
            reviews: 1,
            lapses: 0,
          },
        },
        lastReviewDate: addDaysToLocalDate(-2),
        stats: {
          totalReviewed: 1,
          currentStreak: 3,
          longestStreak: 3,
          averageAccuracy: 100,
          correctToday: 0,
          incorrectToday: 0,
        },
      }),
    );

    const { result } = renderHook(() => useReview(), { wrapper: Providers });

    await waitFor(() => {
      expect(result.current.dueCount).toBe(1);
      expect(result.current.reviewState.stats.currentStreak).toBe(0);
    });
  });
});
