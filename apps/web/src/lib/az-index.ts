export interface AzEntry {
  name: string;
}

export interface AzGroup<T extends AzEntry> {
  letter: string;
  entries: T[];
}

/** Sort key and heading letter: diacritics and case ignored ("Ōkuninushi" files under O). */
function plain(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .toLowerCase();
}

/** Entries grouped under A to Z headings; names with no leading letter go under "#". */
export function groupAlphabetically<T extends AzEntry>(
  items: readonly T[],
): AzGroup<T>[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const first = plain(item.name).charAt(0).toUpperCase();
    const letter = /^[A-Z]$/.test(first) ? first : "#";
    const bucket = groups.get(letter);
    if (bucket) bucket.push(item);
    else groups.set(letter, [item]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)))
    .map(([letter, entries]) => ({
      letter,
      entries: entries.sort((a, b) =>
        plain(a.name).localeCompare(plain(b.name)),
      ),
    }));
}
