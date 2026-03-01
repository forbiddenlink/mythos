import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContext, type ReactNode } from 'react';
import {
  LeaderboardProvider,
  LeaderboardContext,
  type LeaderboardContextValue,
} from '@/providers/leaderboard-provider';

// Helper hook to access context
function useLeaderboard(): LeaderboardContextValue {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
}

// Wrapper component
function wrapper({ children }: { children: ReactNode }) {
  return <LeaderboardProvider>{children}</LeaderboardProvider>;
}

// Mock localStorage
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

function seedEntries() {
  return [
    {
      id: 'user_a',
      nickname: 'Alice',
      totalXP: 1000,
      quickQuizHighScore: 70,
      achievementsUnlocked: 15,
      longestStreak: 5,
      lastUpdated: '2024-06-15T00:00:00.000Z',
    },
    {
      id: 'user_b',
      nickname: 'Bob',
      totalXP: 2000,
      quickQuizHighScore: 95,
      achievementsUnlocked: 8,
      longestStreak: 20,
      lastUpdated: '2024-06-15T00:00:00.000Z',
    },
    {
      id: 'user_c',
      nickname: 'Charlie',
      totalXP: 1500,
      quickQuizHighScore: 85,
      achievementsUnlocked: 12,
      longestStreak: 10,
      lastUpdated: '2024-06-15T00:00:00.000Z',
    },
  ];
}

describe('LeaderboardProvider', () => {
  beforeEach(() => {
    localStorageData = {};
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('should render children', () => {
      const { result } = renderHook(() => useLeaderboard(), { wrapper });
      expect(result.current).toBeDefined();
    });

    it('should provide all expected context methods and values', () => {
      const { result } = renderHook(() => useLeaderboard(), { wrapper });
      expect(result.current).toHaveProperty('entries');
      expect(result.current).toHaveProperty('currentUserId');
      expect(result.current).toHaveProperty('currentEntry');
      expect(result.current).toHaveProperty('setNickname');
      expect(result.current).toHaveProperty('syncFromProgress');
      expect(result.current).toHaveProperty('getRankings');
      expect(result.current).toHaveProperty('getUserRank');
    });
  });

  describe('initial state', () => {
    it('should start with empty entries when no stored data', async () => {
      const { result } = renderHook(() => useLeaderboard(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      // After mount, entries loaded from (empty) localStorage
      expect(result.current.entries).toEqual([]);
    });

    it('should have null currentEntry when no data', async () => {
      const { result } = renderHook(() => useLeaderboard(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.currentEntry).toBeNull();
    });

    it('should generate a userId on mount', async () => {
      const { result } = renderHook(() => useLeaderboard(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.currentUserId).toBeTruthy();
    });

    it('should load existing entries from localStorage', async () => {
      const existingEntries = [
        {
          id: 'user_existing',
          nickname: 'TestUser',
          totalXP: 500,
          quickQuizHighScore: 90,
          achievementsUnlocked: 5,
          longestStreak: 10,
          lastUpdated: '2024-06-14T00:00:00.000Z',
        },
      ];
      localStorageData['mythos-atlas-leaderboard'] = JSON.stringify(existingEntries);

      const { result } = renderHook(() => useLeaderboard(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.entries).toHaveLength(1);
      expect(result.current.entries[0].nickname).toBe('TestUser');
    });
  });

  describe('setNickname', () => {
    it('should create a new entry when user has no entry yet', async () => {
      const { result } = renderHook(() => useLeaderboard(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.setNickname('MythLover');
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.entries.length).toBeGreaterThanOrEqual(1);
      const userEntry = result.current.entries.find(
        (e) => e.id === result.current.currentUserId
      );
      expect(userEntry?.nickname).toBe('MythLover');
    });

    it('should update existing entry nickname', async () => {
      const { result } = renderHook(() => useLeaderboard(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.setNickname('FirstName');
      });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.setNickname('UpdatedName');
      });

      await act(async () => {
        vi.runAllTimers();
      });

      const userEntry = result.current.entries.find(
        (e) => e.id === result.current.currentUserId
      );
      expect(userEntry?.nickname).toBe('UpdatedName');
    });
  });

  describe('syncFromProgress', () => {
    it('should create entry from progress data', async () => {
      const { result } = renderHook(() => useLeaderboard(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.syncFromProgress({
          totalXP: 1000,
          quickQuizHighScore: 95,
          achievementsCount: 10,
          dailyStreak: 7,
        });
      });

      await act(async () => {
        vi.runAllTimers();
      });

      const userEntry = result.current.entries.find(
        (e) => e.id === result.current.currentUserId
      );
      expect(userEntry).toBeDefined();
      expect(userEntry?.totalXP).toBe(1000);
      expect(userEntry?.quickQuizHighScore).toBe(95);
      expect(userEntry?.achievementsUnlocked).toBe(10);
      expect(userEntry?.longestStreak).toBe(7);
    });

    it('should keep the longest streak on subsequent syncs', async () => {
      const { result } = renderHook(() => useLeaderboard(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.syncFromProgress({
          totalXP: 500,
          quickQuizHighScore: 80,
          achievementsCount: 5,
          dailyStreak: 15,
        });
      });

      await act(async () => {
        vi.runAllTimers();
      });

      // Sync again with a lower streak
      act(() => {
        result.current.syncFromProgress({
          totalXP: 600,
          quickQuizHighScore: 85,
          achievementsCount: 6,
          dailyStreak: 3,
        });
      });

      await act(async () => {
        vi.runAllTimers();
      });

      const userEntry = result.current.entries.find(
        (e) => e.id === result.current.currentUserId
      );
      expect(userEntry?.longestStreak).toBe(15); // kept the higher value
      expect(userEntry?.totalXP).toBe(600); // updated
    });

    it('should preserve nickname set before sync', async () => {
      const { result } = renderHook(() => useLeaderboard(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.setNickname('MyNickname');
      });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.syncFromProgress({
          totalXP: 200,
          quickQuizHighScore: 70,
          achievementsCount: 2,
          dailyStreak: 5,
        });
      });

      await act(async () => {
        vi.runAllTimers();
      });

      const userEntry = result.current.entries.find(
        (e) => e.id === result.current.currentUserId
      );
      expect(userEntry?.nickname).toBe('MyNickname');
    });
  });

  describe('getRankings', () => {
    it('should rank by XP descending', async () => {
      localStorageData['mythos-atlas-leaderboard'] = JSON.stringify(seedEntries());
      const { result } = renderHook(() => useLeaderboard(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      const rankings = result.current.getRankings('xp');
      expect(rankings[0].nickname).toBe('Bob');        // 2000
      expect(rankings[1].nickname).toBe('Charlie');     // 1500
      expect(rankings[2].nickname).toBe('Alice');       // 1000
    });

    it('should rank by quiz high score descending', async () => {
      localStorageData['mythos-atlas-leaderboard'] = JSON.stringify(seedEntries());
      const { result } = renderHook(() => useLeaderboard(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      const rankings = result.current.getRankings('quiz');
      expect(rankings[0].nickname).toBe('Bob');        // 95
      expect(rankings[1].nickname).toBe('Charlie');     // 85
      expect(rankings[2].nickname).toBe('Alice');       // 70
    });

    it('should rank by achievements descending', async () => {
      localStorageData['mythos-atlas-leaderboard'] = JSON.stringify(seedEntries());
      const { result } = renderHook(() => useLeaderboard(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      const rankings = result.current.getRankings('achievements');
      expect(rankings[0].nickname).toBe('Alice');       // 15
      expect(rankings[1].nickname).toBe('Charlie');     // 12
      expect(rankings[2].nickname).toBe('Bob');          // 8
    });

    it('should rank by streak descending', async () => {
      localStorageData['mythos-atlas-leaderboard'] = JSON.stringify(seedEntries());
      const { result } = renderHook(() => useLeaderboard(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      const rankings = result.current.getRankings('streak');
      expect(rankings[0].nickname).toBe('Bob');         // 20
      expect(rankings[1].nickname).toBe('Charlie');     // 10
      expect(rankings[2].nickname).toBe('Alice');       // 5
    });

    it('should return empty array when no entries', async () => {
      const { result } = renderHook(() => useLeaderboard(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.getRankings('xp')).toEqual([]);
    });
  });

  describe('getUserRank', () => {
    it('should return correct rank for current user', async () => {
      const entries = [
        {
          id: 'user_top',
          nickname: 'Top',
          totalXP: 5000,
          quickQuizHighScore: 100,
          achievementsUnlocked: 20,
          longestStreak: 30,
          lastUpdated: '2024-06-15T00:00:00.000Z',
        },
      ];
      localStorageData['mythos-atlas-leaderboard'] = JSON.stringify(entries);
      const { result } = renderHook(() => useLeaderboard(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      // Current user is not in the entries, so rank = entries.length + 1
      const rank = result.current.getUserRank('xp');
      expect(rank).toBe(2);
    });

    it('should return 1 when user is top ranked', async () => {
      const { result } = renderHook(() => useLeaderboard(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      // Add the current user with high XP
      act(() => {
        result.current.syncFromProgress({
          totalXP: 9999,
          quickQuizHighScore: 100,
          achievementsCount: 50,
          dailyStreak: 100,
        });
      });

      await act(async () => {
        vi.runAllTimers();
      });

      const rank = result.current.getUserRank('xp');
      expect(rank).toBe(1);
    });
  });
});
