"use client";

import deitiesData from "@/data/deities.json";
import storiesData from "@/data/stories.json";
import {
  calculateAccuracy,
  createInitialCardState,
  generateCardId,
  getToday,
  getYesterday,
  isCardDue,
  updateCardState,
  type CardState,
  type DifficultyRating,
  type ReviewCard,
  type ReviewState,
} from "@/lib/spaced-repetition";
import { ProgressContext } from "@/providers/progress-provider";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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

const REVIEW_STORAGE_KEY = "mythos-atlas-review";

interface ReviewDeityData {
  id: string;
  name: string;
  domain?: string[];
  symbols?: string[];
  pantheonId: string;
}

interface ReviewStoryData {
  id: string;
  title: string;
  pantheonId: string;
  category?: string;
}

const DEFAULT_REVIEW_STATE: ReviewState = {
  cards: {},
  todayReviewed: [],
  lastReviewDate: "",
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
  if (globalThis.window === undefined) return DEFAULT_REVIEW_STATE;
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

// Pantheon labels for card prompts
const PANTHEON_NAMES: Record<string, string> = {
  "greek-pantheon": "Greek",
  "norse-pantheon": "Norse",
  "egyptian-pantheon": "Egyptian",
  "roman-pantheon": "Roman",
  "hindu-pantheon": "Hindu",
  "japanese-pantheon": "Japanese",
  "celtic-pantheon": "Celtic",
  "mesopotamian-pantheon": "Mesopotamian",
  "chinese-pantheon": "Chinese",
  "mesoamerican-pantheon": "Mesoamerican",
  "yoruba-pantheon": "Yoruba",
  "polynesian-pantheon": "Polynesian",
  "mayan-pantheon": "Mayan",
  "akan-pantheon": "Akan",
};

function formatPantheonLabel(pantheonId: string): string {
  const mapped = PANTHEON_NAMES[pantheonId];
  if (mapped) return mapped;

  return pantheonId
    .replace("-pantheon", "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const ALL_DEITIES = deitiesData as ReviewDeityData[];
const ALL_STORIES = storiesData as ReviewStoryData[];

const DEITY_INDEX = new Map<string, ReviewDeityData>(
  ALL_DEITIES.map((deity) => [deity.id.toLowerCase(), deity]),
);

const STORY_INDEX = new Map<string, ReviewStoryData>(
  ALL_STORIES.map((story) => [story.id.toLowerCase(), story]),
);

export function ReviewProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [reviewState, setReviewState] =
    useState<ReviewState>(DEFAULT_REVIEW_STATE);
  const [dueCards, setDueCards] = useState<ReviewCard[]>([]);
  const [mounted, setMounted] = useState(false);

  const progressContext = useContext(ProgressContext);

  // Hydration-safe: load from localStorage on client mount
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

    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate review state from localStorage (SSR-safe)
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
      const deity = DEITY_INDEX.get(deityId.toLowerCase());
      if (!deity) return;

      const domains = deity.domain ?? [];
      const symbols = deity.symbols ?? [];

      // Domain match card
      if (domains.length > 0) {
        const domainCardId = generateCardId("domain-match", deityId);
        generatedCards.push({
          id: domainCardId,
          type: "domain-match",
          question: `Which deity is associated with ${domains.slice(0, 2).join(" and ")}?`,
          answer: deity.name,
          hint: `Hint: This deity belongs to the ${formatPantheonLabel(deity.pantheonId)} pantheon`,
          metadata: { deityId, domains, pantheonId: deity.pantheonId },
        });
      }

      // Symbol match card
      if (symbols.length > 0) {
        const symbolCardId = generateCardId("symbol-match", deityId);
        generatedCards.push({
          id: symbolCardId,
          type: "symbol-match",
          question: `Which deity is symbolized by ${symbols[0]}?`,
          answer: deity.name,
          hint:
            symbols.length > 1
              ? `Hint: Other symbols include ${symbols.slice(1).join(", ")}`
              : undefined,
          metadata: { deityId, symbols, pantheonId: deity.pantheonId },
        });
      }

      // Pantheon match card
      const pantheonCardId = generateCardId("pantheon-match", deityId);
      generatedCards.push({
        id: pantheonCardId,
        type: "pantheon-match",
        question: `Which pantheon does ${deity.name} belong to?`,
        answer: formatPantheonLabel(deity.pantheonId),
        metadata: { deityId, pantheonId: deity.pantheonId },
      });
    });

    // Generate story-based cards
    readStories.forEach((storyId) => {
      const story = STORY_INDEX.get(storyId.toLowerCase());
      if (!story) return;

      const storyCardId = generateCardId("story-character", storyId);
      generatedCards.push({
        id: storyCardId,
        type: "story-character",
        question: `Which pantheon does the story "${story.title}" belong to?`,
        answer: formatPantheonLabel(story.pantheonId),
        hint: story.category ? `Hint: Category - ${story.category}` : undefined,
        metadata: { storyId, pantheonId: story.pantheonId },
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
      (card) => !reviewState.todayReviewed.includes(card.id),
    );

    setDueCards(notReviewedToday);
  }, [
    progressContext?.progress.deitiesViewed,
    progressContext?.progress.storiesRead,
    reviewState.cards,
    reviewState.todayReviewed,
  ]);

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
      const totalCorrect =
        Math.round(
          (prev.stats.averageAccuracy / 100) * prev.stats.totalReviewed,
        ) + (isCorrect ? 1 : 0);
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
    [reviewState.cards],
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

  const contextValue = useMemo(
    () => ({
      reviewState,
      dueCards,
      dueCount: dueCards.length,
      generateCardsFromProgress,
      reviewCard,
      getCardState,
      getTodayStats,
      resetTodayProgress,
    }),
    [
      reviewState,
      dueCards,
      generateCardsFromProgress,
      reviewCard,
      getCardState,
      getTodayStats,
      resetTodayProgress,
    ],
  );

  return (
    <ReviewContext.Provider value={contextValue}>
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
