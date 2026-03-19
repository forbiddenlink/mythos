"use client";

import { getLocalToday, getLocalYesterday } from "@/lib/date";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface UserProgress {
  deitiesViewed: string[];
  storiesRead: string[];
  pantheonsExplored: string[];
  locationsVisited: string[];
  quizScores: Record<string, number>;
  achievements: string[];
  dailyStreak: number;
  lastVisit: string; // ISO date
  totalXP: number;
  streakFreezes: number;
  quickQuizHighScore: number;
  // Daily challenges
  dailyChallengeStreak: number;
  lastDailyChallengeDate: string;
  claimedDailyChallenges: string[]; // Format: "YYYY-MM-DD:challengeId"
  // Today's activity tracking
  todayActivity: {
    date: string;
    deitiesViewed: string[];
    storiesRead: string[];
    pantheonsViewed: string[];
    quizCompleted: boolean;
    quizScore: number;
  };
}

export interface ProgressStats {
  totalDeitiesViewed: number;
  totalStoriesRead: number;
  totalPantheonsExplored: number;
  totalLocationsVisited: number;
  totalQuizzesTaken: number;
  averageQuizScore: number;
  totalAchievements: number;
  totalXP: number;
  dailyStreak: number;
}

export interface ProgressContextValue {
  progress: UserProgress;
  trackDeityView: (deityId: string, pantheonId?: string) => void;
  trackStoryRead: (storyId: string) => void;
  trackPantheonExplore: (pantheonId: string) => void;
  trackLocationVisit: (locationId: string) => void;
  recordQuizScore: (quizId: string, score: number) => void;
  unlockAchievement: (achievementId: string, xp: number) => void;
  updateStreak: () => void;
  getStats: () => ProgressStats;
  useStreakFreeze: () => boolean;
  addStreakFreeze: (count: number) => void;
  updateQuickQuizHighScore: (score: number) => void;
  // Daily challenges
  claimDailyChallenge: (challengeId: string, xpReward: number) => void;
  isDailyChallengeClaimed: (challengeId: string) => boolean;
  trackQuizCompletion: (score: number) => void;
}

const PROGRESS_STORAGE_KEY = "mythos-atlas-progress";

const DEFAULT_PROGRESS: UserProgress = {
  deitiesViewed: [],
  storiesRead: [],
  pantheonsExplored: [],
  locationsVisited: [],
  quizScores: {},
  achievements: [],
  dailyStreak: 0,
  lastVisit: "",
  totalXP: 0,
  streakFreezes: 2,
  quickQuizHighScore: 0,
  // Daily challenges
  dailyChallengeStreak: 0,
  lastDailyChallengeDate: "",
  claimedDailyChallenges: [],
  todayActivity: {
    date: "",
    deitiesViewed: [],
    storiesRead: [],
    pantheonsViewed: [],
    quizCompleted: false,
    quizScore: 0,
  },
};

export const ProgressContext = createContext<ProgressContextValue | null>(null);

function getToday(): string {
  return getLocalToday();
}

function getYesterday(): string {
  return getLocalYesterday();
}

function loadProgress(): UserProgress {
  if (globalThis.window === undefined) return DEFAULT_PROGRESS;
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle any missing fields from older versions
      return { ...DEFAULT_PROGRESS, ...parsed };
    }
    return DEFAULT_PROGRESS;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function saveProgress(progress: UserProgress) {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function ProgressProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [mounted, setMounted] = useState(false);

  // Hydration-safe: load from localStorage on client mount
  useEffect(() => {
    setProgress(loadProgress());
    setMounted(true);
  }, []);

  // Save progress to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      saveProgress(progress);
    }
  }, [progress, mounted]);

  // Update streak on mount
  useEffect(() => {
    if (mounted) {
      updateStreak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const updateStreak = useCallback(() => {
    setProgress((prev) => {
      const today = getToday();
      const yesterday = getYesterday();

      // Already visited today, no change needed
      if (prev.lastVisit === today) {
        return prev;
      }

      // Visited yesterday, increment streak
      if (prev.lastVisit === yesterday) {
        return {
          ...prev,
          dailyStreak: prev.dailyStreak + 1,
          lastVisit: today,
        };
      }

      // Streak would break - try to use a freeze if available and streak > 0
      if (
        prev.streakFreezes > 0 &&
        prev.dailyStreak > 0 &&
        prev.lastVisit !== ""
      ) {
        return {
          ...prev,
          streakFreezes: prev.streakFreezes - 1,
          lastVisit: today,
          // Keep the streak intact (don't increment, just preserve)
        };
      }

      // First visit or streak broken (no freeze available), reset to 1
      return {
        ...prev,
        dailyStreak: 1,
        lastVisit: today,
      };
    });
  }, []);

  const useStreakFreeze = useCallback((): boolean => {
    let freezeUsed = false;
    setProgress((prev) => {
      // Can only use freeze if we have one and streak would break
      if (prev.streakFreezes > 0 && prev.dailyStreak > 0) {
        freezeUsed = true;
        return {
          ...prev,
          streakFreezes: prev.streakFreezes - 1,
        };
      }
      return prev;
    });
    return freezeUsed;
  }, []);

  const addStreakFreeze = useCallback((count: number) => {
    setProgress((prev) => ({
      ...prev,
      streakFreezes: prev.streakFreezes + count,
    }));
  }, []);

  const updateQuickQuizHighScore = useCallback((score: number) => {
    setProgress((prev) => {
      if (score <= prev.quickQuizHighScore) {
        return prev;
      }
      return {
        ...prev,
        quickQuizHighScore: score,
      };
    });
  }, []);

  const trackDeityView = useCallback((deityId: string, pantheonId?: string) => {
    setProgress((prev) => {
      const today = getToday();
      const isNewDeity = !prev.deitiesViewed.includes(deityId);

      // Update today's activity
      const todayActivity =
        prev.todayActivity.date === today
          ? prev.todayActivity
          : {
              date: today,
              deitiesViewed: [],
              storiesRead: [],
              pantheonsViewed: [],
              quizCompleted: false,
              quizScore: 0,
            };

      const updatedTodayActivity = {
        ...todayActivity,
        deitiesViewed: todayActivity.deitiesViewed.includes(deityId)
          ? todayActivity.deitiesViewed
          : [...todayActivity.deitiesViewed, deityId],
        pantheonsViewed:
          pantheonId && !todayActivity.pantheonsViewed.includes(pantheonId)
            ? [...todayActivity.pantheonsViewed, pantheonId]
            : todayActivity.pantheonsViewed,
      };

      return {
        ...prev,
        deitiesViewed: isNewDeity
          ? [...prev.deitiesViewed, deityId]
          : prev.deitiesViewed,
        todayActivity: updatedTodayActivity,
      };
    });
  }, []);

  const trackStoryRead = useCallback((storyId: string) => {
    setProgress((prev) => {
      const today = getToday();
      const isNewStory = !prev.storiesRead.includes(storyId);

      // Update today's activity
      const todayActivity =
        prev.todayActivity.date === today
          ? prev.todayActivity
          : {
              date: today,
              deitiesViewed: [],
              storiesRead: [],
              pantheonsViewed: [],
              quizCompleted: false,
              quizScore: 0,
            };

      const updatedTodayActivity = {
        ...todayActivity,
        storiesRead: todayActivity.storiesRead.includes(storyId)
          ? todayActivity.storiesRead
          : [...todayActivity.storiesRead, storyId],
      };

      return {
        ...prev,
        storiesRead: isNewStory
          ? [...prev.storiesRead, storyId]
          : prev.storiesRead,
        todayActivity: updatedTodayActivity,
      };
    });
  }, []);

  const trackPantheonExplore = useCallback((pantheonId: string) => {
    setProgress((prev) => {
      if (prev.pantheonsExplored.includes(pantheonId)) {
        return prev;
      }
      return {
        ...prev,
        pantheonsExplored: [...prev.pantheonsExplored, pantheonId],
      };
    });
  }, []);

  const trackLocationVisit = useCallback((locationId: string) => {
    setProgress((prev) => {
      if (prev.locationsVisited.includes(locationId)) {
        return prev;
      }
      return {
        ...prev,
        locationsVisited: [...prev.locationsVisited, locationId],
      };
    });
  }, []);

  const recordQuizScore = useCallback((quizId: string, score: number) => {
    setProgress((prev) => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [quizId]: Math.max(prev.quizScores[quizId] ?? 0, score),
      },
    }));
  }, []);

  const unlockAchievement = useCallback((achievementId: string, xp: number) => {
    setProgress((prev) => {
      if (prev.achievements.includes(achievementId)) {
        return prev;
      }
      return {
        ...prev,
        achievements: [...prev.achievements, achievementId],
        totalXP: prev.totalXP + xp,
      };
    });
  }, []);

  const getStats = useCallback((): ProgressStats => {
    const quizScoresArray = Object.values(progress.quizScores);
    const averageQuizScore =
      quizScoresArray.length > 0
        ? quizScoresArray.reduce((sum, score) => sum + score, 0) /
          quizScoresArray.length
        : 0;

    return {
      totalDeitiesViewed: progress.deitiesViewed.length,
      totalStoriesRead: progress.storiesRead.length,
      totalPantheonsExplored: progress.pantheonsExplored.length,
      totalLocationsVisited: progress.locationsVisited.length,
      totalQuizzesTaken: quizScoresArray.length,
      averageQuizScore: Math.round(averageQuizScore * 10) / 10,
      totalAchievements: progress.achievements.length,
      totalXP: progress.totalXP,
      dailyStreak: progress.dailyStreak,
    };
  }, [progress]);

  // Daily challenge methods
  const claimDailyChallenge = useCallback(
    (challengeId: string, xpReward: number) => {
      setProgress((prev) => {
        const today = getToday();
        const claimKey = `${today}:${challengeId}`;

        // Already claimed today
        if (prev.claimedDailyChallenges.includes(claimKey)) {
          return prev;
        }

        // Calculate new streak
        const yesterday = getYesterday();
        const hadYesterdayClaim = prev.claimedDailyChallenges.some((c) =>
          c.startsWith(`${yesterday}:`),
        );

        let newStreak = 1;
        if (prev.lastDailyChallengeDate === today) {
          newStreak = prev.dailyChallengeStreak;
        } else if (
          prev.lastDailyChallengeDate === yesterday &&
          hadYesterdayClaim
        ) {
          newStreak = prev.dailyChallengeStreak + 1;
        }

        return {
          ...prev,
          claimedDailyChallenges: [...prev.claimedDailyChallenges, claimKey],
          totalXP: prev.totalXP + xpReward,
          dailyChallengeStreak: newStreak,
          lastDailyChallengeDate: today,
        };
      });
    },
    [],
  );

  const isDailyChallengeClaimed = useCallback(
    (challengeId: string): boolean => {
      const today = getToday();
      const claimKey = `${today}:${challengeId}`;
      return progress.claimedDailyChallenges.includes(claimKey);
    },
    [progress.claimedDailyChallenges],
  );

  const trackQuizCompletion = useCallback((score: number) => {
    setProgress((prev) => {
      const today = getToday();

      // Update today's activity
      const todayActivity =
        prev.todayActivity.date === today
          ? prev.todayActivity
          : {
              date: today,
              deitiesViewed: [],
              storiesRead: [],
              pantheonsViewed: [],
              quizCompleted: false,
              quizScore: 0,
            };

      return {
        ...prev,
        todayActivity: {
          ...todayActivity,
          quizCompleted: true,
          quizScore: Math.max(todayActivity.quizScore, score),
        },
      };
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      progress,
      trackDeityView,
      trackStoryRead,
      trackPantheonExplore,
      trackLocationVisit,
      recordQuizScore,
      unlockAchievement,
      updateStreak,
      getStats,
      useStreakFreeze,
      addStreakFreeze,
      updateQuickQuizHighScore,
      claimDailyChallenge,
      isDailyChallengeClaimed,
      trackQuizCompletion,
    }),
    [
      progress,
      trackDeityView,
      trackStoryRead,
      trackPantheonExplore,
      trackLocationVisit,
      recordQuizScore,
      unlockAchievement,
      updateStreak,
      getStats,
      useStreakFreeze,
      addStreakFreeze,
      updateQuickQuizHighScore,
      claimDailyChallenge,
      isDailyChallengeClaimed,
      trackQuizCompletion,
    ],
  );

  return (
    <ProgressContext.Provider value={contextValue}>
      {children}
    </ProgressContext.Provider>
  );
}
