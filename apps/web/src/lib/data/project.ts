/**
 * Pure projection helpers for handing catalog records to client components.
 *
 * Server components read the full JSON catalog (see `./catalog`), then pass
 * only the fields a client component renders. Keeping the projection explicit
 * at the call site is what stops an 800 KB file from being serialized into the
 * RSC payload or bundled into a client chunk.
 */

/** Copy the listed keys of one record, dropping keys whose value is `undefined`. */
export function pick<T extends object, K extends keyof T>(
  row: T,
  keys: readonly K[],
): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined) out[key] = value;
  }
  return out;
}

/** `pick` over a list, preserving order. */
export function project<T extends object, K extends keyof T>(
  rows: readonly T[],
  keys: readonly K[],
): Pick<T, K>[] {
  return rows.map((row) => pick(row, keys));
}

/** Index records by a string key; later duplicates do not overwrite earlier ones. */
export function indexBy<T, K extends string>(
  rows: readonly T[],
  key: (row: T) => K,
): Map<K, T> {
  const map = new Map<K, T>();
  for (const row of rows) {
    const k = key(row);
    if (!map.has(k)) map.set(k, row);
  }
  return map;
}
