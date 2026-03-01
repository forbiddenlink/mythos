'use client';

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  totalXP: number;
  quickQuizHighScore: number;
  achievementsUnlocked: number;
  longestStreak: number;
  lastUpdated: string; // ISO date
}

export interface LeaderboardContextValue {
  entries: LeaderboardEntry[];
  currentUserId: string;
  currentEntry: LeaderboardEntry | null;
  setNickname: (nickname: string) => void;
  syncFromProgress: (progress: {
    totalXP: number;
    quickQuizHighScore: number;
    achievementsCount: number;
    dailyStreak: number;
  }) => void;
  getRankings: (category: LeaderboardCategory) => LeaderboardEntry[];
  getUserRank: (category: LeaderboardCategory) => number;
}

export type LeaderboardCategory = 'xp' | 'quiz' | 'achievements' | 'streak';

const LEADERBOARD_STORAGE_KEY = 'mythos-atlas-leaderboard';
const USER_ID_STORAGE_KEY = 'mythos-atlas-user-id';

function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function generateDefaultNickname(): string {
  const randomNum = Math.floor(Math.random() * 9999) + 1;
  return `Anonymous Explorer #${randomNum}`;
}

function loadLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(entries: LeaderboardEntry[]) {
  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage might be full
  }
}

function loadUserId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let userId = localStorage.getItem(USER_ID_STORAGE_KEY);
    if (!userId) {
      userId = generateUserId();
      localStorage.setItem(USER_ID_STORAGE_KEY, userId);
    }
    return userId;
  } catch {
    return generateUserId();
  }
}

export const LeaderboardContext = createContext<LeaderboardContextValue | null>(null);

export function LeaderboardProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate leaderboard from localStorage (SSR-safe)
    setEntries(loadLeaderboard());
    setCurrentUserId(loadUserId());
    setMounted(true);
  }, []);

  // Save to localStorage when entries change
  useEffect(() => {
    if (mounted) {
      saveLeaderboard(entries);
    }
  }, [entries, mounted]);

  const currentEntry = entries.find((e) => e.id === currentUserId) || null;

  const setNickname = useCallback((nickname: string) => {
    setEntries((prev) => {
      const existing = prev.find((e) => e.id === currentUserId);
      if (existing) {
        return prev.map((e) =>
          e.id === currentUserId ? { ...e, nickname } : e
        );
      } else {
        return [
          ...prev,
          {
            id: currentUserId,
            nickname,
            totalXP: 0,
            quickQuizHighScore: 0,
            achievementsUnlocked: 0,
            longestStreak: 0,
            lastUpdated: new Date().toISOString(),
          },
        ];
      }
    });
  }, [currentUserId]);

  const syncFromProgress = useCallback(
    (progress: {
      totalXP: number;
      quickQuizHighScore: number;
      achievementsCount: number;
      dailyStreak: number;
    }) => {
      setEntries((prev) => {
        const existing = prev.find((e) => e.id === currentUserId);
        const newEntry: LeaderboardEntry = {
          id: currentUserId,
          nickname: existing?.nickname || generateDefaultNickname(),
          totalXP: progress.totalXP,
          quickQuizHighScore: progress.quickQuizHighScore,
          achievementsUnlocked: progress.achievementsCount,
          longestStreak: Math.max(existing?.longestStreak || 0, progress.dailyStreak),
          lastUpdated: new Date().toISOString(),
        };

        if (existing) {
          return prev.map((e) =>
            e.id === currentUserId ? newEntry : e
          );
        } else {
          return [...prev, newEntry];
        }
      });
    },
    [currentUserId]
  );

  const getRankings = useCallback(
    (category: LeaderboardCategory): LeaderboardEntry[] => {
      const sorted = [...entries];
      switch (category) {
        case 'xp':
          sorted.sort((a, b) => b.totalXP - a.totalXP);
          break;
        case 'quiz':
          sorted.sort((a, b) => b.quickQuizHighScore - a.quickQuizHighScore);
          break;
        case 'achievements':
          sorted.sort((a, b) => b.achievementsUnlocked - a.achievementsUnlocked);
          break;
        case 'streak':
          sorted.sort((a, b) => b.longestStreak - a.longestStreak);
          break;
      }
      return sorted;
    },
    [entries]
  );

  const getUserRank = useCallback(
    (category: LeaderboardCategory): number => {
      const rankings = getRankings(category);
      const index = rankings.findIndex((e) => e.id === currentUserId);
      return index === -1 ? rankings.length + 1 : index + 1;
    },
    [getRankings, currentUserId]
  );

  const contextValue = useMemo(
    () => ({
      entries,
      currentUserId,
      currentEntry,
      setNickname,
      syncFromProgress,
      getRankings,
      getUserRank,
    }),
    [entries, currentUserId, currentEntry, setNickname, syncFromProgress, getRankings, getUserRank]
  );

  return (
    <LeaderboardContext.Provider value={contextValue}>
      {children}
    </LeaderboardContext.Provider>
  );
}
