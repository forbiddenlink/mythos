import { unstable_cache } from "next/cache";
import { hygraphRequest, isHygraphConfigured } from "./client";
import {
  HYGRAPH_GET_ARTIFACTS,
  HYGRAPH_GET_ARTIFACT_BY_SLUG,
  HYGRAPH_GET_CREATURES,
  HYGRAPH_GET_CREATURE_BY_SLUG,
  HYGRAPH_GET_DEITIES,
  HYGRAPH_GET_DEITIES_BY_PANTHEON,
  HYGRAPH_GET_DEITY_BY_SLUG,
  HYGRAPH_GET_LOCATIONS,
  HYGRAPH_GET_LOCATION_BY_SLUG,
  HYGRAPH_GET_PANTHEONS,
  HYGRAPH_GET_PANTHEON_BY_SLUG,
  HYGRAPH_GET_STORIES,
  HYGRAPH_GET_STORY_BY_SLUG,
  HYGRAPH_SEARCH,
} from "./queries";
import type {
  GetArtifactBySlugResponse,
  GetArtifactsResponse,
  GetCreatureBySlugResponse,
  GetCreaturesResponse,
  GetDeitiesResponse,
  GetDeityBySlugResponse,
  GetLocationBySlugResponse,
  GetLocationsResponse,
  GetPantheonBySlugResponse,
  GetPantheonsResponse,
  GetStoriesResponse,
  GetStoryBySlugResponse,
  HygraphArtifact,
  HygraphCreature,
  HygraphDeity,
  HygraphLocation,
  HygraphPantheon,
  HygraphStory,
  SearchResponse,
} from "./types";

// Local JSON imports for fallback
import artifactsJson from "@/data/artifacts.json";
import creaturesJson from "@/data/creatures.json";
import deitiesJson from "@/data/deities.json";
import locationsJson from "@/data/locations.json";
import pantheonsJson from "@/data/pantheons.json";
import storiesJson from "@/data/stories.json";

// Local data types - JSON files may have different structure than Hygraph types
// (e.g., pantheonId as string vs pantheon as object)
type LocalDeity = HygraphDeity & { pantheonId?: string };
type LocalStory = HygraphStory & { pantheonId?: string };
type LocalCreature = HygraphCreature & { pantheonId?: string };
type LocalArtifact = Omit<HygraphArtifact, "owner"> & {
  pantheonId?: string;
  owner?: string | { id: string; name: string; slug: string };
};
type LocalLocation = Partial<HygraphLocation> & {
  id: string;
  name: string;
  pantheonId?: string;
};

// Cache tags for revalidation
const CACHE_TAGS = {
  deities: "hygraph-deities",
  pantheons: "hygraph-pantheons",
  stories: "hygraph-stories",
  creatures: "hygraph-creatures",
  artifacts: "hygraph-artifacts",
  locations: "hygraph-locations",
} as const;

// Default cache revalidation time (1 hour)
const DEFAULT_REVALIDATE = 3600;

// ============================================================================
// Deity Functions
// ============================================================================

export const getDeities = unstable_cache(
  async (options?: {
    first?: number;
    skip?: number;
    pantheonSlug?: string;
  }): Promise<{ deities: HygraphDeity[]; total: number }> => {
    if (isHygraphConfigured()) {
      const response = await hygraphRequest<GetDeitiesResponse>(
        HYGRAPH_GET_DEITIES,
        {
          first: options?.first ?? 100,
          skip: options?.skip ?? 0,
          where: options?.pantheonSlug
            ? { pantheon: { slug: options.pantheonSlug } }
            : undefined,
        },
        { useHighPerf: true },
      );

      if (response) {
        return {
          deities: response.deities,
          total: response.deitiesConnection.aggregate.count,
        };
      }
    }

    // Fallback to local JSON
    const localDeities = deitiesJson as unknown as LocalDeity[];
    const filtered = options?.pantheonSlug
      ? localDeities.filter(
          (d) =>
            d.pantheon?.slug === options.pantheonSlug ||
            d.pantheonId === options.pantheonSlug,
        )
      : localDeities;

    const start = options?.skip ?? 0;
    const end = start + (options?.first ?? 100);

    return {
      deities: filtered.slice(start, end),
      total: filtered.length,
    };
  },
  ["deities"],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.deities] },
);

export const getDeityBySlug = unstable_cache(
  async (slug: string): Promise<HygraphDeity | null> => {
    if (isHygraphConfigured()) {
      const response = await hygraphRequest<GetDeityBySlugResponse>(
        HYGRAPH_GET_DEITY_BY_SLUG,
        { slug },
        { useHighPerf: true },
      );

      if (response?.deity) {
        return response.deity;
      }
    }

    // Fallback to local JSON
    const localDeities = deitiesJson as HygraphDeity[];
    return localDeities.find((d) => d.slug === slug) ?? null;
  },
  ["deity-by-slug"],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.deities] },
);

export const getDeitiesByPantheon = unstable_cache(
  async (
    pantheonSlug: string,
    options?: { first?: number; skip?: number },
  ): Promise<HygraphDeity[]> => {
    if (isHygraphConfigured()) {
      const response = await hygraphRequest<{ deities: HygraphDeity[] }>(
        HYGRAPH_GET_DEITIES_BY_PANTHEON,
        {
          pantheonSlug,
          first: options?.first ?? 100,
          skip: options?.skip ?? 0,
        },
        { useHighPerf: true },
      );

      if (response?.deities) {
        return response.deities;
      }
    }

    // Fallback to local JSON
    const localDeities = deitiesJson as unknown as LocalDeity[];
    return localDeities.filter(
      (d) => d.pantheon?.slug === pantheonSlug || d.pantheonId === pantheonSlug,
    );
  },
  ["deities-by-pantheon"],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.deities] },
);

// ============================================================================
// Pantheon Functions
// ============================================================================

export const getPantheons = unstable_cache(
  async (): Promise<HygraphPantheon[]> => {
    if (isHygraphConfigured()) {
      const response = await hygraphRequest<GetPantheonsResponse>(
        HYGRAPH_GET_PANTHEONS,
        undefined,
        { useHighPerf: true },
      );

      if (response?.pantheons) {
        return response.pantheons;
      }
    }

    // Fallback to local JSON
    return pantheonsJson as HygraphPantheon[];
  },
  ["pantheons"],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.pantheons] },
);

export const getPantheonBySlug = unstable_cache(
  async (slug: string): Promise<HygraphPantheon | null> => {
    if (isHygraphConfigured()) {
      const response = await hygraphRequest<GetPantheonBySlugResponse>(
        HYGRAPH_GET_PANTHEON_BY_SLUG,
        { slug },
        { useHighPerf: true },
      );

      if (response?.pantheon) {
        return response.pantheon;
      }
    }

    // Fallback to local JSON
    const localPantheons = pantheonsJson as HygraphPantheon[];
    return localPantheons.find((p) => p.slug === slug) ?? null;
  },
  ["pantheon-by-slug"],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.pantheons] },
);

// ============================================================================
// Story Functions
// ============================================================================

export const getStories = unstable_cache(
  async (options?: {
    first?: number;
    skip?: number;
    pantheonSlug?: string;
    category?: string;
  }): Promise<{ stories: HygraphStory[]; total: number }> => {
    if (isHygraphConfigured()) {
      const where: Record<string, unknown> = {};
      if (options?.pantheonSlug) {
        where.pantheon = { slug: options.pantheonSlug };
      }
      if (options?.category) {
        where.category = options.category;
      }

      const response = await hygraphRequest<GetStoriesResponse>(
        HYGRAPH_GET_STORIES,
        {
          first: options?.first ?? 100,
          skip: options?.skip ?? 0,
          where: Object.keys(where).length > 0 ? where : undefined,
        },
        { useHighPerf: true },
      );

      if (response) {
        return {
          stories: response.stories,
          total: response.storiesConnection.aggregate.count,
        };
      }
    }

    // Fallback to local JSON
    const localStories = storiesJson as unknown as LocalStory[];
    let filtered = localStories;

    if (options?.pantheonSlug) {
      filtered = filtered.filter(
        (s) =>
          s.pantheon?.slug === options.pantheonSlug ||
          s.pantheonId === options.pantheonSlug,
      );
    }
    if (options?.category) {
      filtered = filtered.filter((s) => s.category === options.category);
    }

    const start = options?.skip ?? 0;
    const end = start + (options?.first ?? 100);

    return {
      stories: filtered.slice(start, end),
      total: filtered.length,
    };
  },
  ["stories"],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.stories] },
);

export const getStoryBySlug = unstable_cache(
  async (slug: string): Promise<HygraphStory | null> => {
    if (isHygraphConfigured()) {
      const response = await hygraphRequest<GetStoryBySlugResponse>(
        HYGRAPH_GET_STORY_BY_SLUG,
        { slug },
        { useHighPerf: true },
      );

      if (response?.story) {
        return response.story;
      }
    }

    // Fallback to local JSON
    const localStories = storiesJson as HygraphStory[];
    return localStories.find((s) => s.slug === slug) ?? null;
  },
  ["story-by-slug"],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.stories] },
);

// ============================================================================
// Creature Functions
// ============================================================================

export const getCreatures = unstable_cache(
  async (options?: {
    first?: number;
    skip?: number;
    pantheonSlug?: string;
  }): Promise<{ creatures: HygraphCreature[]; total: number }> => {
    if (isHygraphConfigured()) {
      const response = await hygraphRequest<GetCreaturesResponse>(
        HYGRAPH_GET_CREATURES,
        {
          first: options?.first ?? 100,
          skip: options?.skip ?? 0,
          where: options?.pantheonSlug
            ? { pantheon: { slug: options.pantheonSlug } }
            : undefined,
        },
        { useHighPerf: true },
      );

      if (response) {
        return {
          creatures: response.creatures,
          total: response.creaturesConnection.aggregate.count,
        };
      }
    }

    // Fallback to local JSON
    const localCreatures = creaturesJson as unknown as LocalCreature[];
    const filtered = options?.pantheonSlug
      ? localCreatures.filter(
          (c) =>
            c.pantheon?.slug === options.pantheonSlug ||
            c.pantheonId === options.pantheonSlug,
        )
      : localCreatures;

    const start = options?.skip ?? 0;
    const end = start + (options?.first ?? 100);

    return {
      creatures: filtered.slice(start, end),
      total: filtered.length,
    };
  },
  ["creatures"],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.creatures] },
);

export const getCreatureBySlug = unstable_cache(
  async (slug: string): Promise<HygraphCreature | null> => {
    if (isHygraphConfigured()) {
      const response = await hygraphRequest<GetCreatureBySlugResponse>(
        HYGRAPH_GET_CREATURE_BY_SLUG,
        { slug },
        { useHighPerf: true },
      );

      if (response?.creature) {
        return response.creature;
      }
    }

    // Fallback to local JSON
    const localCreatures = creaturesJson as HygraphCreature[];
    return localCreatures.find((c) => c.slug === slug) ?? null;
  },
  ["creature-by-slug"],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.creatures] },
);

// ============================================================================
// Artifact Functions
// ============================================================================

export const getArtifacts = unstable_cache(
  async (options?: {
    first?: number;
    skip?: number;
    pantheonSlug?: string;
  }): Promise<{ artifacts: HygraphArtifact[]; total: number }> => {
    if (isHygraphConfigured()) {
      const response = await hygraphRequest<GetArtifactsResponse>(
        HYGRAPH_GET_ARTIFACTS,
        {
          first: options?.first ?? 100,
          skip: options?.skip ?? 0,
          where: options?.pantheonSlug
            ? { pantheon: { slug: options.pantheonSlug } }
            : undefined,
        },
        { useHighPerf: true },
      );

      if (response) {
        return {
          artifacts: response.artifacts,
          total: response.artifactsConnection.aggregate.count,
        };
      }
    }

    // Fallback to local JSON
    const localArtifacts = artifactsJson as unknown as LocalArtifact[];
    const filtered = options?.pantheonSlug
      ? localArtifacts.filter(
          (a) =>
            a.pantheon?.slug === options.pantheonSlug ||
            a.pantheonId === options.pantheonSlug,
        )
      : localArtifacts;

    const start = options?.skip ?? 0;
    const end = start + (options?.first ?? 100);

    return {
      artifacts: filtered.slice(start, end) as unknown as HygraphArtifact[],
      total: filtered.length,
    };
  },
  ["artifacts"],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.artifacts] },
);

export const getArtifactBySlug = unstable_cache(
  async (slug: string): Promise<HygraphArtifact | null> => {
    if (isHygraphConfigured()) {
      const response = await hygraphRequest<GetArtifactBySlugResponse>(
        HYGRAPH_GET_ARTIFACT_BY_SLUG,
        { slug },
        { useHighPerf: true },
      );

      if (response?.artifact) {
        return response.artifact;
      }
    }

    // Fallback to local JSON
    const localArtifacts = artifactsJson as unknown as LocalArtifact[];
    return (
      (localArtifacts.find((a) => a.slug === slug) as HygraphArtifact) ?? null
    );
  },
  ["artifact-by-slug"],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.artifacts] },
);

// ============================================================================
// Location Functions
// ============================================================================

export const getLocations = unstable_cache(
  async (options?: {
    first?: number;
    skip?: number;
    pantheonSlug?: string;
  }): Promise<{ locations: HygraphLocation[]; total: number }> => {
    if (isHygraphConfigured()) {
      const response = await hygraphRequest<GetLocationsResponse>(
        HYGRAPH_GET_LOCATIONS,
        {
          first: options?.first ?? 100,
          skip: options?.skip ?? 0,
          where: options?.pantheonSlug
            ? { pantheon: { slug: options.pantheonSlug } }
            : undefined,
        },
        { useHighPerf: true },
      );

      if (response) {
        return {
          locations: response.locations,
          total: response.locationsConnection.aggregate.count,
        };
      }
    }

    // Fallback to local JSON
    const localLocations = (locationsJson as unknown as LocalLocation[]).map(
      (l) => ({
        ...l,
        slug: l.slug ?? l.id,
      }),
    ) as HygraphLocation[];
    const filtered = options?.pantheonSlug
      ? localLocations.filter(
          (l) =>
            l.pantheon?.slug === options.pantheonSlug ||
            (l as unknown as LocalLocation).pantheonId === options.pantheonSlug,
        )
      : localLocations;

    const start = options?.skip ?? 0;
    const end = start + (options?.first ?? 100);

    return {
      locations: filtered.slice(start, end),
      total: filtered.length,
    };
  },
  ["locations"],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.locations] },
);

export const getLocationBySlug = unstable_cache(
  async (slug: string): Promise<HygraphLocation | null> => {
    if (isHygraphConfigured()) {
      const response = await hygraphRequest<GetLocationBySlugResponse>(
        HYGRAPH_GET_LOCATION_BY_SLUG,
        { slug },
        { useHighPerf: true },
      );

      if (response?.location) {
        return response.location;
      }
    }

    // Fallback to local JSON
    const localLocations = (locationsJson as unknown as LocalLocation[]).map(
      (l) => ({
        ...l,
        slug: l.slug ?? l.id,
      }),
    ) as HygraphLocation[];
    return localLocations.find((l) => l.slug === slug) ?? null;
  },
  ["location-by-slug"],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.locations] },
);

// ============================================================================
// Search Function
// ============================================================================

export const searchContent = unstable_cache(
  async (query: string, limit = 10): Promise<SearchResponse> => {
    if (isHygraphConfigured()) {
      const response = await hygraphRequest<SearchResponse>(
        HYGRAPH_SEARCH,
        { query, limit },
        { useHighPerf: true },
      );

      if (response) {
        return response;
      }
    }

    // Fallback to local search
    const searchTerm = query.toLowerCase();

    const matchDeity = (d: HygraphDeity) =>
      d.name.toLowerCase().includes(searchTerm) ||
      d.description?.toLowerCase().includes(searchTerm) ||
      d.domain?.some((dom) => dom.toLowerCase().includes(searchTerm));

    const matchCreature = (c: HygraphCreature) =>
      c.name.toLowerCase().includes(searchTerm) ||
      c.description?.toLowerCase().includes(searchTerm) ||
      c.habitat?.toLowerCase().includes(searchTerm);

    const matchPantheon = (p: HygraphPantheon) =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.description?.toLowerCase().includes(searchTerm) ||
      p.culture?.toLowerCase().includes(searchTerm);

    const matchStory = (s: HygraphStory) =>
      s.title.toLowerCase().includes(searchTerm) ||
      s.summary?.toLowerCase().includes(searchTerm);

    return {
      deities: (deitiesJson as HygraphDeity[])
        .filter(matchDeity)
        .slice(0, limit)
        .map((d) => ({
          id: d.id,
          name: d.name,
          slug: d.slug,
          domain: d.domain,
          description: d.description,
          imageUrl: d.imageUrl,
        })),
      creatures: (creaturesJson as HygraphCreature[])
        .filter(matchCreature)
        .slice(0, limit)
        .map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          habitat: c.habitat,
          description: c.description,
          imageUrl: c.imageUrl,
        })),
      artifacts: (artifactsJson as unknown as LocalArtifact[])
        .filter(
          (a) =>
            a.name.toLowerCase().includes(searchTerm) ||
            a.description?.toLowerCase().includes(searchTerm) ||
            a.type?.toLowerCase().includes(searchTerm),
        )
        .slice(0, limit)
        .map((a) => ({
          id: a.id,
          name: a.name,
          slug: a.slug,
          type: a.type,
          description: a.description,
          imageUrl: a.imageUrl,
        })),
      pantheons: (pantheonsJson as HygraphPantheon[])
        .filter(matchPantheon)
        .slice(0, limit)
        .map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          culture: p.culture,
          description: p.description,
        })),
      stories: (storiesJson as HygraphStory[])
        .filter(matchStory)
        .slice(0, limit)
        .map((s) => ({
          id: s.id,
          title: s.title,
          slug: s.slug,
          summary: s.summary,
        })),
    };
  },
  ["search"],
  { revalidate: 60 }, // Search cache revalidates more frequently
);
