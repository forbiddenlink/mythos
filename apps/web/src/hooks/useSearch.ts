"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useCallback } from "react";
import type { SearchResponse } from "@/lib/hygraph/types";

interface UseSearchOptions {
  enabled?: boolean;
  debounceMs?: number;
  limit?: number;
  staleTime?: number;
}

interface SearchResultItem {
  id: string;
  type: "deity" | "creature" | "artifact" | "pantheon" | "story";
  title: string;
  subtitle?: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  href: string;
}

/**
 * Hook to search across all content types
 *
 * @example
 * const { results, isSearching, search, clear } = useSearch();
 *
 * // Trigger search
 * search("zeus");
 */
export function useSearch(options: UseSearchOptions = {}) {
  const {
    enabled = true,
    limit = 10,
    staleTime = 1000 * 60, // 1 minute
  } = options;

  const [searchQuery, setSearchQuery] = useState("");

  const query = useQuery({
    queryKey: ["search", searchQuery, limit],
    queryFn: async (): Promise<SearchResponse> => {
      if (!searchQuery.trim()) {
        return {
          deities: [],
          creatures: [],
          artifacts: [],
          pantheons: [],
          stories: [],
        };
      }

      const params = new URLSearchParams({
        q: searchQuery,
        limit: String(limit),
      });

      const response = await fetch(`/api/hygraph/search?${params}`);
      if (!response.ok) {
        throw new Error("Search failed");
      }
      return response.json();
    },
    enabled: enabled && searchQuery.length > 0,
    staleTime,
  });

  // Normalize results into a flat list with type information
  const results = useMemo((): SearchResultItem[] => {
    if (!query.data) return [];

    const items: SearchResultItem[] = [];

    // Add deities
    for (const deity of query.data.deities) {
      items.push({
        id: deity.id,
        type: "deity",
        title: deity.name,
        subtitle: deity.domain?.join(", "),
        slug: deity.slug,
        description: deity.description,
        imageUrl: deity.imageUrl,
        href: `/deities/${deity.slug}`,
      });
    }

    // Add creatures
    for (const creature of query.data.creatures) {
      items.push({
        id: creature.id,
        type: "creature",
        title: creature.name,
        subtitle: creature.habitat,
        slug: creature.slug,
        description: creature.description,
        imageUrl: creature.imageUrl,
        href: `/creatures/${creature.slug}`,
      });
    }

    // Add artifacts
    for (const artifact of query.data.artifacts) {
      items.push({
        id: artifact.id,
        type: "artifact",
        title: artifact.name,
        subtitle: artifact.type,
        slug: artifact.slug,
        description: artifact.description,
        imageUrl: artifact.imageUrl,
        href: `/artifacts/${artifact.slug}`,
      });
    }

    // Add pantheons
    for (const pantheon of query.data.pantheons) {
      items.push({
        id: pantheon.id,
        type: "pantheon",
        title: pantheon.name,
        subtitle: pantheon.culture,
        slug: pantheon.slug,
        description: pantheon.description,
        href: `/pantheons/${pantheon.slug}`,
      });
    }

    // Add stories
    for (const story of query.data.stories) {
      items.push({
        id: story.id,
        type: "story",
        title: story.title,
        slug: story.slug,
        description: story.summary,
        href: `/stories/${story.slug}`,
      });
    }

    return items;
  }, [query.data]);

  // Group results by type
  const resultsByType = useMemo(() => {
    return {
      deities: results.filter((r) => r.type === "deity"),
      creatures: results.filter((r) => r.type === "creature"),
      artifacts: results.filter((r) => r.type === "artifact"),
      pantheons: results.filter((r) => r.type === "pantheon"),
      stories: results.filter((r) => r.type === "story"),
    };
  }, [results]);

  const search = useCallback((newQuery: string) => {
    setSearchQuery(newQuery);
  }, []);

  const clear = useCallback(() => {
    setSearchQuery("");
  }, []);

  return {
    query: searchQuery,
    results,
    resultsByType,
    rawResults: query.data,
    isSearching: query.isLoading || query.isFetching,
    error: query.error,
    search,
    clear,
    hasResults: results.length > 0,
    totalResults: results.length,
  };
}

/**
 * Hook to search with debouncing built-in
 */
export function useDebouncedSearch(options: UseSearchOptions = {}) {
  const { debounceMs = 300, ...searchOptions } = options;
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");

  // Debounce the search value
  const handleSearch = useCallback(
    (value: string) => {
      setInputValue(value);

      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, debounceMs);

      return () => clearTimeout(handler);
    },
    [debounceMs],
  );

  const searchResult = useSearch({
    ...searchOptions,
    enabled: searchOptions.enabled !== false && debouncedValue.length > 0,
  });

  // Override search to use debounced version
  const search = useCallback(
    (query: string) => {
      handleSearch(query);
      searchResult.search(query);
    },
    [handleSearch, searchResult],
  );

  const clear = useCallback(() => {
    setInputValue("");
    setDebouncedValue("");
    searchResult.clear();
  }, [searchResult]);

  return {
    ...searchResult,
    inputValue,
    search,
    clear,
    isDebouncing: inputValue !== debouncedValue,
  };
}

/**
 * Hook to prefetch search results
 */
export function usePrefetchSearch() {
  const queryClient = useQueryClient();

  return (query: string, limit = 10) => {
    if (!query.trim()) return;

    queryClient.prefetchQuery({
      queryKey: ["search", query, limit],
      queryFn: async () => {
        const params = new URLSearchParams({
          q: query,
          limit: String(limit),
        });

        const response = await fetch(`/api/hygraph/search?${params}`);
        if (!response.ok) throw new Error("Search failed");
        return response.json();
      },
      staleTime: 1000 * 60,
    });
  };
}

// Export types
export type { SearchResultItem, SearchResponse };
