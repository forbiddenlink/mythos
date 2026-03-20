import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { type ReactNode } from "react";
import { useProgress } from "@/hooks/use-progress";
import {
  ProgressProvider,
  type UserProgress,
  type ProgressStats,
} from "@/providers/progress-provider";

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

// Mock date functions
vi.mock("@/lib/date", () => ({
  getLocalToday: () => "2024-01-15",
  getLocalYesterday: () => "2024-01-14",
}));

function wrapper({ children }: { children: ReactNode }) {
  return <ProgressProvider>{children}</ProgressProvider>;
}

describe("useProgress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("context requirement", () => {
    it("should throw error when used outside ProgressProvider", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useProgress());
      }).toThrow("useProgress must be used within a ProgressProvider");

      consoleSpy.mockRestore();
    });

    it("should not throw when used within ProgressProvider", () => {
      expect(() => {
        renderHook(() => useProgress(), { wrapper });
      }).not.toThrow();
    });
  });

  describe("initial state", () => {
    it("should have empty arrays for tracking", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.progress.deitiesViewed).toEqual([]);
      expect(result.current.progress.storiesRead).toEqual([]);
      expect(result.current.progress.pantheonsExplored).toEqual([]);
      expect(result.current.progress.locationsVisited).toEqual([]);
      expect(result.current.progress.achievements).toEqual([]);
    });

    it("should have empty quiz scores", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      expect(result.current.progress.quizScores).toEqual({});
    });

    it("should have zero totalXP", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      expect(result.current.progress.totalXP).toBe(0);
    });

    it("should have default streak freezes", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      expect(result.current.progress.streakFreezes).toBe(2);
    });

    it("should have zero quick quiz high score", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      expect(result.current.progress.quickQuizHighScore).toBe(0);
    });
  });

  describe("trackDeityView", () => {
    it("should add deity to deitiesViewed", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackDeityView("zeus");
      });

      expect(result.current.progress.deitiesViewed).toContain("zeus");
    });

    it("should not add duplicate deities", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackDeityView("zeus");
        result.current.trackDeityView("zeus");
      });

      expect(result.current.progress.deitiesViewed).toHaveLength(1);
    });

    it("should add multiple different deities", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackDeityView("zeus");
        result.current.trackDeityView("athena");
        result.current.trackDeityView("poseidon");
      });

      expect(result.current.progress.deitiesViewed).toHaveLength(3);
      expect(result.current.progress.deitiesViewed).toContain("zeus");
      expect(result.current.progress.deitiesViewed).toContain("athena");
      expect(result.current.progress.deitiesViewed).toContain("poseidon");
    });

    it("should update today activity when viewing deity", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackDeityView("zeus");
      });

      expect(result.current.progress.todayActivity.deitiesViewed).toContain(
        "zeus",
      );
    });

    it("should track pantheon when provided", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackDeityView("zeus", "greek");
      });

      expect(result.current.progress.todayActivity.pantheonsViewed).toContain(
        "greek",
      );
    });
  });

  describe("trackStoryRead", () => {
    it("should add story to storiesRead", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackStoryRead("titanomachy");
      });

      expect(result.current.progress.storiesRead).toContain("titanomachy");
    });

    it("should not add duplicate stories", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackStoryRead("titanomachy");
        result.current.trackStoryRead("titanomachy");
      });

      expect(result.current.progress.storiesRead).toHaveLength(1);
    });

    it("should update today activity when reading story", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackStoryRead("titanomachy");
      });

      expect(result.current.progress.todayActivity.storiesRead).toContain(
        "titanomachy",
      );
    });
  });

  describe("trackPantheonExplore", () => {
    it("should add pantheon to pantheonsExplored", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackPantheonExplore("greek");
      });

      expect(result.current.progress.pantheonsExplored).toContain("greek");
    });

    it("should not add duplicate pantheons", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackPantheonExplore("greek");
        result.current.trackPantheonExplore("greek");
      });

      expect(result.current.progress.pantheonsExplored).toHaveLength(1);
    });

    it("should track multiple pantheons", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackPantheonExplore("greek");
        result.current.trackPantheonExplore("norse");
        result.current.trackPantheonExplore("egyptian");
      });

      expect(result.current.progress.pantheonsExplored).toHaveLength(3);
    });
  });

  describe("trackLocationVisit", () => {
    it("should add location to locationsVisited", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackLocationVisit("mount-olympus");
      });

      expect(result.current.progress.locationsVisited).toContain(
        "mount-olympus",
      );
    });

    it("should not add duplicate locations", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackLocationVisit("mount-olympus");
        result.current.trackLocationVisit("mount-olympus");
      });

      expect(result.current.progress.locationsVisited).toHaveLength(1);
    });
  });

  describe("recordQuizScore", () => {
    it("should record quiz score", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.recordQuizScore("greek-quiz", 80);
      });

      expect(result.current.progress.quizScores["greek-quiz"]).toBe(80);
    });

    it("should keep highest score when quiz is retaken", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.recordQuizScore("greek-quiz", 80);
      });
      act(() => {
        result.current.recordQuizScore("greek-quiz", 60);
      });

      expect(result.current.progress.quizScores["greek-quiz"]).toBe(80);
    });

    it("should update to higher score", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.recordQuizScore("greek-quiz", 60);
      });
      act(() => {
        result.current.recordQuizScore("greek-quiz", 90);
      });

      expect(result.current.progress.quizScores["greek-quiz"]).toBe(90);
    });

    it("should track multiple quizzes independently", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.recordQuizScore("greek-quiz", 80);
        result.current.recordQuizScore("norse-quiz", 90);
        result.current.recordQuizScore("egyptian-quiz", 70);
      });

      expect(result.current.progress.quizScores["greek-quiz"]).toBe(80);
      expect(result.current.progress.quizScores["norse-quiz"]).toBe(90);
      expect(result.current.progress.quizScores["egyptian-quiz"]).toBe(70);
    });
  });

  describe("unlockAchievement", () => {
    it("should add achievement to achievements list", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.unlockAchievement("first_deity", 10);
      });

      expect(result.current.progress.achievements).toContain("first_deity");
    });

    it("should add XP when unlocking achievement", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.unlockAchievement("first_deity", 10);
      });

      expect(result.current.progress.totalXP).toBe(10);
    });

    it("should not add duplicate achievements", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.unlockAchievement("first_deity", 10);
        result.current.unlockAchievement("first_deity", 10);
      });

      expect(result.current.progress.achievements).toHaveLength(1);
      expect(result.current.progress.totalXP).toBe(10);
    });

    it("should accumulate XP from multiple achievements", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.unlockAchievement("first_deity", 10);
        result.current.unlockAchievement("first_story", 10);
        result.current.unlockAchievement("first_pantheon", 15);
      });

      expect(result.current.progress.totalXP).toBe(35);
    });
  });

  describe("getStats", () => {
    it("should return stats object", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      const stats = result.current.getStats();

      expect(stats).toHaveProperty("totalDeitiesViewed");
      expect(stats).toHaveProperty("totalStoriesRead");
      expect(stats).toHaveProperty("totalPantheonsExplored");
      expect(stats).toHaveProperty("totalLocationsVisited");
      expect(stats).toHaveProperty("totalQuizzesTaken");
      expect(stats).toHaveProperty("averageQuizScore");
      expect(stats).toHaveProperty("totalAchievements");
      expect(stats).toHaveProperty("totalXP");
      expect(stats).toHaveProperty("dailyStreak");
    });

    it("should calculate stats correctly", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackDeityView("zeus");
        result.current.trackDeityView("athena");
        result.current.trackStoryRead("titanomachy");
        result.current.trackPantheonExplore("greek");
        result.current.trackLocationVisit("mount-olympus");
        result.current.recordQuizScore("quiz1", 80);
        result.current.recordQuizScore("quiz2", 100);
        result.current.unlockAchievement("first_deity", 10);
      });

      const stats = result.current.getStats();

      expect(stats.totalDeitiesViewed).toBe(2);
      expect(stats.totalStoriesRead).toBe(1);
      expect(stats.totalPantheonsExplored).toBe(1);
      expect(stats.totalLocationsVisited).toBe(1);
      expect(stats.totalQuizzesTaken).toBe(2);
      expect(stats.averageQuizScore).toBe(90);
      expect(stats.totalAchievements).toBe(1);
      expect(stats.totalXP).toBe(10);
    });

    it("should return 0 average when no quizzes taken", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      const stats = result.current.getStats();

      expect(stats.averageQuizScore).toBe(0);
    });
  });

  describe("streak management", () => {
    it("should have updateStreak function", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      expect(typeof result.current.updateStreak).toBe("function");
    });

    it("should have useStreakFreeze function", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      expect(typeof result.current.useStreakFreeze).toBe("function");
    });

    it("should have addStreakFreeze function", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      expect(typeof result.current.addStreakFreeze).toBe("function");
    });

    it("should add streak freezes", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      const initialFreezes = result.current.progress.streakFreezes;

      act(() => {
        result.current.addStreakFreeze(3);
      });

      expect(result.current.progress.streakFreezes).toBe(initialFreezes + 3);
    });
  });

  describe("quick quiz high score", () => {
    it("should update quick quiz high score", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateQuickQuizHighScore(15);
      });

      expect(result.current.progress.quickQuizHighScore).toBe(15);
    });

    it("should only update if new score is higher", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateQuickQuizHighScore(15);
      });
      act(() => {
        result.current.updateQuickQuizHighScore(10);
      });

      expect(result.current.progress.quickQuizHighScore).toBe(15);
    });

    it("should update to higher score", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.updateQuickQuizHighScore(10);
      });
      act(() => {
        result.current.updateQuickQuizHighScore(20);
      });

      expect(result.current.progress.quickQuizHighScore).toBe(20);
    });
  });

  describe("daily challenges", () => {
    it("should have claimDailyChallenge function", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      expect(typeof result.current.claimDailyChallenge).toBe("function");
    });

    it("should have isDailyChallengeClaimed function", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      expect(typeof result.current.isDailyChallengeClaimed).toBe("function");
    });

    it("should claim daily challenge and add XP", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.claimDailyChallenge("challenge1", 50);
      });

      expect(result.current.isDailyChallengeClaimed("challenge1")).toBe(true);
      expect(result.current.progress.totalXP).toBe(50);
    });

    it("should not claim same challenge twice", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.claimDailyChallenge("challenge1", 50);
      });
      act(() => {
        result.current.claimDailyChallenge("challenge1", 50);
      });

      expect(result.current.progress.totalXP).toBe(50);
    });

    it("should track daily challenge streak", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.claimDailyChallenge("challenge1", 50);
      });

      expect(
        result.current.progress.dailyChallengeStreak,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  describe("quiz completion tracking", () => {
    it("should have trackQuizCompletion function", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });
      expect(typeof result.current.trackQuizCompletion).toBe("function");
    });

    it("should track quiz completion in today activity", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackQuizCompletion(80);
      });

      expect(result.current.progress.todayActivity.quizCompleted).toBe(true);
      expect(result.current.progress.todayActivity.quizScore).toBe(80);
    });

    it("should keep highest quiz score for today", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackQuizCompletion(80);
      });
      act(() => {
        result.current.trackQuizCompletion(60);
      });

      expect(result.current.progress.todayActivity.quizScore).toBe(80);
    });
  });

  describe("today activity", () => {
    it("should have today activity tracking", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.progress.todayActivity).toBeDefined();
      expect(result.current.progress.todayActivity.deitiesViewed).toBeDefined();
      expect(result.current.progress.todayActivity.storiesRead).toBeDefined();
      expect(
        result.current.progress.todayActivity.pantheonsViewed,
      ).toBeDefined();
      expect(result.current.progress.todayActivity.quizCompleted).toBeDefined();
      expect(result.current.progress.todayActivity.quizScore).toBeDefined();
    });
  });

  describe("edge cases", () => {
    it("should handle empty string ids", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackDeityView("");
      });

      expect(result.current.progress.deitiesViewed).toContain("");
    });

    it("should handle special characters in ids", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.trackDeityView("ah-puch-mayan");
        result.current.trackStoryRead("children-of-lir");
      });

      expect(result.current.progress.deitiesViewed).toContain("ah-puch-mayan");
      expect(result.current.progress.storiesRead).toContain("children-of-lir");
    });

    it("should handle zero XP achievements", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.unlockAchievement("test-achievement", 0);
      });

      expect(result.current.progress.achievements).toContain(
        "test-achievement",
      );
      expect(result.current.progress.totalXP).toBe(0);
    });

    it("should handle rapid tracking operations", () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.trackDeityView(`deity-${i}`);
        }
      });

      expect(result.current.progress.deitiesViewed).toHaveLength(100);
    });
  });
});
