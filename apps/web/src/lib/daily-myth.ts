/**
 * "Today's myth": one catalog story a day with three questions about it.
 *
 * The homepage is prerendered, so the day is chosen in the browser from the
 * reader's local date. The question pool is built at build time
 * (`buildDailyMythPool` in `@/lib/data/daily-myths`) and served as static JSON
 * from `/api/daily-myth`; this module is data-free and safe for client code.
 */
import { toLocalDateString } from "@/lib/date";
import { seededShuffle } from "@/lib/seeded";

export const DAILY_MYTH_CHALLENGE_ID = "todays_myth";
export const DAILY_MYTH_QUESTIONS = 3;
/** XP for finishing today's myth, plus a bonus per correct answer. */
export const DAILY_MYTH_BASE_XP = 10;
export const DAILY_MYTH_XP_PER_CORRECT = 5;

export interface DailyMythQuestion {
  prompt: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  /** Shown after answering; one sentence. */
  explanation: string;
}

export interface DailyMyth {
  id: string;
  slug: string;
  title: string;
  tradition: string;
  summary: string;
  imageUrl?: string;
  questions: DailyMythQuestion[];
}

export interface DailyMythPool {
  version: 1;
  myths: DailyMyth[];
}

/** Fixed seed for the rotation order; changing it reshuffles every day. */
const ROTATION_SEED = 20260926;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Days since 1970-01-01 for the reader's local calendar date. */
export function localDayNumber(date: Date): number {
  const [y, m, d] = toLocalDateString(date).split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / MS_PER_DAY);
}

/**
 * The myth for `date`. Walks a fixed shuffled order one step per day, so
 * every myth comes up once before any repeats and consecutive days differ.
 */
export function pickDailyMyth<T>(myths: readonly T[], date: Date): T | null {
  if (myths.length === 0) return null;
  const order = seededShuffle(
    myths.map((_, i) => i),
    ROTATION_SEED,
  );
  const day = localDayNumber(date);
  const index = order[((day % order.length) + order.length) % order.length];
  return myths[index];
}

export function dailyMythXp(correct: number): number {
  return DAILY_MYTH_BASE_XP + DAILY_MYTH_XP_PER_CORRECT * correct;
}
