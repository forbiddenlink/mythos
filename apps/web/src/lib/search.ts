/**
 * Smart Search Library for Mythos Atlas
 * Provides unified search across all content types with scoring.
 *
 * Server-side entry: builds the search index from the JSON catalog. Client
 * components use `@/lib/search-engine` with the index fetched from
 * `/api/catalog/search-index`.
 */
import "server-only";

import deities from "@/data/deities.json";
import stories from "@/data/stories.json";
import creatures from "@/data/creatures.json";
import artifacts from "@/data/artifacts.json";
import locations from "@/data/locations.json";
import heroes from "@/data/heroes.json";
import sources from "@/data/sources.json";
import { searchIndex, toSearchIndex, type SearchIndex } from "./search-engine";
import type { SearchResult } from "./search-result";

export type { ContentType, SearchResult } from "./search-result";
export { getResultUrl } from "./search-result";
export {
  clearRecentSearches,
  getPopularSearches,
  getRecentSearches,
  saveRecentSearch,
  type SearchIndex,
} from "./search-engine";

let index: SearchIndex | null = null;

/** The search index over the whole catalog (built once per server process). */
export function getSearchIndex(): SearchIndex {
  index ??= toSearchIndex({
    deities,
    stories,
    creatures,
    artifacts,
    locations,
    heroes,
    sources,
  });
  return index;
}

/**
 * Search across all content types
 */
export function searchAll(query: string, limit: number = 10): SearchResult[] {
  return searchIndex(getSearchIndex(), query, limit);
}
