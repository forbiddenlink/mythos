/**
 * Pure helpers for deity references (ids, slugs, alternate names). No catalog
 * data is imported here, so client components can use them freely. Lookups run
 * against an explicit list (`createDeityLookup`), which on the server is the
 * catalog and on the client a slim projection passed down as props.
 */

export interface DeityLookupEntry {
  id: string;
  name: string;
  slug: string;
  alternateNames?: string[];
}

export function normalizeDeityReference(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDeityReference(reference: string): string {
  return reference
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Build reference lookups over a list of deities. Keys are the normalized id,
 * slug and alternate names; as in the original catalog index, a later entry
 * overwrites an earlier one on a key collision.
 */
export function createDeityLookup<T extends DeityLookupEntry>(
  entries: readonly T[],
) {
  const map = new Map<string, T>();
  for (const entry of entries) {
    map.set(normalizeDeityReference(entry.id), entry);
    map.set(normalizeDeityReference(entry.slug), entry);
    for (const alternateName of entry.alternateNames ?? []) {
      map.set(normalizeDeityReference(alternateName), entry);
    }
  }

  const find = (reference: string): T | undefined =>
    map.get(normalizeDeityReference(reference));

  return {
    find,
    /** A parallel that only matches the source entry's own alias is not another page. */
    distinct(sourceId: string, reference: string): T | undefined {
      const found = find(reference);
      if (!found || found.id === sourceId) return undefined;
      return found;
    },
    slug(reference: string): string {
      return find(reference)?.slug ?? normalizeDeityReference(reference);
    },
    name(reference: string): string {
      return find(reference)?.name ?? formatDeityReference(reference);
    },
    path(reference: string): string {
      return `/deities/${find(reference)?.slug ?? normalizeDeityReference(reference)}`;
    },
  };
}

export type DeityLookup<T extends DeityLookupEntry = DeityLookupEntry> =
  ReturnType<typeof createDeityLookup<T>>;
