/**
 * Daily Challenges System
 * Provides rotating daily challenges with streak tracking
 */

import dailyChallengesData from '@/data/daily-challenges.json';

export interface DailyChallengeAction {
  type: 'complete_quick_quiz' | 'read_story' | 'view_new_deity' | 'view_pantheon_deity' | 'quiz_high_score' | 'view_multiple_pantheons';
  pantheonId?: string;
  minScore?: number;
  count?: number;
}

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  icon: string;
  action: DailyChallengeAction;
}

const allChallenges = dailyChallengesData.challenges as DailyChallenge[];

/**
 * Get a deterministic seed for a given date
 */
function getDateSeed(date: Date): number {
  const dateStr = date.toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.codePointAt(i) ?? 0;
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Shuffle array with a seeded random
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let currentSeed = seed;

  for (let i = result.length - 1; i > 0; i--) {
    // Simple linear congruential generator
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
    const j = currentSeed % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Get today's date string (YYYY-MM-DD)
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get the 3 daily challenges for today
 */
export function getTodayChallenges(): DailyChallenge[] {
  const today = new Date();
  const seed = getDateSeed(today);
  const shuffled = seededShuffle(allChallenges, seed);

  // Return first 3 challenges
  return shuffled.slice(0, 3);
}

/**
 * Get challenges for a specific date (for testing)
 */
export function getChallengesForDate(date: Date): DailyChallenge[] {
  const seed = getDateSeed(date);
  const shuffled = seededShuffle(allChallenges, seed);
  return shuffled.slice(0, 3);
}

/**
 * Check if a challenge is completed based on current progress
 */
export function isChallengeCompleted(
  challenge: DailyChallenge,
  progress: {
    deitiesViewed: string[];
    storiesRead: string[];
    pantheonsExplored: string[];
    quizScores: Record<string, number>;
    quickQuizHighScore: number;
  },
  deityPantheonMap: Map<string, string>,
  todayProgress: {
    deitiesViewedToday: string[];
    storiesReadToday: string[];
    pantheonsViewedToday: string[];
    quizCompletedToday: boolean;
    quizScoreToday: number;
  }
): boolean {
  const { action } = challenge;

  switch (action.type) {
    case 'complete_quick_quiz':
      return todayProgress.quizCompletedToday;

    case 'read_story':
      return todayProgress.storiesReadToday.length > 0;

    case 'view_new_deity':
      // Check if any deity viewed today was new (not in previous progress)
      const previouslyViewed = new Set(
        progress.deitiesViewed.filter(
          (d) => !todayProgress.deitiesViewedToday.includes(d)
        )
      );
      return todayProgress.deitiesViewedToday.some(
        (d) => !previouslyViewed.has(d)
      );

    case 'view_pantheon_deity':
      if (!action.pantheonId) return false;
      return todayProgress.deitiesViewedToday.some(
        (deityId) => deityPantheonMap.get(deityId) === action.pantheonId
      );

    case 'quiz_high_score':
      return todayProgress.quizScoreToday >= (action.minScore || 80);

    case 'view_multiple_pantheons':
      return todayProgress.pantheonsViewedToday.length >= (action.count || 3);

    default:
      return false;
  }
}

/**
 * Calculate daily challenge streak
 */
export function calculateStreak(
  claimedDates: string[],
  today: string
): number {
  if (claimedDates.length === 0) return 0;

  const sortedDates = claimedDates.toSorted().toReversed();
  let streak = 0;
  const currentDate = new Date(today);

  for (const dateStr of sortedDates) {
    const checkDate = currentDate.toISOString().split('T')[0];

    if (dateStr === checkDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (dateStr < checkDate) {
      // Missed a day, streak broken
      break;
    }
  }

  return streak;
}

/**
 * Get icon component name for a challenge
 */
export function getChallengeIcon(iconName: string): string {
  const iconMap: Record<string, string> = {
    'zap': 'Zap',
    'book-open': 'BookOpen',
    'sparkles': 'Sparkles',
    'globe': 'Globe',
    'award': 'Award',
    'compass': 'Compass',
  };
  return iconMap[iconName] || 'Star';
}
