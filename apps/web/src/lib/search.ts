/**
 * Smart Search Library for Mythos Atlas
 * Provides unified search across all content types with scoring
 */

import deities from '@/data/deities.json';
import stories from '@/data/stories.json';
import creatures from '@/data/creatures.json';
import artifacts from '@/data/artifacts.json';
import locations from '@/data/locations.json';

// Content type definitions
export type ContentType = 'deity' | 'story' | 'creature' | 'artifact' | 'location';

export interface SearchResult {
  type: ContentType;
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  matchScore: number;
}

interface DeityData {
  id: string;
  name: string;
  slug: string;
  description: string;
  domain?: string[];
  alternateNames?: string[];
  pantheonId?: string;
}

interface StoryData {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category?: string;
  pantheonId?: string;
}

interface CreatureData {
  id: string;
  name: string;
  slug: string;
  description: string;
  habitat?: string;
  pantheonId?: string;
}

interface ArtifactData {
  id: string;
  name: string;
  slug: string;
  description: string;
  type?: string;
  pantheonId?: string;
}

interface LocationData {
  id: string;
  name: string;
  slug?: string;
  description: string;
  locationType?: string;
  pantheonId?: string;
}

// Pantheon ID to readable name mapping
const pantheonNames: Record<string, string> = {
  'greek-pantheon': 'Greek',
  'norse-pantheon': 'Norse',
  'egyptian-pantheon': 'Egyptian',
  'roman-pantheon': 'Roman',
  'hindu-pantheon': 'Hindu',
  'japanese-pantheon': 'Japanese',
  'celtic-pantheon': 'Celtic',
  'mesopotamian-pantheon': 'Mesopotamian',
};

/**
 * Calculate match score based on where the query matches
 * Higher scores for title matches, lower for description matches
 */
function calculateMatchScore(query: string, fields: { value: string; weight: number }[]): number {
  const normalizedQuery = query.toLowerCase().trim();
  let totalScore = 0;

  for (const field of fields) {
    if (!field.value) continue;
    const normalizedValue = field.value.toLowerCase();

    // Exact match gets highest score
    if (normalizedValue === normalizedQuery) {
      totalScore += 100 * field.weight;
    }
    // Starts with query
    else if (normalizedValue.startsWith(normalizedQuery)) {
      totalScore += 80 * field.weight;
    }
    // Word boundary match
    else if (normalizedValue.includes(` ${normalizedQuery}`) || normalizedValue.includes(`${normalizedQuery} `)) {
      totalScore += 60 * field.weight;
    }
    // Contains query
    else if (normalizedValue.includes(normalizedQuery)) {
      totalScore += 40 * field.weight;
    }
  }

  return totalScore;
}

/** Build a pantheon-prefixed label like "Greek Deity" or just "Deity" */
function getPantheonLabel(pantheonId: string | undefined, typeName: string): string {
  const name = pantheonId ? pantheonNames[pantheonId] : '';
  return name ? `${name} ${typeName}` : typeName;
}

/** Generic scored search over a typed collection */
function searchItems<T extends { id: string }>(
  items: T[],
  query: string,
  config: {
    type: ContentType;
    getTitle: (item: T) => string;
    getSlug: (item: T) => string;
    getSearchFields: (item: T) => { value: string; weight: number }[];
    getSubtitle: (item: T) => string;
  },
): SearchResult[] {
  const results: SearchResult[] = [];
  for (const item of items) {
    const score = calculateMatchScore(query, config.getSearchFields(item));
    if (score > 0) {
      results.push({
        type: config.type,
        id: item.id,
        slug: config.getSlug(item),
        title: config.getTitle(item),
        subtitle: config.getSubtitle(item),
        matchScore: score,
      });
    }
  }
  return results;
}

/**
 * Search across all content types
 */
export function searchAll(query: string, limit: number = 10): SearchResult[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  const results: SearchResult[] = [
    ...searchItems(deities as DeityData[], normalizedQuery, {
      type: 'deity',
      getTitle: (d) => d.name,
      getSlug: (d) => d.slug,
      getSearchFields: (d) => [
        { value: d.name, weight: 3 },
        { value: d.alternateNames?.join(' ') || '', weight: 2.5 },
        { value: d.domain?.join(' ') || '', weight: 1.5 },
        { value: d.description, weight: 1 },
      ],
      getSubtitle: (d) => getPantheonLabel(d.pantheonId, 'Deity'),
    }),
    ...searchItems(stories as StoryData[], normalizedQuery, {
      type: 'story',
      getTitle: (s) => s.title,
      getSlug: (s) => s.slug,
      getSearchFields: (s) => [
        { value: s.title, weight: 3 },
        { value: s.summary, weight: 1.5 },
        { value: s.category || '', weight: 1 },
      ],
      getSubtitle: (s) => getPantheonLabel(s.pantheonId, 'Story'),
    }),
    ...searchItems(creatures as CreatureData[], normalizedQuery, {
      type: 'creature',
      getTitle: (c) => c.name,
      getSlug: (c) => c.slug,
      getSearchFields: (c) => [
        { value: c.name, weight: 3 },
        { value: c.description, weight: 1.5 },
        { value: c.habitat || '', weight: 1 },
      ],
      getSubtitle: (c) => c.habitat || getPantheonLabel(c.pantheonId, 'Creature'),
    }),
    ...searchItems(artifacts as ArtifactData[], normalizedQuery, {
      type: 'artifact',
      getTitle: (a) => a.name,
      getSlug: (a) => a.slug,
      getSearchFields: (a) => [
        { value: a.name, weight: 3 },
        { value: a.description, weight: 1.5 },
        { value: a.type || '', weight: 1 },
      ],
      getSubtitle: (a) => a.type ? a.type.charAt(0).toUpperCase() + a.type.slice(1) : 'Artifact',
    }),
    ...searchItems(locations as LocationData[], normalizedQuery, {
      type: 'location',
      getTitle: (l) => l.name,
      getSlug: (l) => l.slug || l.id,
      getSearchFields: (l) => [
        { value: l.name, weight: 3 },
        { value: l.description, weight: 1.5 },
        { value: l.locationType || '', weight: 1 },
      ],
      getSubtitle: (l) => {
        const pantheonName = l.pantheonId ? pantheonNames[l.pantheonId] : '';
        const locationType = l.locationType?.replace('_', ' ') || '';
        const capitalizedType = locationType.charAt(0).toUpperCase() + locationType.slice(1);
        return pantheonName ? `${pantheonName} ${capitalizedType}` : capitalizedType || 'Location';
      },
    }),
  ];

  return results.toSorted((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}

// Popular/trending searches - static list of common searches
const POPULAR_SEARCHES = [
  'Zeus',
  'Thor',
  'Odin',
  'Ragnarok',
  'Cerberus',
  'Olympus',
  'Athena',
  'Poseidon',
  'Hades',
  'Titanomachy',
];

/**
 * Get popular/trending search terms
 */
export function getPopularSearches(): string[] {
  return POPULAR_SEARCHES;
}

// LocalStorage key for recent searches
const RECENT_SEARCHES_KEY = 'mythos-atlas-recent-searches';
const MAX_RECENT_SEARCHES = 10;

/**
 * Get recent searches from localStorage
 */
export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save a search term to recent searches
 */
export function saveRecentSearch(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) {
    return;
  }

  try {
    const recent = getRecentSearches();
    const normalized = query.trim();

    // Remove if already exists (to move to front)
    const filtered = recent.filter(s => s.toLowerCase() !== normalized.toLowerCase());

    // Add to front and limit
    const updated = [normalized, ...filtered].slice(0, MAX_RECENT_SEARCHES);

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Clear recent searches
 */
export function clearRecentSearches(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get URL for a search result
 */
export function getResultUrl(result: SearchResult): string {
  const typeToPath: Record<ContentType, string> = {
    deity: '/deities',
    story: '/stories',
    creature: '/creatures',
    artifact: '/artifacts',
    location: '/locations',
  };

  return `${typeToPath[result.type]}/${result.slug}`;
}
