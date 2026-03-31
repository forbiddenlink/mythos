"use client";

import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { HygraphStory } from "@/lib/hygraph/types";

interface StoriesFilters {
  pantheonSlug?: string;
  category?: string;
  limit?: number;
}

interface StoriesResult {
  stories: HygraphStory[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

interface UseStoriesOptions {
  enabled?: boolean;
  staleTime?: number;
  initialData?: StoriesResult;
}

/**
 * Hook to fetch a paginated list of stories
 *
 * @example
 * const { stories, total, isLoading } = useStories({ pantheonSlug: "greek" });
 */
export function useStories(
  filters: StoriesFilters = {},
  options: UseStoriesOptions = {},
) {
  const { enabled = true, staleTime = 1000 * 60 * 5, initialData } = options;
  const { pantheonSlug, category, limit = 20 } = filters;

  const query = useQuery({
    queryKey: ["stories", { pantheonSlug, category, limit }],
    queryFn: async (): Promise<StoriesResult> => {
      const params = new URLSearchParams();
      if (pantheonSlug) params.set("pantheonSlug", pantheonSlug);
      if (category) params.set("category", category);
      params.set("limit", String(limit));

      const response = await fetch(`/api/hygraph/stories?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch stories");
      }
      return response.json();
    },
    enabled,
    staleTime,
    initialData,
  });

  return {
    stories: query.data?.stories ?? [],
    total: query.data?.total ?? 0,
    hasMore: query.data?.hasMore ?? false,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for infinite scrolling stories list
 *
 * @example
 * const { stories, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteStories();
 */
export function useInfiniteStories(
  filters: Omit<StoriesFilters, "limit"> = {},
) {
  const { pantheonSlug, category } = filters;
  const pageSize = 20;

  const query = useInfiniteQuery({
    queryKey: ["stories-infinite", { pantheonSlug, category }],
    queryFn: async ({ pageParam = 0 }): Promise<StoriesResult> => {
      const params = new URLSearchParams();
      if (pantheonSlug) params.set("pantheonSlug", pantheonSlug);
      if (category) params.set("category", category);
      params.set("limit", String(pageSize));
      params.set("offset", String(pageParam));

      const response = await fetch(`/api/hygraph/stories?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch stories");
      }
      const data = await response.json();
      return {
        ...data,
        nextOffset: data.hasMore ? pageParam + pageSize : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
  });

  const stories = query.data?.pages.flatMap((page) => page.stories) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  return {
    stories,
    total,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch stories by pantheon
 */
export function useStoriesByPantheon(
  pantheonSlug: string,
  options: Omit<UseStoriesOptions, "initialData"> = {},
) {
  return useStories({ pantheonSlug }, options);
}

/**
 * Hook to fetch stories by category
 */
export function useStoriesByCategory(
  category: string,
  options: Omit<UseStoriesOptions, "initialData"> = {},
) {
  return useStories({ category }, options);
}

/**
 * Hook to invalidate stories cache
 */
export function useInvalidateStories() {
  const queryClient = useQueryClient();

  return (filters?: StoriesFilters) => {
    if (filters) {
      queryClient.invalidateQueries({
        queryKey: ["stories", filters],
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["stories-infinite"] });
    }
  };
}
