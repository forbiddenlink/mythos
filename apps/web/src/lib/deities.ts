import "server-only";

/**
 * Catalog-backed deity reference lookups (server only). Client components use
 * `@/lib/deity-reference` with a slim list passed as props instead.
 */
import deitiesData from "@/data/deities.json";
import {
  createDeityLookup,
  normalizeDeityReference,
  type DeityLookupEntry,
} from "@/lib/deity-reference";

export { normalizeDeityReference };

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
