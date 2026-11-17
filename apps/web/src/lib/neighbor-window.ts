/**
 * Deterministic "neighbor window" for same-tradition link blocks.
 *
 * A fixed `slice(0, n)` sends every inbound link to the first few entries of a
 * tradition. Sorting by a stable key and taking the next `n` entries after the
 * current one (wrapping around) gives every entry about `n` inbound links.
 */

export function compareKeys(a: string, b: string): number {
  if (a < b) return -1;
  return a > b ? 1 : 0;
}

/**
 * Take `count` entries starting at `start` in `sorted`, wrapping around.
 * Never returns the same entry twice.
 */
export function windowAt<T>(
  sorted: readonly T[],
  start: number,
  count: number,
): T[] {
  const length = sorted.length;
  if (length === 0 || count <= 0) return [];
  const take = Math.min(count, length);
  const first = ((start % length) + length) % length;
  return Array.from({ length: take }, (_, i) => sorted[(first + i) % length]);
}

/**
 * The `count` entries that follow `currentKey` in key order, wrapping around.
 * `items` is the full list of the tradition and should include the current
 * entry; the current entry is never returned.
 */
export function neighborWindow<T>(
  items: readonly T[],
  currentKey: string,
  count: number,
  getKey: (item: T) => string,
): T[] {
  const sorted = [...items].sort((a, b) => compareKeys(getKey(a), getKey(b)));
  const index = sorted.findIndex((item) => getKey(item) === currentKey);
  if (index === -1) return windowAt(sorted, 0, count);
  const others = [...sorted.slice(index + 1), ...sorted.slice(0, index)];
  return others.slice(0, Math.max(0, count));
}
