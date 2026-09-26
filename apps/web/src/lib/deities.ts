import "server-only";

/**
 * Catalog-backed deity reference lookups (server only). Client components use
 * `@/lib/deity-reference` with a slim list passed as props instead.
 */
import deitiesData from "@/data/deities.json";
import {
  createDeityLookup,
  formatDeityReference,
  normalizeDeityReference,
  type DeityLookupEntry,
} from "@/lib/deity-reference";

export { formatDeityReference, normalizeDeityReference };

const lookup = createDeityLookup(deitiesData as DeityLookupEntry[]);

export function findDeityByReference(
  reference: string,
): DeityLookupEntry | undefined {
  return lookup.find(reference);
}

/** A cross-pantheon parallel that only matches the source entry's own alias is not another page. */
export function distinctDeityReference(
  sourceId: string,
  reference: string,
): DeityLookupEntry | undefined {
  return lookup.distinct(sourceId, reference);
}

export function getDeitySlug(reference: string): string {
  return lookup.slug(reference);
}

export function getDeityName(reference: string): string {
  return lookup.name(reference);
}

export function getDeityPath(reference: string): string {
  return lookup.path(reference);
}
