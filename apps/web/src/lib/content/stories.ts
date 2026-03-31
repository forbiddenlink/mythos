/**
 * Story content fetchers
 * Provides typed functions for fetching story/myth content from Hygraph
 */

import storiesJson from "@/data/stories.json";
import { hygraphRequest, isHygraphConfigured } from "../hygraph/client";
import {
  HYGRAPH_GET_STORIES,
  HYGRAPH_GET_STORY_BY_SLUG,
} from "../hygraph/queries";
import type {
  GetStoriesResponse,
  GetStoryBySlugResponse,
  HygraphStory,
} from "../hygraph/types";

export interface StoryFilters {
  pantheonSlug?: string;
  category?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export interface StoriesResult {
  stories: HygraphStory[];
  total: number;
  hasMore: boolean;
}

/**
 * Fetch paginated list of stories with optional filters
 */
export async function fetchStories(
  filters: StoryFilters = {},
  options?: { draft?: boolean; previewToken?: string },
): Promise<StoriesResult> {
  const { pantheonSlug, category, limit = 20, offset = 0 } = filters;

  if (isHygraphConfigured()) {
    const where: Record<string, unknown> = {};
    if (pantheonSlug) {
      where.pantheon = { slug: pantheonSlug };
    }
    if (category) {
      where.category = category;
    }

    const response = await hygraphRequest<GetStoriesResponse>(
      HYGRAPH_GET_STORIES,
      {
        first: limit,
        skip: offset,
        where: Object.keys(where).length > 0 ? where : undefined,
      },
      { draft: options?.draft, previewToken: options?.previewToken },
    );

    if (response) {
      return {
        stories: response.stories,
        total: response.storiesConnection.aggregate.count,
        hasMore:
          offset + response.stories.length <
          response.storiesConnection.aggregate.count,
      };
    }
  }

  // Fallback to local JSON
  // Local JSON uses pantheonId string, Hygraph uses pantheon object
  type LocalStory = HygraphStory & { pantheonId?: string };
  let filtered = storiesJson as unknown as LocalStory[];

  if (pantheonSlug) {
    filtered = filtered.filter(
      (s) => s.pantheon?.slug === pantheonSlug || s.pantheonId === pantheonSlug,
    );
  }
  if (category) {
    filtered = filtered.filter((s) => s.category === category);
  }

  const paginated = filtered.slice(offset, offset + limit);

  return {
    stories: paginated,
    total: filtered.length,
    hasMore: offset + paginated.length < filtered.length,
  };
}

/**
 * Fetch a single story by its slug
 */
export async function fetchStoryBySlug(
  slug: string,
  options?: { draft?: boolean; previewToken?: string },
): Promise<HygraphStory | null> {
  if (isHygraphConfigured()) {
    const response = await hygraphRequest<GetStoryBySlugResponse>(
      HYGRAPH_GET_STORY_BY_SLUG,
      { slug },
      { draft: options?.draft, previewToken: options?.previewToken },
    );

    if (response?.story) {
      return response.story;
    }
  }

  // Fallback to local JSON
  const localStories = storiesJson as HygraphStory[];
  return localStories.find((s) => s.slug === slug) ?? null;
}

/**
 * Fetch stories by pantheon
 */
export async function fetchStoriesByPantheon(
  pantheonSlug: string,
  options?: { limit?: number; offset?: number; draft?: boolean },
): Promise<StoriesResult> {
  return fetchStories(
    {
      pantheonSlug,
      limit: options?.limit,
      offset: options?.offset,
    },
    { draft: options?.draft },
  );
}

/**
 * Fetch stories by category (e.g., "creation", "heroic", "tragedy")
 */
export async function fetchStoriesByCategory(
  category: string,
  options?: { limit?: number; offset?: number },
): Promise<StoriesResult> {
  return fetchStories({
    category,
    limit: options?.limit,
    offset: options?.offset,
  });
}

/**
 * Fetch related stories for a given story
 */
export async function fetchRelatedStories(
  storySlug: string,
  limit = 5,
): Promise<HygraphStory[]> {
  const story = await fetchStoryBySlug(storySlug);
  if (!story) return [];

  // Get stories from same pantheon and/or category
  const { stories } = await fetchStories({
    pantheonSlug: story.pantheon?.slug,
    limit: limit + 1, // Get one extra to filter out current story
  });

  return stories.filter((s) => s.slug !== storySlug).slice(0, limit);
}

/**
 * Get all unique story categories
 */
export async function fetchStoryCategories(): Promise<string[]> {
  const { stories } = await fetchStories({ limit: 1000 });
  const categories = new Set<string>();

  for (const story of stories) {
    if (story.category) {
      categories.add(story.category);
    }
  }

  return Array.from(categories).sort();
}

/**
 * Fetch story with draft content for preview mode
 */
export async function fetchStoryPreview(
  slug: string,
  previewToken: string,
): Promise<HygraphStory | null> {
  return fetchStoryBySlug(slug, { draft: true, previewToken });
}
