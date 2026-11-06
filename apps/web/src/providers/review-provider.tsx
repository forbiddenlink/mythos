"use client";

import { saveLearningValue } from "@/lib/learning-persistence";

import { loadDeityIndex, loadStoryIndex } from "@/lib/catalog-client";
import { reviewSchema } from "@/lib/learning-backup";
import { LEARNING_KEYS } from "@/lib/learning-keys";

import {
  calculateAccuracy,
  createInitialCardState,
  deityCardIds,
  deityIdsWithCards,
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
  generateCardsFromProgress: () => Promise<void>;
  reviewCard: (cardId: string, rating: DifficultyRating) => void;
  /** Add a deity's cards to the deck, due today, without marking it viewed. */
  queueDeityForReview: (deity: QueuedDeity) => void;
  getCardState: (cardId: string) => CardState | undefined;
  getTodayStats: () => { reviewed: number; correct: number; accuracy: number };
  resetTodayProgress: () => void;
}

export interface QueuedDeity {
  id: string;
  domain?: string[];
  symbols?: string[];
}

const REVIEW_STORAGE_KEY = LEARNING_KEYS.review;

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
      // Keep valid fields from older saves; malformed fields use defaults.
      const fields = Object.entries(reviewSchema.shape).map(([key, schema]) => {
        const result = schema.safeParse(parsed?.[key]);
        return [
          key,
          result.success
            ? result.data
            : DEFAULT_REVIEW_STATE[key as keyof typeof DEFAULT_REVIEW_STATE],
        ];
      });
      return { ...DEFAULT_REVIEW_STATE, ...Object.fromEntries(fields) };
    }
    return DEFAULT_REVIEW_STATE;
  } catch {
    return DEFAULT_REVIEW_STATE;
  }
}

/** Load the saved state, resetting today's counters if the day has rolled over. */
function loadReviewStateForToday(): ReviewState {
  const loaded = loadReviewState();
  const today = getToday();
  if (loaded.lastReviewDate === today) return loaded;

  const staleStreak =
    loaded.lastReviewDate !== "" && loaded.lastReviewDate !== getYesterday();
  return {
    ...loaded,
    todayReviewed: [],
    stats: {
      ...loaded.stats,
      correctToday: 0,
      incorrectToday: 0,
      ...(staleStreak ? { currentStreak: 0 } : {}),
    },
  };
}

function saveReviewState(state: ReviewState) {
  saveLearningValue(REVIEW_STORAGE_KEY, JSON.stringify(state));
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
  "slavic-pantheon": "Slavic",
  "haudenosaunee-pantheon": "Haudenosaunee",
  "tlingit-haida-pantheon": "Tlingit & Haida",
  "hittite-pantheon": "Hittite",
  "canaanite-pantheon": "Canaanite",
  "inuit-pantheon": "Inuit",
  "aboriginal-australian-pantheon": "Aboriginal Australian",
  "dine-pantheon": "Diné",
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

interface ReviewCardSources {
  deityIndex: Map<string, ReviewDeityData>;
  storyIndex: Map<string, ReviewStoryData>;
}

let cardSourcesPromise: Promise<ReviewCardSources> | null = null;

function loadCardSources(): Promise<ReviewCardSources> {
  // Slim catalog indexes, fetched only when the user builds a review deck.
  cardSourcesPromise ??= Promise.all([loadDeityIndex(), loadStoryIndex()])
    .then(([deities, stories]: [ReviewDeityData[], ReviewStoryData[]]) => {
      return {
        deityIndex: new Map(
          deities.map((deity) => [deity.id.toLowerCase(), deity]),
        ),
        storyIndex: new Map(
          stories.map((story) => [story.id.toLowerCase(), story]),
        ),
      };
    })
    .catch((error: unknown) => {
      cardSourcesPromise = null;
      throw error;
    });

  return cardSourcesPromise;
}

export function ReviewProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [reviewState, setReviewState] =
    useState<ReviewState>(DEFAULT_REVIEW_STATE);
  const [dueCards, setDueCards] = useState<ReviewCard[]>([]);
  const [mounted, setMounted] = useState(false);

  const progressContext = useContext(ProgressContext);
  const updateVisitStreak = progressContext?.updateStreak;

  // Hydration-safe: load from localStorage on client mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate review state from localStorage (SSR-safe)
    setReviewState(loadReviewStateForToday());
    setMounted(true);
  }, []);

  // Save review state when it changes
  useEffect(() => {
    if (mounted) {
      saveReviewState(reviewState);
    }
  }, [reviewState, mounted]);

  // Cross-tab sync: re-read from localStorage when another tab updates it
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === REVIEW_STORAGE_KEY) {
        setReviewState(loadReviewStateForToday());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Generate cards from user's viewed content
  const generateCardsFromProgress = useCallback(async () => {
    const { deityIndex, storyIndex } = await loadCardSources();
    // Viewed deities plus any deity queued from a quiz miss (it has cards
    // in the deck but was never opened).
    const viewedDeities = [
      ...new Set([
        ...(progressContext?.progress.deitiesViewed || []),
        ...deityIdsWithCards(Object.keys(reviewState.cards)),
      ]),
    ];
    const readStories = progressContext?.progress.storiesRead || [];
    const generatedCards: ReviewCard[] = [];

    // Generate deity-based cards
    viewedDeities.forEach((deityId) => {
      const deity = deityIndex.get(deityId.toLowerCase());
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
      const story = storyIndex.get(storyId.toLowerCase());
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
      let hasNewCards = false;
      generatedCards.forEach((card) => {
        if (!newCards[card.id]) {
          newCards[card.id] = createInitialCardState();
          hasNewCards = true;
        }
      });

      return hasNewCards ? { ...prev, cards: newCards } : prev;
    });

    // Filter to only due cards
    const due = generatedCards.filter((card) => {
      const state = reviewState.cards[card.id];
      return !state || isCardDue(state);
    });

    // Also exclude already reviewed today
    const notReviewedToday = due.filter(
      (card) =>
        reviewState.lastReviewDate !== getToday() ||
        !reviewState.todayReviewed.includes(card.id),
    );

    setDueCards(notReviewedToday);
  }, [
    progressContext?.progress.deitiesViewed,
    progressContext?.progress.storiesRead,
    reviewState.cards,
    reviewState.todayReviewed,
    reviewState.lastReviewDate,
  ]);

  // Review a card with a rating
  const reviewCard = useCallback(
    (cardId: string, rating: DifficultyRating) => {
      updateVisitStreak?.();
      setReviewState((prev) => {
        const today = getToday();
        const currentCardState = prev.cards[cardId] || createInitialCardState();
        const updatedCardState = updateCardState(currentCardState, rating);

        const isNewReviewDay = prev.lastReviewDate !== today;
        const isCorrect = rating >= 3;
        const totalReviewed = prev.stats.totalReviewed + 1;
        const correctToday =
          (isNewReviewDay ? 0 : prev.stats.correctToday) + (isCorrect ? 1 : 0);
        const incorrectToday =
          (isNewReviewDay ? 0 : prev.stats.incorrectToday) +
          (isCorrect ? 0 : 1);

        // Calculate running average accuracy
        const totalCorrect =
          Math.round(
            (prev.stats.averageAccuracy / 100) * prev.stats.totalReviewed,
          ) + (isCorrect ? 1 : 0);
        const averageAccuracy = calculateAccuracy(totalCorrect, totalReviewed);
        const currentStreak = isNewReviewDay
          ? prev.lastReviewDate === getYesterday()
            ? prev.stats.currentStreak + 1
            : 1
          : prev.stats.currentStreak;

        return {
          ...prev,
          cards: {
            ...prev.cards,
            [cardId]: updatedCardState,
          },
          todayReviewed: [
            ...(isNewReviewDay ? [] : prev.todayReviewed),
            cardId,
          ],
          lastReviewDate: today,
          stats: {
            ...prev.stats,
            totalReviewed,
            correctToday,
            incorrectToday,
            averageAccuracy,
            currentStreak,
            longestStreak: Math.max(prev.stats.longestStreak, currentStreak),
          },
        };
      });

      // Remove from due cards
      setDueCards((prev) => prev.filter((card) => card.id !== cardId));
    },
    [updateVisitStreak],
  );

  const queueDeityForReview = useCallback((deity: QueuedDeity) => {
    setReviewState((prev) => {
      const missing = deityCardIds(deity).filter((id) => !prev.cards[id]);
      if (missing.length === 0) return prev;
      const cards = { ...prev.cards };
      for (const id of missing) cards[id] = createInitialCardState();
      return { ...prev, cards };
    });
  }, []);

  const getCardState = useCallback(
    (cardId: string) => reviewState.cards[cardId],
    [reviewState.cards],
  );

  const getTodayStats = useCallback(() => {
    if (reviewState.lastReviewDate !== getToday()) {
      return { reviewed: 0, correct: 0, accuracy: 0 };
    }
    const reviewed = reviewState.todayReviewed.length;
    const correct = reviewState.stats.correctToday;
    const accuracy = calculateAccuracy(correct, reviewed);
    return { reviewed, correct, accuracy };
  }, [
    reviewState.todayReviewed.length,
    reviewState.stats.correctToday,
    reviewState.lastReviewDate,
  ]);

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
      dueCount: Object.entries(reviewState.cards).filter(
        ([cardId, cardState]) =>
          isCardDue(cardState) &&
          (reviewState.lastReviewDate !== getToday() ||
            !reviewState.todayReviewed.includes(cardId)),
      ).length,
      generateCardsFromProgress,
      reviewCard,
      queueDeityForReview,
      getCardState,
      getTodayStats,
      resetTodayProgress,
    }),
    [
      reviewState,
      dueCards,
      generateCardsFromProgress,
      reviewCard,
      queueDeityForReview,
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
  generateCardsFromProgress: async () => {},
  reviewCard: () => {},
  queueDeityForReview: () => {},
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
