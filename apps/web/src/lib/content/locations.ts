/**
 * Location content fetchers
 * Provides typed functions for fetching mythological locations from Hygraph
 */

import { hygraphRequest, isHygraphConfigured } from "../hygraph/client";
import {
  HYGRAPH_GET_LOCATIONS,
  HYGRAPH_GET_LOCATION_BY_SLUG,
} from "../hygraph/queries";
import type {
  GetLocationsResponse,
  GetLocationBySlugResponse,
  HygraphLocation,
} from "../hygraph/types";
import locationsJson from "@/data/locations.json";

export interface LocationFilters {
  pantheonSlug?: string;
  locationType?: string;
  limit?: number;
  offset?: number;
}

export interface LocationsResult {
  locations: HygraphLocation[];
  total: number;
  hasMore: boolean;
}

/**
 * Fetch paginated list of locations with optional filters
 */
export async function fetchLocations(
  filters: LocationFilters = {},
  options?: { draft?: boolean; previewToken?: string },
): Promise<LocationsResult> {
  const { pantheonSlug, locationType, limit = 20, offset = 0 } = filters;

  if (isHygraphConfigured()) {
    const where: Record<string, unknown> = {};
    if (pantheonSlug) {
      where.pantheon = { slug: pantheonSlug };
    }
    if (locationType) {
      where.locationType = locationType;
    }

    const response = await hygraphRequest<GetLocationsResponse>(
      HYGRAPH_GET_LOCATIONS,
      {
        first: limit,
        skip: offset,
        where: Object.keys(where).length > 0 ? where : undefined,
      },
      { draft: options?.draft, previewToken: options?.previewToken },
    );

    if (response) {
      return {
        locations: response.locations,
        total: response.locationsConnection.aggregate.count,
        hasMore:
          offset + response.locations.length <
          response.locationsConnection.aggregate.count,
      };
    }
  }

  // Fallback to local JSON
  // Local JSON may have different structure (pantheonId string, optional slug)
  type LocalLocation = Partial<HygraphLocation> & {
    id: string;
    name: string;
    pantheonId?: string;
  };
  let filtered = (locationsJson as unknown as LocalLocation[]).map((l) => ({
    ...l,
    slug: l.slug ?? l.id,
  })) as HygraphLocation[];

  if (pantheonSlug) {
    const localFiltered = locationsJson as unknown as LocalLocation[];
    filtered = localFiltered
      .filter(
        (l) =>
          l.pantheon?.slug === pantheonSlug || l.pantheonId === pantheonSlug,
      )
      .map((l) => ({ ...l, slug: l.slug ?? l.id })) as HygraphLocation[];
  }
  if (locationType) {
    filtered = filtered.filter((l) => l.locationType === locationType);
  }

  const paginated = filtered.slice(offset, offset + limit);

  return {
    locations: paginated,
    total: filtered.length,
    hasMore: offset + paginated.length < filtered.length,
  };
}

/**
 * Fetch a single location by slug
 */
export async function fetchLocationBySlug(
  slug: string,
  options?: { draft?: boolean; previewToken?: string },
): Promise<HygraphLocation | null> {
  if (isHygraphConfigured()) {
    const response = await hygraphRequest<GetLocationBySlugResponse>(
      HYGRAPH_GET_LOCATION_BY_SLUG,
      { slug },
      { draft: options?.draft, previewToken: options?.previewToken },
    );

    if (response?.location) {
      return response.location;
    }
  }

  // Fallback to local JSON - use id as slug fallback
  type LocalLocation = Partial<HygraphLocation> & { id: string; name: string };
  const localLocations = locationsJson as unknown as LocalLocation[];
  const found = localLocations.find((l) => (l.slug ?? l.id) === slug);
  if (found) {
    return { ...found, slug: found.slug ?? found.id } as HygraphLocation;
  }
  return null;
}

/**
 * Fetch locations by pantheon
 */
export async function fetchLocationsByPantheon(
  pantheonSlug: string,
  options?: { limit?: number; offset?: number },
): Promise<LocationsResult> {
  return fetchLocations({
    pantheonSlug,
    limit: options?.limit,
    offset: options?.offset,
  });
}

/**
 * Fetch locations by type (e.g., "realm", "temple", "mountain")
 */
export async function fetchLocationsByType(
  locationType: string,
  options?: { limit?: number; offset?: number },
): Promise<LocationsResult> {
  return fetchLocations({
    locationType,
    limit: options?.limit,
    offset: options?.offset,
  });
}

/**
 * Get all unique location types
 */
export async function fetchLocationTypes(): Promise<string[]> {
  const { locations } = await fetchLocations({ limit: 1000 });
  const types = new Set<string>();

  for (const location of locations) {
    if (location.locationType) {
      types.add(location.locationType);
    }
  }

  return Array.from(types).sort();
}

/**
 * Fetch locations with geographic coordinates (for map display)
 */
export async function fetchMappableLocations(options?: {
  pantheonSlug?: string;
  limit?: number;
}): Promise<HygraphLocation[]> {
  const { locations } = await fetchLocations({
    pantheonSlug: options?.pantheonSlug,
    limit: options?.limit ?? 1000,
  });

  return locations.filter(
    (l) => l.latitude !== undefined && l.longitude !== undefined,
  );
}

/**
 * Fetch nearby locations based on coordinates
 */
export async function fetchNearbyLocations(
  latitude: number,
  longitude: number,
  radiusKm = 100,
  limit = 10,
): Promise<HygraphLocation[]> {
  const mappable = await fetchMappableLocations({ limit: 1000 });

  // Haversine formula for distance calculation
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const withDistance = mappable
    .map((loc) => {
      const lat1 = toRad(latitude);
      const lat2 = toRad(loc.latitude!);
      const dLat = toRad(loc.latitude! - latitude);
      const dLon = toRad(loc.longitude! - longitude);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) *
          Math.cos(lat2) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = earthRadiusKm * c;

      return { ...loc, distance };
    })
    .filter((loc) => loc.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);

  return withDistance.slice(0, limit);
}

/**
 * Search locations by name
 */
export async function searchLocations(
  query: string,
  options?: { limit?: number },
): Promise<HygraphLocation[]> {
  const { locations } = await fetchLocations({ limit: 1000 });
  const searchTerm = query.toLowerCase();

  return locations
    .filter(
      (loc) =>
        loc.name.toLowerCase().includes(searchTerm) ||
        loc.description?.toLowerCase().includes(searchTerm) ||
        loc.locationType?.toLowerCase().includes(searchTerm),
    )
    .slice(0, options?.limit ?? 20);
}

/**
 * Fetch location with draft content for preview mode
 */
export async function fetchLocationPreview(
  slug: string,
  previewToken: string,
): Promise<HygraphLocation | null> {
  return fetchLocationBySlug(slug, { draft: true, previewToken });
}
