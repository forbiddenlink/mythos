import "@/lib/zod-jitless";
import { z } from "zod";
import { BOOKMARK_TYPES, LEARNING_KEYS } from "@/lib/learning-keys";

export const LEARNING_BACKUP_VERSION = 1;
export const LEARNING_BACKUP_MAX_BYTES = 1024 * 1024;

export const LEARNING_STORAGE_KEYS = [
  LEARNING_KEYS.bookmarks,
  LEARNING_KEYS.readingProgress,
  LEARNING_KEYS.progress,
  LEARNING_KEYS.review,
  LEARNING_KEYS.storyProgress,
  LEARNING_KEYS.storyEndings,
] as const;

/**
 * Keys added after the first v1 backups were written. A backup without them
 * still restores, and leaves the reader's current values for them untouched.
 */
const LATER_STORAGE_KEYS = new Set<LearningStorageKey>([
  LEARNING_KEYS.storyProgress,
  LEARNING_KEYS.storyEndings,
]);

export type LearningStorageKey = (typeof LEARNING_STORAGE_KEYS)[number];

type LearningStorageValues = Record<LearningStorageKey, string | null>;

function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

const dateOnlySchema = z.string().refine(isValidCalendarDate, {
  message: "Expected a valid YYYY-MM-DD date",
});
const emptyOrDateOnlySchema = z.union([z.literal(""), dateOnlySchema]);

const bookmarkSchema = z.strictObject({
  type: z.enum(BOOKMARK_TYPES),
  id: z.string().min(1).max(200),
  timestamp: z.number().int().nonnegative(),
});

const readingProgressSchema = z.record(
  z.string().min(1).max(200),
  z.strictObject({
    storyId: z.string().min(1).max(200),
    percentage: z.number().finite().min(0).max(100),
    updatedAt: z.number().int().nonnegative(),
  }),
);

export const progressSchema = z.strictObject({
  deitiesViewed: z.array(z.string().min(1).max(200)),
  storiesRead: z.array(z.string().min(1).max(200)),
  pantheonsExplored: z.array(z.string().min(1).max(200)),
  locationsVisited: z.array(z.string().min(1).max(200)),
  quizScores: z.record(z.string().min(1).max(200), z.number().finite()),
  achievements: z.array(z.string().min(1).max(200)),
  dailyStreak: z.number().int().nonnegative(),
  // Added after v1 backups were first written; optional so older ones restore.
  longestStreak: z.number().int().nonnegative().optional(),
  // Marks quizScores as migrated to percentages; absent on older records.
  quizScoresVersion: z.number().int().nonnegative().optional(),
  lastVisit: emptyOrDateOnlySchema,
  totalXP: z.number().finite().nonnegative(),
  streakFreezes: z.number().int().nonnegative(),
  quickQuizHighScore: z.number().finite().nonnegative(),
  dailyChallengeStreak: z.number().int().nonnegative(),
  lastDailyChallengeDate: emptyOrDateOnlySchema,
  claimedDailyChallenges: z.array(z.string().min(1).max(250)),
  todayActivity: z.strictObject({
    date: emptyOrDateOnlySchema,
    deitiesViewed: z.array(z.string().min(1).max(200)),
    storiesRead: z.array(z.string().min(1).max(200)),
    pantheonsViewed: z.array(z.string().min(1).max(200)),
    quizCompleted: z.boolean(),
    quizScore: z.number().finite(),
  }),
});

const cardStateSchema = z.strictObject({
  interval: z.number().int().positive(),
  nextReview: dateOnlySchema,
  easeFactor: z.number().finite().positive(),
  reviews: z.number().int().nonnegative(),
  lapses: z.number().int().nonnegative(),
});

export const reviewSchema = z.strictObject({
  cards: z.record(z.string().min(1).max(300), cardStateSchema),
  todayReviewed: z.array(z.string().min(1).max(300)),
  lastReviewDate: emptyOrDateOnlySchema,
  stats: z.strictObject({
    totalReviewed: z.number().int().nonnegative(),
    currentStreak: z.number().int().nonnegative(),
    longestStreak: z.number().int().nonnegative(),
    averageAccuracy: z.number().finite().min(0).max(100),
    correctToday: z.number().int().nonnegative(),
    incorrectToday: z.number().int().nonnegative(),
  }),
});

const idSchema = z.string().min(1).max(200);

/** Interactive-story positions, keyed by story id (src/lib/branching-story.ts). */
const storyProgressSchema = z.record(
  idSchema,
  z.strictObject({
    storyId: idSchema,
    currentNodeId: idSchema,
    pathTaken: z.array(idSchema),
    endingsDiscovered: z.array(idSchema),
    lastPlayed: z.string().max(64),
  }),
);

/** Endings found per interactive story. */
const storyEndingsSchema = z.record(idSchema, z.array(idSchema));

const storedValueSchemas: Record<LearningStorageKey, z.ZodType> = {
  [LEARNING_KEYS.bookmarks]: z.array(bookmarkSchema),
  [LEARNING_KEYS.readingProgress]: readingProgressSchema,
  [LEARNING_KEYS.progress]: progressSchema,
  [LEARNING_KEYS.review]: reviewSchema,
  [LEARNING_KEYS.storyProgress]: storyProgressSchema,
  [LEARNING_KEYS.storyEndings]: storyEndingsSchema,
};

const backupSchema = z.strictObject({
  format: z.literal("mythos-atlas-learning-backup"),
  version: z.literal(LEARNING_BACKUP_VERSION),
  exportedAt: z.string().datetime({ offset: true }),
  data: z.strictObject({
    [LEARNING_KEYS.bookmarks]: z.string().nullable(),
    [LEARNING_KEYS.readingProgress]: z.string().nullable(),
    [LEARNING_KEYS.progress]: z.string().nullable(),
    [LEARNING_KEYS.review]: z.string().nullable(),
    [LEARNING_KEYS.storyProgress]: z.string().nullable().optional(),
    [LEARNING_KEYS.storyEndings]: z.string().nullable().optional(),
  }),
});

export interface LearningBackup {
  format: "mythos-atlas-learning-backup";
  version: typeof LEARNING_BACKUP_VERSION;
  exportedAt: string;
  /** Keys in LATER_STORAGE_KEYS may be absent from older backups. */
  data: Partial<LearningStorageValues>;
}

export interface BackupPreview {
  exportedAt: string;
  savedCategories: number;
  bookmarks: number;
  readingProgress: number;
  viewedDeities: number;
  storiesRead: number;
  reviewCards: number;
}

export type BackupParseResult =
  | { success: true; backup: LearningBackup; preview: BackupPreview }
  | { success: false; error: string };

function validateStoredValue(
  key: LearningStorageKey,
  value: string | null | undefined,
) {
  if (value === null || value === undefined) return { success: true as const };

  try {
    return storedValueSchemas[key].safeParse(JSON.parse(value));
  } catch {
    return { success: false as const };
  }
}

function checkedBackup(candidate: unknown): BackupParseResult {
  const parsed = backupSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      success: false,
      error: "This is not a valid Mythos Atlas learning backup.",
    };
  }

  for (const key of LEARNING_STORAGE_KEYS) {
    if (!validateStoredValue(key, parsed.data.data[key]).success) {
      return {
        success: false,
        error:
          "This backup contains invalid learning data and was not imported.",
      };
    }
  }

  const data = parsed.data.data;
  const bookmarksRaw = data[LEARNING_KEYS.bookmarks];
  const readingRaw = data[LEARNING_KEYS.readingProgress];
  const progressRaw = data[LEARNING_KEYS.progress];
  const reviewRaw = data[LEARNING_KEYS.review];
  const bookmarks = bookmarksRaw
    ? (JSON.parse(bookmarksRaw) as unknown[]).length
    : 0;
  const readingProgress = readingRaw
    ? Object.keys(JSON.parse(readingRaw) as object).length
    : 0;
  const progress = progressRaw
    ? (JSON.parse(progressRaw) as {
        deitiesViewed: unknown[];
        storiesRead: unknown[];
      })
    : null;
  const reviewCards = reviewRaw
    ? Object.keys((JSON.parse(reviewRaw) as { cards: object }).cards).length
    : 0;

  return {
    success: true,
    backup: parsed.data,
    preview: {
      exportedAt: parsed.data.exportedAt,
      savedCategories: LEARNING_STORAGE_KEYS.filter((key) => data[key] != null)
        .length,
      bookmarks,
      readingProgress,
      viewedDeities: progress?.deitiesViewed.length ?? 0,
      storiesRead: progress?.storiesRead.length ?? 0,
      reviewCards,
    },
  };
}

export function createLearningBackup(
  storage: Pick<Storage, "getItem">,
): LearningBackup {
  return {
    format: "mythos-atlas-learning-backup",
    version: LEARNING_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: Object.fromEntries(
      LEARNING_STORAGE_KEYS.map((key) => [key, storage.getItem(key)]),
    ) as LearningStorageValues,
  };
}

export function serializeLearningBackup(
  storage: Pick<Storage, "getItem">,
): string {
  const raw = JSON.stringify(createLearningBackup(storage), null, 2);
  const result = parseLearningBackup(raw);
  if (!result.success) {
    throw new Error(
      "The current learning record cannot be exported as a restorable backup. No stored data was changed.",
    );
  }
  return raw;
}

export function parseLearningBackup(raw: string): BackupParseResult {
  if (new TextEncoder().encode(raw).byteLength > LEARNING_BACKUP_MAX_BYTES) {
    return { success: false, error: "This backup is too large to import." };
  }

  try {
    return checkedBackup(JSON.parse(raw));
  } catch {
    return { success: false, error: "This file is not valid JSON." };
  }
}

/** Replace only the documented learning keys and attempt rollback on failure. */
export function restoreLearningBackup(
  storage: Storage,
  backup: LearningBackup,
): { success: true } | { success: false; error: string } {
  const validated = checkedBackup(backup);
  if (!validated.success) {
    return { success: false, error: validated.error };
  }

  let current: LearningStorageValues;
  try {
    current = Object.fromEntries(
      LEARNING_STORAGE_KEYS.map((key) => [key, storage.getItem(key)]),
    ) as LearningStorageValues;
  } catch {
    return {
      success: false,
      error: "Storage could not be read. No learning data was changed.",
    };
  }

  try {
    for (const key of LEARNING_STORAGE_KEYS) {
      const value = validated.backup.data[key];
      if (value === undefined && LATER_STORAGE_KEYS.has(key)) continue;
      if (value == null) storage.removeItem(key);
      else storage.setItem(key, value);
    }
    return { success: true };
  } catch {
    try {
      for (const key of LEARNING_STORAGE_KEYS) {
        const value = current[key];
        if (value === null) storage.removeItem(key);
        else storage.setItem(key, value);
      }
      return {
        success: false,
        error:
          "Storage could not be updated. Your existing learning data was restored.",
      };
    } catch {
      return {
        success: false,
        error:
          "Storage could not be updated and the previous learning data could not be fully restored.",
      };
    }
  }
}
