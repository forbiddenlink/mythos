'use client';

import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';

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
  trackDeityView: (deityId: string) => void;
  trackStoryRead: (storyId: string) => void;
  trackPantheonExplore: (pantheonId: string) => void;
  trackLocationVisit: (locationId: string) => void;
  recordQuizScore: (quizId: string, score: number) => void;
  unlockAchievement: (achievementId: string, xp: number) => void;
  updateStreak: () => void;
  getStats: () => ProgressStats;
}

const PROGRESS_STORAGE_KEY = 'mythos-atlas-progress';

const DEFAULT_PROGRESS: UserProgress = {
  deitiesViewed: [],
  storiesRead: [],
  pantheonsExplored: [],
  locationsVisited: [],
  quizScores: {},
  achievements: [],
  dailyStreak: 0,
  lastVisit: '',
  totalXP: 0,
};

export const ProgressContext = createContext<ProgressContextValue | null>(null);

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
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

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [mounted, setMounted] = useState(false);

  // Load progress from localStorage on mount
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

      // First visit or streak broken, reset to 1
      return {
        ...prev,
        dailyStreak: 1,
        lastVisit: today,
      };
    });
  }, []);

  const trackDeityView = useCallback((deityId: string) => {
    setProgress((prev) => {
      if (prev.deitiesViewed.includes(deityId)) {
        return prev;
      }
      return {
        ...prev,
        deitiesViewed: [...prev.deitiesViewed, deityId],
      };
    });
  }, []);

  const trackStoryRead = useCallback((storyId: string) => {
    setProgress((prev) => {
      if (prev.storiesRead.includes(storyId)) {
        return prev;
      }
      return {
        ...prev,
        storiesRead: [...prev.storiesRead, storyId],
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
        ? quizScoresArray.reduce((sum, score) => sum + score, 0) / quizScoresArray.length
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

  return (
    <ProgressContext.Provider
      value={{
        progress,
        trackDeityView,
        trackStoryRead,
        trackPantheonExplore,
        trackLocationVisit,
        recordQuizScore,
        unlockAchievement,
        updateStreak,
        getStats,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}
