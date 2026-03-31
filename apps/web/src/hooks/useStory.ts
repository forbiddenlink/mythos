"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { HygraphStory } from "@/lib/hygraph/types";

interface UseStoryOptions {
  enabled?: boolean;
  staleTime?: number;
  initialData?: HygraphStory;
}

/**
 * Hook to fetch a single story by slug
 *
 * @example
 * const { story, isLoading, error } = useStory("prometheus-fire");
 */
export function useStory(slug: string, options: UseStoryOptions = {}) {
  const { enabled = true, staleTime = 1000 * 60 * 5, initialData } = options;

  const query = useQuery({
    queryKey: ["story", slug],
    queryFn: async (): Promise<HygraphStory | null> => {
      const response = await fetch(`/api/hygraph/story/${slug}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch story");
      }
      return response.json();
    },
    enabled: enabled && Boolean(slug),
    staleTime,
    initialData,
  });

  return {
    story: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to prefetch a story for faster navigation
 */
export function usePrefetchStory() {
  const queryClient = useQueryClient();

  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: ["story", slug],
      queryFn: async () => {
        const response = await fetch(`/api/hygraph/story/${slug}`);
        if (!response.ok) return null;
        return response.json();
      },
      staleTime: 1000 * 60 * 5,
    });
  };
}

/**
 * Hook to invalidate story cache
 */
export function useInvalidateStory() {
  const queryClient = useQueryClient();

  return (slug?: string) => {
    if (slug) {
      queryClient.invalidateQueries({ queryKey: ["story", slug] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["story"] });
    }
  };
}
