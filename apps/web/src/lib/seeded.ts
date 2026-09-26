/**
 * Deterministic, date-seeded selection shared by the daily challenges and
 * "Today's myth". Pure and data-free, so client code can import it.
 */
import { toLocalDateString } from "@/lib/date";

/** A stable non-negative seed for the reader's local calendar day. */
export function getDateSeed(date: Date): number {
  const dateStr = toLocalDateString(date);
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.codePointAt(i) ?? 0;
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/** Fisher-Yates shuffle driven by a linear congruential generator. */
export function seededShuffle<T>(array: readonly T[], seed: number): T[] {
  const result = [...array];
  let currentSeed = seed;

  for (let i = result.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
    const j = currentSeed % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
