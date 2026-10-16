import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useContext, type ReactNode } from "react";
import {
  ProgressContext,
  ProgressProvider,
} from "@/providers/progress-provider";
import { ReviewProvider, useReview } from "@/providers/review-provider";
import { addDaysToLocalDate, getLocalYesterday } from "@/lib/date";

// The provider fetches slim indexes from /api/catalog/*; serve the real catalog.
vi.mock("@/lib/catalog-client", async () => {
  const deities = (await import("@/data/deities.json")).default;
  const stories = (await import("@/data/stories.json")).default;
  return {
    loadDeityIndex: async () => deities,
    loadStoryIndex: async () => stories,
  };
});

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
  it("recovers from parseable malformed review state", () => {
    localStorage.setItem(
      "mythos-atlas-review",
      JSON.stringify({ cards: null, stats: null }),
    );
    const { result } = renderHook(() => useReview(), { wrapper: Providers });
    expect(result.current.reviewState.cards).toEqual({});
    expect(result.current.getTodayStats().reviewed).toBe(0);
  });

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
    vi.useRealTimers();
    vi.unstubAllEnvs();
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

  it("resets daily answers when an open review session crosses midnight", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 15, 23, 59));
    const { result } = renderHook(() => useReview(), { wrapper: Providers });

    act(() => result.current.reviewCard("domain-match:zeus", 3));
    expect(result.current.getTodayStats().reviewed).toBe(1);

    vi.setSystemTime(new Date(2026, 9, 16, 0, 1));
    expect(result.current.getTodayStats()).toEqual({
      reviewed: 0,
      correct: 0,
      accuracy: 0,
    });
    act(() => result.current.reviewCard("pantheon-match:zeus", 1));

    expect(result.current.getTodayStats()).toEqual({
      reviewed: 1,
      correct: 0,
      accuracy: 0,
    });
    expect(result.current.reviewState.todayReviewed).toEqual([
      "pantheon-match:zeus",
    ]);
    expect(result.current.reviewState.stats.incorrectToday).toBe(1);
    expect(result.current.reviewState.stats.totalReviewed).toBe(2);
    expect(result.current.reviewState.stats.currentStreak).toBe(2);
  });

  it("counts next-day review activity toward the visit streak", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-16T12:00:00Z"));
    const { result } = renderHook(
      () => ({ review: useReview(), progress: useContext(ProgressContext) }),
      { wrapper: Providers },
    );
    expect(result.current.progress?.progress.dailyStreak).toBe(1);
    vi.setSystemTime(new Date("2026-10-17T12:00:00Z"));
    act(() => result.current.review.reviewCard("domain-match:zeus", 3));
    expect(result.current.progress?.progress.lastVisit).toBe("2026-10-17");
    expect(result.current.progress?.progress.dailyStreak).toBe(2);
  });

  it("includes yesterday's reviewed cards when they become due in an open tab", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 15, 23, 59));
    const { result } = renderHook(() => useReview(), { wrapper: Providers });
    await act(async () => result.current.generateCardsFromProgress());
    act(() => result.current.reviewCard("domain-match:zeus", 1));
    expect(result.current.dueCards.map((card) => card.id)).not.toContain(
      "domain-match:zeus",
    );

    vi.setSystemTime(new Date(2026, 9, 16, 0, 1));
    await act(async () => result.current.generateCardsFromProgress());
    expect(result.current.dueCards.map((card) => card.id)).toContain(
      "domain-match:zeus",
    );
    expect(result.current.dueCount).toBe(result.current.dueCards.length);
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
