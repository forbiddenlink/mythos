/**
 * FSRS (Free Spaced Repetition Scheduler) - Simplified Implementation
 *
 * This implements a spaced repetition algorithm based on the FSRS model,
 * which optimizes review timing based on difficulty ratings.
 */

export type DifficultyRating = 1 | 2 | 3 | 4;

export interface CardState {
  interval: number;      // days until next review
  nextReview: string;    // ISO date
  easeFactor: number;    // multiplier for good answers
  reviews: number;       // total review count
  lapses: number;        // number of "forgot" ratings
}

export interface ReviewCard {
  id: string;
  type: FlashcardType;
  question: string;
  answer: string;
  hint?: string;
  imageUrl?: string;
  metadata?: {
    deityId?: string;
    storyId?: string;
    pantheonId?: string;
    domains?: string[];
    symbols?: string[];
  };
}

export type FlashcardType =
  | 'deity-recognition'   // Show image, guess name
  | 'domain-match'        // Show domains, guess deity
  | 'symbol-match'        // Show symbols, guess deity
  | 'pantheon-match'      // Show deity name, guess pantheon
  | 'story-character';    // "Who appears in [story]?"

export interface ReviewState {
  cards: Record<string, CardState>;
  todayReviewed: string[];
  lastReviewDate: string;
  stats: ReviewStats;
}

export interface ReviewStats {
  totalReviewed: number;
  currentStreak: number;
  longestStreak: number;
  averageAccuracy: number;
  correctToday: number;
  incorrectToday: number;
}

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const EASY_BONUS = 1.3;
const HARD_MODIFIER = 1.2;
const GOOD_MODIFIER = 2.5;

/**
 * Calculate the next review interval based on the user's rating
 *
 * Ratings:
 * 1 = Forgot (reset to 1 day)
 * 2 = Hard (small increase)
 * 3 = Good (standard increase)
 * 4 = Easy (large increase with bonus)
 */
export function calculateNextReview(
  currentInterval: number,
  rating: DifficultyRating,
  easeFactor: number = DEFAULT_EASE_FACTOR
): { interval: number; easeFactor: number } {
  let newInterval: number;
  let newEaseFactor = easeFactor;

  switch (rating) {
    case 1: // Forgot - reset interval
      newInterval = 1;
      newEaseFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
      break;

    case 2: // Hard - small increase
      newInterval = Math.max(1, Math.round(currentInterval * HARD_MODIFIER));
      newEaseFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15);
      break;

    case 3: // Good - standard increase
      newInterval = Math.round(currentInterval * GOOD_MODIFIER * (easeFactor / DEFAULT_EASE_FACTOR));
      break;

    case 4: // Easy - large increase with bonus
      newInterval = Math.round(currentInterval * GOOD_MODIFIER * EASY_BONUS * (easeFactor / DEFAULT_EASE_FACTOR));
      newEaseFactor = Math.min(3.0, easeFactor + 0.1);
      break;

    default:
      newInterval = currentInterval;
  }

  // Ensure minimum interval of 1 day
  newInterval = Math.max(1, newInterval);

  return { interval: newInterval, easeFactor: newEaseFactor };
}

/**
 * Get the next review date based on interval in days
 */
export function getNextReviewDate(interval: number): string {
  const date = new Date();
  date.setDate(date.getDate() + interval);
  return date.toISOString().split('T')[0];
}

/**
 * Check if a card is due for review
 */
export function isCardDue(cardState: CardState): boolean {
  const today = new Date().toISOString().split('T')[0];
  return cardState.nextReview <= today;
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date as ISO string
 */
export function getYesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

/**
 * Create initial card state for a new card
 */
export function createInitialCardState(): CardState {
  return {
    interval: 1,
    nextReview: getToday(), // Due immediately
    easeFactor: DEFAULT_EASE_FACTOR,
    reviews: 0,
    lapses: 0,
  };
}

/**
 * Update card state after a review
 */
export function updateCardState(
  cardState: CardState,
  rating: DifficultyRating
): CardState {
  const { interval, easeFactor } = calculateNextReview(
    cardState.interval,
    rating,
    cardState.easeFactor
  );

  return {
    interval,
    nextReview: getNextReviewDate(interval),
    easeFactor,
    reviews: cardState.reviews + 1,
    lapses: rating === 1 ? cardState.lapses + 1 : cardState.lapses,
  };
}

/**
 * Rating labels for UI
 */
export const RATING_LABELS: Record<DifficultyRating, { label: string; color: string; description: string }> = {
  1: {
    label: 'Forgot',
    color: 'bg-red-600 hover:bg-red-700',
    description: 'Could not remember'
  },
  2: {
    label: 'Hard',
    color: 'bg-orange-600 hover:bg-orange-700',
    description: 'Remembered with difficulty'
  },
  3: {
    label: 'Good',
    color: 'bg-green-600 hover:bg-green-700',
    description: 'Remembered correctly'
  },
  4: {
    label: 'Easy',
    color: 'bg-blue-600 hover:bg-blue-700',
    description: 'Remembered easily'
  },
};

/**
 * Generate a unique card ID based on type and content
 */
export function generateCardId(type: FlashcardType, identifier: string): string {
  return `${type}:${identifier}`;
}

/**
 * Calculate accuracy percentage from stats
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
