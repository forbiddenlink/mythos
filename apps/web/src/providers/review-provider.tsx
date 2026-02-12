'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  type CardState,
  type ReviewCard,
  type ReviewState,
  type ReviewStats,
  type DifficultyRating,
  type FlashcardType,
  createInitialCardState,
  updateCardState,
  isCardDue,
  getToday,
  getYesterday,
  generateCardId,
  calculateAccuracy,
} from '@/lib/spaced-repetition';
import { ProgressContext } from '@/providers/progress-provider';

export interface ReviewContextValue {
  reviewState: ReviewState;
  dueCards: ReviewCard[];
  dueCount: number;
  generateCardsFromProgress: () => void;
  reviewCard: (cardId: string, rating: DifficultyRating) => void;
  getCardState: (cardId: string) => CardState | undefined;
  getTodayStats: () => { reviewed: number; correct: number; accuracy: number };
  resetTodayProgress: () => void;
}

const REVIEW_STORAGE_KEY = 'mythos-atlas-review';

const DEFAULT_REVIEW_STATE: ReviewState = {
  cards: {},
  todayReviewed: [],
  lastReviewDate: '',
  stats: {
    totalReviewed: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageAccuracy: 0,
    correctToday: 0,
    incorrectToday: 0,
  },
};

export const ReviewContext = createContext<ReviewContextValue | null>(null);

function loadReviewState(): ReviewState {
  if (typeof window === 'undefined') return DEFAULT_REVIEW_STATE;
  try {
    const stored = localStorage.getItem(REVIEW_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_REVIEW_STATE, ...parsed };
    }
    return DEFAULT_REVIEW_STATE;
  } catch {
    return DEFAULT_REVIEW_STATE;
  }
}

function saveReviewState(state: ReviewState) {
  try {
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage might be full or unavailable
  }
}

// Deity and story data for card generation
const PANTHEON_NAMES: Record<string, string> = {
  greek: 'Greek',
  norse: 'Norse',
  egyptian: 'Egyptian',
  celtic: 'Celtic',
  japanese: 'Japanese',
  hindu: 'Hindu',
  mesopotamian: 'Mesopotamian',
  chinese: 'Chinese',
};

// Sample deity data for card generation (will be expanded from progress)
const DEITY_DATA: Record<string, { name: string; domains: string[]; symbols: string[]; pantheonId: string; imageUrl?: string }> = {
  zeus: { name: 'Zeus', domains: ['Sky', 'Thunder', 'Lightning'], symbols: ['Thunderbolt', 'Eagle', 'Oak'], pantheonId: 'greek' },
  poseidon: { name: 'Poseidon', domains: ['Sea', 'Earthquakes', 'Horses'], symbols: ['Trident', 'Horse', 'Dolphin'], pantheonId: 'greek' },
  hades: { name: 'Hades', domains: ['Underworld', 'Death', 'Wealth'], symbols: ['Helm of Darkness', 'Cerberus'], pantheonId: 'greek' },
  athena: { name: 'Athena', domains: ['Wisdom', 'War', 'Crafts'], symbols: ['Owl', 'Olive Tree', 'Aegis'], pantheonId: 'greek' },
  apollo: { name: 'Apollo', domains: ['Sun', 'Music', 'Prophecy'], symbols: ['Lyre', 'Laurel Wreath', 'Sun Chariot'], pantheonId: 'greek' },
  artemis: { name: 'Artemis', domains: ['Hunt', 'Moon', 'Wilderness'], symbols: ['Bow and Arrow', 'Deer', 'Crescent Moon'], pantheonId: 'greek' },
  odin: { name: 'Odin', domains: ['Wisdom', 'War', 'Death'], symbols: ['Spear Gungnir', 'Ravens', 'Eye Patch'], pantheonId: 'norse' },
  thor: { name: 'Thor', domains: ['Thunder', 'Lightning', 'Storms'], symbols: ['Mjolnir', 'Goats', 'Belt of Strength'], pantheonId: 'norse' },
  freya: { name: 'Freya', domains: ['Love', 'Beauty', 'Fertility'], symbols: ['Cats', 'Falcon Cloak', 'Brisingamen'], pantheonId: 'norse' },
  loki: { name: 'Loki', domains: ['Mischief', 'Trickery', 'Fire'], symbols: ['Flames', 'Serpent', 'Net'], pantheonId: 'norse' },
  ra: { name: 'Ra', domains: ['Sun', 'Creation', 'Order'], symbols: ['Sun Disk', 'Falcon', 'Ankh'], pantheonId: 'egyptian' },
  osiris: { name: 'Osiris', domains: ['Afterlife', 'Agriculture', 'Resurrection'], symbols: ['Crook', 'Flail', 'Green Skin'], pantheonId: 'egyptian' },
  isis: { name: 'Isis', domains: ['Magic', 'Wisdom', 'Motherhood'], symbols: ['Throne', 'Wings', 'Ankh'], pantheonId: 'egyptian' },
  anubis: { name: 'Anubis', domains: ['Mummification', 'Afterlife', 'Protection'], symbols: ['Jackal', 'Scales', 'Black Color'], pantheonId: 'egyptian' },
};

const STORY_DATA: Record<string, { title: string; characters: string[] }> = {
  'trojan-war': { title: 'The Trojan War', characters: ['Zeus', 'Athena', 'Apollo', 'Aphrodite', 'Hera'] },
  'odyssey': { title: 'The Odyssey', characters: ['Poseidon', 'Athena', 'Zeus', 'Hermes'] },
  'ragnarok': { title: 'Ragnarok', characters: ['Odin', 'Thor', 'Loki', 'Freya', 'Heimdall'] },
  'osiris-myth': { title: 'The Myth of Osiris', characters: ['Osiris', 'Isis', 'Set', 'Horus', 'Anubis'] },
};

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviewState, setReviewState] = useState<ReviewState>(DEFAULT_REVIEW_STATE);
  const [dueCards, setDueCards] = useState<ReviewCard[]>([]);
  const [mounted, setMounted] = useState(false);

  const progressContext = useContext(ProgressContext);

  // Load review state from localStorage on mount
  useEffect(() => {
    const loaded = loadReviewState();

    // Check if it's a new day and reset today's progress
    const today = getToday();
    if (loaded.lastReviewDate !== today) {
      loaded.todayReviewed = [];
      loaded.stats.correctToday = 0;
      loaded.stats.incorrectToday = 0;

      // Update streak
      const yesterday = getYesterday();
      if (loaded.lastReviewDate === yesterday) {
        loaded.stats.currentStreak += 1;
        if (loaded.stats.currentStreak > loaded.stats.longestStreak) {
          loaded.stats.longestStreak = loaded.stats.currentStreak;
        }
      } else if (loaded.lastReviewDate !== today) {
        // Streak broken (not yesterday and not today)
        if (loaded.lastReviewDate) {
          loaded.stats.currentStreak = 0;
        }
      }
    }

    setReviewState(loaded);
    setMounted(true);
  }, []);

  // Save review state when it changes
  useEffect(() => {
    if (mounted) {
      saveReviewState(reviewState);
    }
  }, [reviewState, mounted]);

  // Generate cards from user's viewed content
  const generateCardsFromProgress = useCallback(() => {
    const viewedDeities = progressContext?.progress.deitiesViewed || [];
    const readStories = progressContext?.progress.storiesRead || [];
    const generatedCards: ReviewCard[] = [];

    // Generate deity-based cards
    viewedDeities.forEach((deityId) => {
      const deity = DEITY_DATA[deityId.toLowerCase()];
      if (!deity) return;

      // Domain match card
      if (deity.domains.length > 0) {
        const domainCardId = generateCardId('domain-match', deityId);
        generatedCards.push({
          id: domainCardId,
          type: 'domain-match',
          question: `Which deity is the god/goddess of ${deity.domains.slice(0, 2).join(' and ')}?`,
          answer: deity.name,
          hint: `Hint: This deity belongs to the ${PANTHEON_NAMES[deity.pantheonId] || deity.pantheonId} pantheon`,
          metadata: { deityId, domains: deity.domains, pantheonId: deity.pantheonId },
        });
      }

      // Symbol match card
      if (deity.symbols.length > 0) {
        const symbolCardId = generateCardId('symbol-match', deityId);
        generatedCards.push({
          id: symbolCardId,
          type: 'symbol-match',
          question: `Which deity is symbolized by the ${deity.symbols[0]}?`,
          answer: deity.name,
          hint: `Hint: Other symbols include ${deity.symbols.slice(1).join(', ')}`,
          metadata: { deityId, symbols: deity.symbols, pantheonId: deity.pantheonId },
        });
      }

      // Pantheon match card
      const pantheonCardId = generateCardId('pantheon-match', deityId);
      generatedCards.push({
        id: pantheonCardId,
        type: 'pantheon-match',
        question: `Which pantheon does ${deity.name} belong to?`,
        answer: PANTHEON_NAMES[deity.pantheonId] || deity.pantheonId,
        metadata: { deityId, pantheonId: deity.pantheonId },
      });
    });

    // Generate story-based cards
    readStories.forEach((storyId) => {
      const story = STORY_DATA[storyId.toLowerCase()];
      if (!story) return;

      story.characters.forEach((character) => {
        const storyCardId = generateCardId('story-character', `${storyId}-${character}`);
        generatedCards.push({
          id: storyCardId,
          type: 'story-character',
          question: `Does ${character} appear in "${story.title}"?`,
          answer: 'Yes',
          metadata: { storyId },
        });
      });
    });

    // Initialize card states for new cards
    setReviewState((prev) => {
      const newCards = { ...prev.cards };
      generatedCards.forEach((card) => {
        if (!newCards[card.id]) {
          newCards[card.id] = createInitialCardState();
        }
      });
      return { ...prev, cards: newCards };
    });

    // Filter to only due cards
    const due = generatedCards.filter((card) => {
      const state = reviewState.cards[card.id];
      return !state || isCardDue(state);
    });

    // Also exclude already reviewed today
    const notReviewedToday = due.filter(
      (card) => !reviewState.todayReviewed.includes(card.id)
    );

    setDueCards(notReviewedToday);
  }, [progressContext?.progress.deitiesViewed, progressContext?.progress.storiesRead, reviewState.cards, reviewState.todayReviewed]);

  // Review a card with a rating
  const reviewCard = useCallback((cardId: string, rating: DifficultyRating) => {
    setReviewState((prev) => {
      const currentCardState = prev.cards[cardId] || createInitialCardState();
      const updatedCardState = updateCardState(currentCardState, rating);

      const isCorrect = rating >= 3;
      const totalReviewed = prev.stats.totalReviewed + 1;
      const correctToday = prev.stats.correctToday + (isCorrect ? 1 : 0);
      const incorrectToday = prev.stats.incorrectToday + (isCorrect ? 0 : 1);

      // Calculate running average accuracy
      const totalCorrect = Math.round((prev.stats.averageAccuracy / 100) * prev.stats.totalReviewed) + (isCorrect ? 1 : 0);
      const averageAccuracy = calculateAccuracy(totalCorrect, totalReviewed);

      return {
        ...prev,
        cards: {
          ...prev.cards,
          [cardId]: updatedCardState,
        },
        todayReviewed: [...prev.todayReviewed, cardId],
        lastReviewDate: getToday(),
        stats: {
          ...prev.stats,
          totalReviewed,
          correctToday,
          incorrectToday,
          averageAccuracy,
        },
      };
    });

    // Remove from due cards
    setDueCards((prev) => prev.filter((card) => card.id !== cardId));
  }, []);

  const getCardState = useCallback(
    (cardId: string) => reviewState.cards[cardId],
    [reviewState.cards]
  );

  const getTodayStats = useCallback(() => {
    const reviewed = reviewState.todayReviewed.length;
    const correct = reviewState.stats.correctToday;
    const accuracy = calculateAccuracy(correct, reviewed);
    return { reviewed, correct, accuracy };
  }, [reviewState.todayReviewed.length, reviewState.stats.correctToday]);

  const resetTodayProgress = useCallback(() => {
    setReviewState((prev) => ({
      ...prev,
      todayReviewed: [],
      stats: {
        ...prev.stats,
        correctToday: 0,
        incorrectToday: 0,
      },
    }));
  }, []);

  return (
    <ReviewContext.Provider
      value={{
        reviewState,
        dueCards,
        dueCount: dueCards.length,
        generateCardsFromProgress,
        reviewCard,
        getCardState,
        getTodayStats,
        resetTodayProgress,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

// Default values for when hook is used outside provider (e.g., during static generation)
const DEFAULT_REVIEW_CONTEXT: ReviewContextValue = {
  reviewState: DEFAULT_REVIEW_STATE,
  dueCards: [],
  dueCount: 0,
  generateCardsFromProgress: () => {},
  reviewCard: () => {},
  getCardState: () => undefined,
  getTodayStats: () => ({ reviewed: 0, correct: 0, accuracy: 0 }),
  resetTodayProgress: () => {},
};

export function useReview(): ReviewContextValue {
  const context = useContext(ReviewContext);
  // Return safe defaults during SSR/static generation when provider isn't available
  if (!context) {
    return DEFAULT_REVIEW_CONTEXT;
  }
  return context;
}
