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

/**
 * Search across all content types
 */
export function searchAll(query: string, limit: number = 10): SearchResult[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const results: SearchResult[] = [];
  const normalizedQuery = query.toLowerCase().trim();

  // Search deities
  for (const deity of deities as DeityData[]) {
    const alternateNamesStr = deity.alternateNames?.join(' ') || '';
    const domainsStr = deity.domain?.join(' ') || '';

    const score = calculateMatchScore(normalizedQuery, [
      { value: deity.name, weight: 3 },
      { value: alternateNamesStr, weight: 2.5 },
      { value: domainsStr, weight: 1.5 },
      { value: deity.description, weight: 1 },
    ]);

    if (score > 0) {
      const pantheonName = deity.pantheonId ? pantheonNames[deity.pantheonId] : '';
      results.push({
        type: 'deity',
        id: deity.id,
        slug: deity.slug,
        title: deity.name,
        subtitle: pantheonName ? `${pantheonName} Deity` : 'Deity',
        matchScore: score,
      });
    }
  }

  // Search stories
  for (const story of stories as StoryData[]) {
    const score = calculateMatchScore(normalizedQuery, [
      { value: story.title, weight: 3 },
      { value: story.summary, weight: 1.5 },
      { value: story.category || '', weight: 1 },
    ]);

    if (score > 0) {
      const pantheonName = story.pantheonId ? pantheonNames[story.pantheonId] : '';
      results.push({
        type: 'story',
        id: story.id,
        slug: story.slug,
        title: story.title,
        subtitle: pantheonName ? `${pantheonName} Story` : 'Story',
        matchScore: score,
      });
    }
  }

  // Search creatures
  for (const creature of creatures as CreatureData[]) {
    const score = calculateMatchScore(normalizedQuery, [
      { value: creature.name, weight: 3 },
      { value: creature.description, weight: 1.5 },
      { value: creature.habitat || '', weight: 1 },
    ]);

    if (score > 0) {
      const pantheonName = creature.pantheonId ? pantheonNames[creature.pantheonId] : '';
      results.push({
        type: 'creature',
        id: creature.id,
        slug: creature.slug,
        title: creature.name,
        subtitle: creature.habitat || (pantheonName ? `${pantheonName} Creature` : 'Creature'),
        matchScore: score,
      });
    }
  }

  // Search artifacts
  for (const artifact of artifacts as ArtifactData[]) {
    const score = calculateMatchScore(normalizedQuery, [
      { value: artifact.name, weight: 3 },
      { value: artifact.description, weight: 1.5 },
      { value: artifact.type || '', weight: 1 },
    ]);

    if (score > 0) {
      results.push({
        type: 'artifact',
        id: artifact.id,
        slug: artifact.slug,
        title: artifact.name,
        subtitle: artifact.type ? `${artifact.type.charAt(0).toUpperCase() + artifact.type.slice(1)}` : 'Artifact',
        matchScore: score,
      });
    }
  }

  // Search locations
  for (const location of locations as LocationData[]) {
    // Locations might not have slugs - create from id
    const slug = (location as any).slug || location.id;

    const score = calculateMatchScore(normalizedQuery, [
      { value: location.name, weight: 3 },
      { value: location.description, weight: 1.5 },
      { value: location.locationType || '', weight: 1 },
    ]);

    if (score > 0) {
      const pantheonName = location.pantheonId ? pantheonNames[location.pantheonId] : '';
      const locationType = location.locationType?.replace('_', ' ') || '';
      results.push({
        type: 'location',
        id: location.id,
        slug: slug,
        title: location.name,
        subtitle: pantheonName
          ? `${pantheonName} ${locationType.charAt(0).toUpperCase() + locationType.slice(1)}`
          : locationType.charAt(0).toUpperCase() + locationType.slice(1) || 'Location',
        matchScore: score,
      });
    }
  }

  // Sort by score descending and limit results
  return results
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
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
