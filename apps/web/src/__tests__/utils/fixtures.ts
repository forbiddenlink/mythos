import type { CardState, ReviewCard, FlashcardType } from '@/lib/spaced-repetition';
import type { UserProgress } from '@/providers/progress-provider';
import type { Deity, Story } from '@/types/Entity';
import type { Relationship, RelationshipQuestion, Difficulty } from '@/lib/relationship-quiz';

/**
 * Create a mock deity with sensible defaults
 */
export function createMockDeity(overrides: Partial<Deity> = {}): Deity {
  const id = overrides.id || `deity-${Math.random().toString(36).slice(2)}`;
  return {
    id,
    slug: id,
    name: overrides.name || 'Test Deity',
    pantheonId: 'greek-pantheon',
    alternateNames: [],
    gender: 'male',
    domain: ['sky', 'thunder'],
    symbols: ['lightning bolt', 'eagle'],
    description: 'A test deity for testing purposes',
    importanceRank: 1,
    imageUrl: '/images/test-deity.jpg',
    ...overrides,
  };
}

/**
 * Create a mock story with sensible defaults
 */
export function createMockStory(overrides: Partial<Story> = {}): Story {
  const id = overrides.id || `story-${Math.random().toString(36).slice(2)}`;
  return {
    id,
    slug: id,
    title: overrides.title || 'Test Story',
    name: overrides.title || 'Test Story',
    pantheonId: 'greek-pantheon',
    summary: 'A test story summary',
    fullNarrative: 'The full narrative of the test story.',
    keyExcerpts: 'Key excerpts from the story.',
    category: 'creation',
    moralThemes: ['courage', 'wisdom'],
    culturalSignificance: 'This story has cultural significance.',
    ...overrides,
  };
}

/**
 * Create a mock relationship
 */
export function createMockRelationship(overrides: Partial<Relationship> = {}): Relationship {
  return {
    id: overrides.id || `rel-${Math.random().toString(36).slice(2)}`,
    fromDeityId: 'zeus',
    toDeityId: 'athena',
    relationshipType: 'parent_of',
    confidenceLevel: 'high',
    ...overrides,
  };
}

/**
 * Create a mock user progress object
 */
export function createMockProgress(overrides: Partial<UserProgress> = {}): UserProgress {
  return {
    deitiesViewed: [],
    storiesRead: [],
    pantheonsExplored: [],
    locationsVisited: [],
    quizScores: {},
    achievements: [],
    dailyStreak: 0,
    lastVisit: '',
    totalXP: 0,
    streakFreezes: 2,
    ...overrides,
  };
}

/**
 * Create a mock card state for spaced repetition
 */
export function createMockCardState(overrides: Partial<CardState> = {}): CardState {
  const today = new Date().toISOString().split('T')[0];
  return {
    interval: 1,
    nextReview: today,
    easeFactor: 2.5,
    reviews: 0,
    lapses: 0,
    ...overrides,
  };
}

/**
 * Create a mock review card
 */
export function createMockReviewCard(overrides: Partial<ReviewCard> = {}): ReviewCard {
  return {
    id: overrides.id || `card-${Math.random().toString(36).slice(2)}`,
    type: 'deity-recognition' as FlashcardType,
    question: 'Who is this deity?',
    answer: 'Zeus',
    hint: 'King of the gods',
    imageUrl: '/images/zeus.jpg',
    metadata: {
      deityId: 'zeus',
      pantheonId: 'greek-pantheon',
    },
    ...overrides,
  };
}

/**
 * Create a mock relationship quiz question
 */
export function createMockQuizQuestion(overrides: Partial<RelationshipQuestion> = {}): RelationshipQuestion {
  return {
    id: overrides.id || `question-${Math.random().toString(36).slice(2)}`,
    deityId: 'zeus',
    deityName: 'Zeus',
    deityImageUrl: '/images/zeus.jpg',
    questionType: 'parent',
    questionText: 'Who is a parent of Athena?',
    correctAnswer: 'Zeus',
    correctDeityId: 'zeus',
    options: ['Zeus', 'Poseidon', 'Hades', 'Apollo'],
    difficulty: 'medium' as Difficulty,
    ...overrides,
  };
}

/**
 * Create a list of mock deities for a pantheon
 */
export function createMockPantheon(pantheonId: string, count: number = 5): Deity[] {
  const names = ['Zeus', 'Athena', 'Poseidon', 'Hades', 'Apollo', 'Artemis', 'Ares', 'Hephaestus'];
  return Array.from({ length: count }, (_, i) =>
    createMockDeity({
      id: `${pantheonId}-deity-${i}`,
      name: names[i] || `Deity ${i}`,
      pantheonId,
    })
  );
}

/**
 * Create multiple mock stories for a pantheon
 */
export function createMockStories(pantheonId: string, count: number = 3): Story[] {
  return Array.from({ length: count }, (_, i) =>
    createMockStory({
      id: `${pantheonId}-story-${i}`,
      title: `Story ${i}`,
      pantheonId,
    })
  );
}
