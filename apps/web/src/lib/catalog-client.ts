/**
 * Browser-side access to the slim catalog indexes served by `/api/catalog/*`.
 *
 * Features that need broad catalog data only after a user acts (export a
 * deck, generate review cards, pick a random deity) load it here on demand
 * instead of bundling the JSON. Each index is fetched at most once per page
 * load; a failed fetch is forgotten so the next attempt retries.
 */
import type { DeityIndexEntry, StoryIndexEntry } from "@/lib/data/types";
import type { SearchIndex } from "@/lib/search-engine";

const cache = new Map<string, Promise<unknown>>();

function load<T>(path: string): Promise<T> {
  let pending = cache.get(path) as Promise<T> | undefined;
  if (!pending) {
    pending = fetch(path, { credentials: "same-origin" }).then((res) => {
      if (!res.ok) throw new Error(`${path} responded ${res.status}`);
      return res.json() as Promise<T>;
    });
    pending.catch(() => cache.delete(path));
    cache.set(path, pending);
  }
  return pending;
}

export function loadDeityIndex(): Promise<DeityIndexEntry[]> {
  return load<DeityIndexEntry[]>("/api/catalog/deities");
}

export function loadStoryIndex(): Promise<StoryIndexEntry[]> {
  return load<StoryIndexEntry[]>("/api/catalog/stories");
}

export function loadSearchIndex(): Promise<SearchIndex> {
  return load<SearchIndex>("/api/catalog/search-index");
}

/** Test hook: forget cached responses. */
export function resetCatalogClientCache(): void {
  cache.clear();
}
