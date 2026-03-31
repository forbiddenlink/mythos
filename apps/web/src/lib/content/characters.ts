/**
 * Character (Deity) content fetchers
 * Provides typed functions for fetching deity/character profiles from Hygraph
 */

import { hygraphRequest, isHygraphConfigured } from "../hygraph/client";
import {
  HYGRAPH_GET_DEITIES,
  HYGRAPH_GET_DEITY_BY_SLUG,
  HYGRAPH_GET_DEITIES_BY_PANTHEON,
  HYGRAPH_GET_DEITY_RELATIONSHIPS,
} from "../hygraph/queries";
import type {
  GetDeitiesResponse,
  GetDeityBySlugResponse,
  GetDeityRelationshipsResponse,
  HygraphDeity,
  HygraphDeityRelationship,
} from "../hygraph/types";
import deitiesJson from "@/data/deities.json";

export interface CharacterFilters {
  pantheonSlug?: string;
  gender?: "male" | "female" | "other";
  domain?: string;
  limit?: number;
  offset?: number;
}

export interface CharactersResult {
  characters: HygraphDeity[];
  total: number;
  hasMore: boolean;
}

/**
 * Fetch paginated list of characters/deities with optional filters
 */
export async function fetchCharacters(
  filters: CharacterFilters = {},
  options?: { draft?: boolean; previewToken?: string },
): Promise<CharactersResult> {
  const { pantheonSlug, gender, domain, limit = 20, offset = 0 } = filters;

  if (isHygraphConfigured()) {
    const where: Record<string, unknown> = {};
    if (pantheonSlug) {
      where.pantheon = { slug: pantheonSlug };
    }
    if (gender) {
      where.gender = gender;
    }
    if (domain) {
      where.domain_contains_some = [domain];
    }

    const response = await hygraphRequest<GetDeitiesResponse>(
      HYGRAPH_GET_DEITIES,
      {
        first: limit,
        skip: offset,
        where: Object.keys(where).length > 0 ? where : undefined,
      },
      { draft: options?.draft, previewToken: options?.previewToken },
    );

    if (response) {
      return {
        characters: response.deities,
        total: response.deitiesConnection.aggregate.count,
        hasMore:
          offset + response.deities.length <
          response.deitiesConnection.aggregate.count,
      };
    }
  }

  // Fallback to local JSON
  // Local JSON uses pantheonId string, Hygraph uses pantheon object
  type LocalDeity = HygraphDeity & { pantheonId?: string };
  let filtered = deitiesJson as unknown as LocalDeity[];

  if (pantheonSlug) {
    filtered = filtered.filter(
      (d) => d.pantheon?.slug === pantheonSlug || d.pantheonId === pantheonSlug,
    );
  }
  if (gender) {
    filtered = filtered.filter((d) => d.gender === gender);
  }
  if (domain) {
    filtered = filtered.filter((d) =>
      d.domain?.some((dom) => dom.toLowerCase().includes(domain.toLowerCase())),
    );
  }

  const paginated = filtered.slice(offset, offset + limit);

  return {
    characters: paginated,
    total: filtered.length,
    hasMore: offset + paginated.length < filtered.length,
  };
}

/**
 * Fetch a single character/deity by slug
 */
export async function fetchCharacterBySlug(
  slug: string,
  options?: { draft?: boolean; previewToken?: string },
): Promise<HygraphDeity | null> {
  if (isHygraphConfigured()) {
    const response = await hygraphRequest<GetDeityBySlugResponse>(
      HYGRAPH_GET_DEITY_BY_SLUG,
      { slug },
      { draft: options?.draft, previewToken: options?.previewToken },
    );

    if (response?.deity) {
      return response.deity;
    }
  }

  // Fallback to local JSON
  const localDeities = deitiesJson as HygraphDeity[];
  return localDeities.find((d) => d.slug === slug) ?? null;
}

/**
 * Fetch characters by pantheon
 */
export async function fetchCharactersByPantheon(
  pantheonSlug: string,
  options?: { limit?: number; offset?: number },
): Promise<CharactersResult> {
  if (isHygraphConfigured()) {
    const response = await hygraphRequest<{ deities: HygraphDeity[] }>(
      HYGRAPH_GET_DEITIES_BY_PANTHEON,
      {
        pantheonSlug,
        first: options?.limit ?? 100,
        skip: options?.offset ?? 0,
      },
    );

    if (response?.deities) {
      return {
        characters: response.deities,
        total: response.deities.length,
        hasMore: false, // This query doesn't return total count
      };
    }
  }

  return fetchCharacters({
    pantheonSlug,
    limit: options?.limit,
    offset: options?.offset,
  });
}

/**
 * Fetch character relationships
 */
export async function fetchCharacterRelationships(
  characterId: string,
): Promise<HygraphDeityRelationship[]> {
  if (isHygraphConfigured()) {
    const response = await hygraphRequest<GetDeityRelationshipsResponse>(
      HYGRAPH_GET_DEITY_RELATIONSHIPS,
      { deityId: characterId },
    );

    if (response?.deityRelationships) {
      return response.deityRelationships;
    }
  }

  // Fallback - relationships from local data would need separate handling
  return [];
}

/**
 * Fetch characters by domain (e.g., "war", "love", "wisdom")
 */
export async function fetchCharactersByDomain(
  domain: string,
  options?: { limit?: number; offset?: number },
): Promise<CharactersResult> {
  return fetchCharacters({
    domain,
    limit: options?.limit,
    offset: options?.offset,
  });
}

/**
 * Get all unique domains across all characters
 */
export async function fetchAllDomains(): Promise<string[]> {
  const { characters } = await fetchCharacters({ limit: 1000 });
  const domains = new Set<string>();

  for (const char of characters) {
    if (char.domain) {
      for (const dom of char.domain) {
        domains.add(dom);
      }
    }
  }

  return Array.from(domains).sort();
}

/**
 * Fetch featured/important characters (top by importance rank)
 */
export async function fetchFeaturedCharacters(
  limit = 10,
): Promise<HygraphDeity[]> {
  const { characters } = await fetchCharacters({ limit: 100 });

  return characters
    .sort((a, b) => (a.importanceRank ?? 999) - (b.importanceRank ?? 999))
    .slice(0, limit);
}

/**
 * Search characters by name or alternate names
 */
export async function searchCharacters(
  query: string,
  options?: { limit?: number },
): Promise<HygraphDeity[]> {
  const { characters } = await fetchCharacters({ limit: 1000 });
  const searchTerm = query.toLowerCase();

  return characters
    .filter(
      (char) =>
        char.name.toLowerCase().includes(searchTerm) ||
        char.alternateNames?.some((name) =>
          name.toLowerCase().includes(searchTerm),
        ) ||
        char.domain?.some((dom) => dom.toLowerCase().includes(searchTerm)),
    )
    .slice(0, options?.limit ?? 20);
}

/**
 * Fetch character with draft content for preview mode
 */
export async function fetchCharacterPreview(
  slug: string,
  previewToken: string,
): Promise<HygraphDeity | null> {
  return fetchCharacterBySlug(slug, { draft: true, previewToken });
}
