import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { ProgressProvider, ProgressContext, type UserProgress, type ProgressContextValue } from '@/providers/progress-provider';
import { useContext } from 'react';

// Helper hook to access context
function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}

// Wrapper component
function wrapper({ children }: { children: ReactNode }) {
  return <ProgressProvider>{children}</ProgressProvider>;
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

describe('ProgressProvider', () => {
  beforeEach(() => {
    localStorageData = {};
    vi.useFakeTimers();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('State initialization', () => {
    it('should load progress from localStorage', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const savedProgress: UserProgress = {
        deitiesViewed: ['zeus', 'athena'],
        storiesRead: ['titanomachy'],
        pantheonsExplored: ['greek-pantheon'],
        locationsVisited: [],
        quizScores: { 'quiz-1': 80 },
        achievements: [],
        dailyStreak: 5,
        lastVisit: '2024-01-15', // Today - no streak change
        totalXP: 500,
        streakFreezes: 2,
      };
      localStorageData['mythos-atlas-progress'] = JSON.stringify(savedProgress);

      const { result } = renderHook(() => useProgress(), { wrapper });

      // Advance timers and wait for effects
      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.progress.deitiesViewed).toEqual(['zeus', 'athena']);
      expect(result.current.progress.dailyStreak).toBe(5);
      expect(result.current.progress.totalXP).toBe(500);
    });

    it('should merge saved progress with defaults for missing fields', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      // Old progress without streakFreezes field
      const oldProgress = {
        deitiesViewed: ['zeus'],
        storiesRead: [],
        pantheonsExplored: [],
        locationsVisited: [],
        quizScores: {},
        achievements: [],
        dailyStreak: 3,
        lastVisit: '2024-01-15', // Today
        totalXP: 100,
        // Missing: streakFreezes
      };
      localStorageData['mythos-atlas-progress'] = JSON.stringify(oldProgress);

      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.progress.deitiesViewed).toEqual(['zeus']);
      expect(result.current.progress.streakFreezes).toBe(2); // Default value
    });

    it('should use defaults when no saved progress exists', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.progress.deitiesViewed).toEqual([]);
      expect(result.current.progress.streakFreezes).toBe(2);
    });

    it('should handle corrupted localStorage data', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      localStorageData['mythos-atlas-progress'] = 'not valid json';

      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.progress.deitiesViewed).toEqual([]);
    });
  });

  describe('trackDeityView', () => {
    it('should add deity to deitiesViewed', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.trackDeityView('zeus');
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.progress.deitiesViewed).toContain('zeus');
    });

    it('should not add duplicate deities', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.trackDeityView('zeus');
      });

      act(() => {
        result.current.trackDeityView('zeus');
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.progress.deitiesViewed.filter(d => d === 'zeus').length).toBe(1);
    });
  });

  describe('trackStoryRead', () => {
    it('should add story to storiesRead', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.trackStoryRead('titanomachy');
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.progress.storiesRead).toContain('titanomachy');
    });

    it('should not add duplicate stories', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.trackStoryRead('titanomachy');
        result.current.trackStoryRead('titanomachy');
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.progress.storiesRead.filter(s => s === 'titanomachy').length).toBe(1);
    });
  });

  describe('updateStreak', () => {
    it('should increment streak when visited yesterday', async () => {
      vi.setSystemTime(new Date('2024-01-15'));

      const savedProgress: UserProgress = {
        deitiesViewed: [],
        storiesRead: [],
        pantheonsExplored: [],
        locationsVisited: [],
        quizScores: {},
        achievements: [],
        dailyStreak: 5,
        lastVisit: '2024-01-14', // Yesterday
        totalXP: 0,
        streakFreezes: 2,
      };
      localStorageData['mythos-atlas-progress'] = JSON.stringify(savedProgress);

      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      // updateStreak is called on mount, should increment
      expect(result.current.progress.dailyStreak).toBe(6);
      expect(result.current.progress.lastVisit).toBe('2024-01-15');
    });

    it('should reset streak when missed more than one day and no freeze available', async () => {
      vi.setSystemTime(new Date('2024-01-15'));

      const savedProgress: UserProgress = {
        deitiesViewed: [],
        storiesRead: [],
        pantheonsExplored: [],
        locationsVisited: [],
        quizScores: {},
        achievements: [],
        dailyStreak: 5,
        lastVisit: '2024-01-10', // 5 days ago
        totalXP: 0,
        streakFreezes: 0, // No freezes available
      };
      localStorageData['mythos-atlas-progress'] = JSON.stringify(savedProgress);

      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.progress.dailyStreak).toBe(1); // Reset to 1
      expect(result.current.progress.lastVisit).toBe('2024-01-15');
    });

    it('should use streak freeze when available and streak would break', async () => {
      vi.setSystemTime(new Date('2024-01-15'));

      const savedProgress: UserProgress = {
        deitiesViewed: [],
        storiesRead: [],
        pantheonsExplored: [],
        locationsVisited: [],
        quizScores: {},
        achievements: [],
        dailyStreak: 5,
        lastVisit: '2024-01-10', // 5 days ago
        totalXP: 0,
        streakFreezes: 2, // Has freezes
      };
      localStorageData['mythos-atlas-progress'] = JSON.stringify(savedProgress);

      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      // Should use a freeze and keep streak intact
      expect(result.current.progress.dailyStreak).toBe(5); // Preserved
      expect(result.current.progress.streakFreezes).toBe(1); // Used one
      expect(result.current.progress.lastVisit).toBe('2024-01-15');
    });

    it('should not change if already visited today', async () => {
      vi.setSystemTime(new Date('2024-01-15'));

      const savedProgress: UserProgress = {
        deitiesViewed: [],
        storiesRead: [],
        pantheonsExplored: [],
        locationsVisited: [],
        quizScores: {},
        achievements: [],
        dailyStreak: 5,
        lastVisit: '2024-01-15', // Today
        totalXP: 0,
        streakFreezes: 2,
      };
      localStorageData['mythos-atlas-progress'] = JSON.stringify(savedProgress);

      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.progress.dailyStreak).toBe(5);
      expect(result.current.progress.lastVisit).toBe('2024-01-15');
    });
  });

  describe('useStreakFreeze', () => {
    it('should decrement streak freezes when used', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const savedProgress: UserProgress = {
        deitiesViewed: [],
        storiesRead: [],
        pantheonsExplored: [],
        locationsVisited: [],
        quizScores: {},
        achievements: [],
        dailyStreak: 5,
        lastVisit: '2024-01-15',
        totalXP: 0,
        streakFreezes: 2,
      };
      localStorageData['mythos-atlas-progress'] = JSON.stringify(savedProgress);

      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.progress.streakFreezes).toBe(2);

      let freezeUsed: boolean = false;
      act(() => {
        freezeUsed = result.current.useStreakFreeze();
      });

      expect(freezeUsed).toBe(true);
      expect(result.current.progress.streakFreezes).toBe(1);
    });

    it('should return false when no freezes available', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const savedProgress: UserProgress = {
        deitiesViewed: [],
        storiesRead: [],
        pantheonsExplored: [],
        locationsVisited: [],
        quizScores: {},
        achievements: [],
        dailyStreak: 0, // No streak to protect
        lastVisit: '2024-01-15',
        totalXP: 0,
        streakFreezes: 0,
      };
      localStorageData['mythos-atlas-progress'] = JSON.stringify(savedProgress);

      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.progress.streakFreezes).toBe(0);

      let freezeUsed: boolean = true;
      act(() => {
        freezeUsed = result.current.useStreakFreeze();
      });

      expect(freezeUsed).toBe(false);
    });

    it('should return false when streak is 0', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const savedProgress: UserProgress = {
        deitiesViewed: [],
        storiesRead: [],
        pantheonsExplored: [],
        locationsVisited: [],
        quizScores: {},
        achievements: [],
        dailyStreak: 0,
        lastVisit: '2024-01-15',
        totalXP: 0,
        streakFreezes: 5,
      };
      localStorageData['mythos-atlas-progress'] = JSON.stringify(savedProgress);

      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      let freezeUsed: boolean = true;
      act(() => {
        freezeUsed = result.current.useStreakFreeze();
      });

      expect(freezeUsed).toBe(false);
    });
  });

  describe('addStreakFreeze', () => {
    it('should add streak freezes', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.progress.streakFreezes).toBe(2); // Default

      act(() => {
        result.current.addStreakFreeze(3);
      });

      expect(result.current.progress.streakFreezes).toBe(5);
    });
  });

  describe('recordQuizScore', () => {
    it('should save quiz score', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.recordQuizScore('quiz-1', 85);
      });

      expect(result.current.progress.quizScores['quiz-1']).toBe(85);
    });

    it('should keep higher score for same quiz', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.recordQuizScore('quiz-1', 90);
      });

      act(() => {
        result.current.recordQuizScore('quiz-1', 70);
      });

      expect(result.current.progress.quizScores['quiz-1']).toBe(90);
    });
  });

  describe('unlockAchievement', () => {
    it('should add achievement and XP', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.unlockAchievement('first-deity', 50);
      });

      expect(result.current.progress.achievements).toContain('first-deity');
      expect(result.current.progress.totalXP).toBe(50);
    });

    it('should not add duplicate achievement', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.unlockAchievement('first-deity', 50);
      });

      act(() => {
        result.current.unlockAchievement('first-deity', 50);
      });

      expect(result.current.progress.achievements.filter(a => a === 'first-deity').length).toBe(1);
      expect(result.current.progress.totalXP).toBe(50); // Not 100
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const savedProgress: UserProgress = {
        deitiesViewed: ['zeus', 'athena', 'poseidon'],
        storiesRead: ['titanomachy', 'odyssey'],
        pantheonsExplored: ['greek-pantheon'],
        locationsVisited: ['olympus'],
        quizScores: { 'quiz-1': 80, 'quiz-2': 90 },
        achievements: ['first-deity', 'story-reader'],
        dailyStreak: 5,
        lastVisit: '2024-01-15',
        totalXP: 500,
        streakFreezes: 2,
      };
      localStorageData['mythos-atlas-progress'] = JSON.stringify(savedProgress);

      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      const stats = result.current.getStats();
      expect(stats.totalDeitiesViewed).toBe(3);
      expect(stats.totalStoriesRead).toBe(2);
      expect(stats.totalPantheonsExplored).toBe(1);
      expect(stats.totalLocationsVisited).toBe(1);
      expect(stats.totalQuizzesTaken).toBe(2);
      expect(stats.averageQuizScore).toBe(85);
      expect(stats.totalAchievements).toBe(2);
      expect(stats.totalXP).toBe(500);
      expect(stats.dailyStreak).toBe(5);
    });

    it('should handle empty progress', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      const stats = result.current.getStats();
      expect(stats.totalDeitiesViewed).toBe(0);
      expect(stats.averageQuizScore).toBe(0);
    });
  });

  describe('localStorage persistence', () => {
    it('should save progress to localStorage on changes', async () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const { result } = renderHook(() => useProgress(), { wrapper });

      await act(async () => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.trackDeityView('zeus');
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const lastCall = localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1];
      const saved = JSON.parse(lastCall[1]);
      expect(saved.deitiesViewed).toContain('zeus');
    });
  });
});
