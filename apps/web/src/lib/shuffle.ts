/**
 * Unbiased Fisher-Yates shuffle. Returns a new array and leaves the input
 * untouched. `random` defaults to Math.random; tests can pass a fixed source.
 * For a deterministic, date-seeded order use `seededShuffle` in `@/lib/seeded`.
 */
export function shuffle<T>(
  array: readonly T[],
  random: () => number = Math.random,
): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
