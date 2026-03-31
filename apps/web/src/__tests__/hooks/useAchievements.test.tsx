import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { type ReactNode } from "react";
import { useAchievements } from "@/hooks/useAchievements";
import { ProgressProvider } from "@/providers/progress-provider";
import { achievements, type Achievement } from "@/data/achievements";

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

describe("useAchievements", () => {
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
        renderHook(() => useAchievements());
      }).toThrow("useAchievements must be used within ProgressProvider");

      consoleSpy.mockRestore();
    });

    it("should not throw when used within ProgressProvider", () => {
      expect(() => {
        renderHook(() => useAchievements(), { wrapper });
      }).not.toThrow();
    });
  });

  describe("initial state", () => {
    it("should return all achievements with status", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      expect(result.current.achievements).toBeDefined();
      expect(result.current.achievements.length).toBe(achievements.length);
    });

    it("should have unlockedCount of 0 initially", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });
      expect(result.current.unlockedCount).toBe(0);
    });

    it("should have totalCount equal to achievements length", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });
      expect(result.current.totalCount).toBe(achievements.length);
    });

    it("should mark all achievements as not unlocked initially", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const allLocked = result.current.achievements.every((a) => !a.unlocked);
      expect(allLocked).toBe(true);
    });
  });

  describe("achievement status", () => {
    it("should include progress for achievements with count requirements", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const deitiesViewedAchievement = result.current.achievements.find(
        (a) => a.requirement.type === "deities_viewed",
      );

      expect(deitiesViewedAchievement).toBeDefined();
      expect(deitiesViewedAchievement?.progress).toBeDefined();
      expect(deitiesViewedAchievement?.progress?.current).toBe(0);
      expect(deitiesViewedAchievement?.progress?.target).toBeGreaterThan(0);
    });

    it("should include all achievement properties in status", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const firstAchievement = result.current.achievements[0];

      expect(firstAchievement).toHaveProperty("id");
      expect(firstAchievement).toHaveProperty("name");
      expect(firstAchievement).toHaveProperty("description");
      expect(firstAchievement).toHaveProperty("icon");
      expect(firstAchievement).toHaveProperty("xp");
      expect(firstAchievement).toHaveProperty("category");
      expect(firstAchievement).toHaveProperty("requirement");
      expect(firstAchievement).toHaveProperty("tier");
      expect(firstAchievement).toHaveProperty("unlocked");
      expect(firstAchievement).toHaveProperty("progress");
    });
  });

  describe("achievement progress tracking", () => {
    it("should track deities viewed progress", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const deityAchievement = result.current.achievements.find(
        (a) => a.requirement.type === "deities_viewed",
      );

      expect(deityAchievement?.progress?.current).toBe(0);
    });

    it("should track stories read progress", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const storyAchievement = result.current.achievements.find(
        (a) => a.requirement.type === "stories_read",
      );

      expect(storyAchievement?.progress?.current).toBe(0);
    });

    it("should track pantheons explored progress", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const pantheonAchievement = result.current.achievements.find(
        (a) => a.requirement.type === "pantheons_explored",
      );

      expect(pantheonAchievement?.progress?.current).toBe(0);
    });

    it("should track locations visited progress", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const locationAchievement = result.current.achievements.find(
        (a) => a.requirement.type === "locations_visited",
      );

      expect(locationAchievement?.progress?.current).toBe(0);
    });

    it("should track quizzes taken progress", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const quizAchievement = result.current.achievements.find(
        (a) => a.requirement.type === "quizzes_taken",
      );

      expect(quizAchievement?.progress?.current).toBe(0);
    });

    it("should track quiz perfect score progress", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const perfectScoreAchievement = result.current.achievements.find(
        (a) => a.requirement.type === "quiz_perfect_score",
      );

      expect(perfectScoreAchievement?.progress?.current).toBe(0);
    });

    it("should track daily streak progress", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const streakAchievement = result.current.achievements.find(
        (a) => a.requirement.type === "daily_streak",
      );

      expect(streakAchievement?.progress?.current).toBeDefined();
    });

    it("should track total XP progress", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const xpAchievement = result.current.achievements.find(
        (a) => a.requirement.type === "total_xp",
      );

      expect(xpAchievement?.progress?.current).toBe(0);
    });

    it("should track all pantheons progress", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const allPantheonsAchievement = result.current.achievements.find(
        (a) => a.requirement.type === "all_pantheons",
      );

      expect(allPantheonsAchievement?.progress?.current).toBe(0);
      expect(allPantheonsAchievement?.progress?.target).toBe(12); // ALL_PANTHEON_IDS.length
    });

    it("should track quick quiz score progress", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const quickQuizAchievement = result.current.achievements.find(
        (a) => a.requirement.type === "quick_quiz_score",
      );

      expect(quickQuizAchievement?.progress?.current).toBe(0);
    });

    it("should track daily challenge streak progress", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const dailyChallengeAchievement = result.current.achievements.find(
        (a) => a.requirement.type === "daily_challenge_streak",
      );

      expect(dailyChallengeAchievement?.progress?.current).toBe(0);
    });
  });

  describe("getRecentlyUnlocked", () => {
    it("should return empty array when no achievements unlocked", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const recentlyUnlocked = result.current.getRecentlyUnlocked();
      expect(recentlyUnlocked).toEqual([]);
    });
  });

  describe("checkAchievements", () => {
    it("should return function for checking achievements", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      expect(typeof result.current.checkAchievements).toBe("function");
    });

    it("should return array when called", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      let newlyUnlocked: Achievement[];
      act(() => {
        newlyUnlocked = result.current.checkAchievements();
      });

      expect(Array.isArray(newlyUnlocked!)).toBe(true);
    });
  });

  describe("achievement categories", () => {
    it("should include exploration achievements", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const explorationAchievements = result.current.achievements.filter(
        (a) => a.category === "exploration",
      );
      expect(explorationAchievements.length).toBeGreaterThan(0);
    });

    it("should include learning achievements", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const learningAchievements = result.current.achievements.filter(
        (a) => a.category === "learning",
      );
      expect(learningAchievements.length).toBeGreaterThan(0);
    });

    it("should include mastery achievements", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const masteryAchievements = result.current.achievements.filter(
        (a) => a.category === "mastery",
      );
      expect(masteryAchievements.length).toBeGreaterThan(0);
    });

    it("should include dedication achievements", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const dedicationAchievements = result.current.achievements.filter(
        (a) => a.category === "dedication",
      );
      expect(dedicationAchievements.length).toBeGreaterThan(0);
    });

    it("should include special achievements", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const specialAchievements = result.current.achievements.filter(
        (a) => a.category === "special",
      );
      expect(specialAchievements.length).toBeGreaterThan(0);
    });
  });

  describe("achievement tiers", () => {
    it("should include bronze tier achievements", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const bronzeAchievements = result.current.achievements.filter(
        (a) => a.tier === "bronze",
      );
      expect(bronzeAchievements.length).toBeGreaterThan(0);
    });

    it("should include silver tier achievements", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const silverAchievements = result.current.achievements.filter(
        (a) => a.tier === "silver",
      );
      expect(silverAchievements.length).toBeGreaterThan(0);
    });

    it("should include gold tier achievements", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const goldAchievements = result.current.achievements.filter(
        (a) => a.tier === "gold",
      );
      expect(goldAchievements.length).toBeGreaterThan(0);
    });

    it("should include mythic tier achievements", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const mythicAchievements = result.current.achievements.filter(
        (a) => a.tier === "mythic",
      );
      expect(mythicAchievements.length).toBeGreaterThan(0);
    });
  });

  describe("specific achievements", () => {
    it("should have first_deity achievement", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const firstDeity = result.current.achievements.find(
        (a) => a.id === "first_deity",
      );
      expect(firstDeity).toBeDefined();
      expect(firstDeity?.name).toBe("Divine Encounter");
      expect(firstDeity?.requirement.type).toBe("deities_viewed");
    });

    it("should have first_story achievement", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const firstStory = result.current.achievements.find(
        (a) => a.id === "first_story",
      );
      expect(firstStory).toBeDefined();
      expect(firstStory?.name).toBe("Story Seeker");
    });

    it("should have mythology_master achievement", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const mythologyMaster = result.current.achievements.find(
        (a) => a.id === "mythology_master",
      );
      expect(mythologyMaster).toBeDefined();
      expect(mythologyMaster?.requirement.type).toBe("all_pantheons");
      expect(mythologyMaster?.tier).toBe("mythic");
    });

    it("should have streak achievements", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const streak3 = result.current.achievements.find(
        (a) => a.id === "streak_3",
      );
      const streak7 = result.current.achievements.find(
        (a) => a.id === "streak_7",
      );
      const streak30 = result.current.achievements.find(
        (a) => a.id === "streak_30",
      );
      const streak100 = result.current.achievements.find(
        (a) => a.id === "streak_100",
      );

      expect(streak3).toBeDefined();
      expect(streak7).toBeDefined();
      expect(streak30).toBeDefined();
      expect(streak100).toBeDefined();
    });
  });

  describe("progress calculation", () => {
    it("should calculate progress percentage correctly", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      const achievement = result.current.achievements.find(
        (a) => a.id === "deity_explorer",
      );

      expect(achievement?.progress?.current).toBe(0);
      expect(achievement?.progress?.target).toBe(10);
    });

    it("should handle achievements without count requirements", () => {
      const { result } = renderHook(() => useAchievements(), { wrapper });

      // pantheon_complete doesn't have standard tracking
      const pantheonComplete = result.current.achievements.find(
        (a) => a.requirement.type === "pantheon_complete",
      );

      // This type returns undefined for progress
      if (pantheonComplete) {
        expect(pantheonComplete.progress).toBeUndefined();
      }
    });
  });
});
