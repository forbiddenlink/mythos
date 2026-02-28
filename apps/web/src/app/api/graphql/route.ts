import { NextRequest, NextResponse } from 'next/server';
import pantheons from '@/data/pantheons.json';
import deities from '@/data/deities.json';
import stories from '@/data/stories.json';
import relationships from '@/data/relationships.json';
import locations from '@/data/locations.json';
import creatures from '@/data/creatures.json';
import artifacts from '@/data/artifacts.json';
import Fuse from 'fuse.js';

// Type definitions
interface Pantheon {
  id: string;
  name: string;
  slug: string;
  culture: string;
  region: string;
  timePeriodStart: number;
  timePeriodEnd: number;
  description: string;
  detailedHistory?: string;
}

interface Pronunciation {
  ipa: string;
  phonetic: string;
  audioUrl?: string;
}

interface Deity {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  alternateNames?: string[];
  gender: string;
  domain: string[];
  symbols: string[];
  description: string;
  detailedBio?: string;
  originStory?: string;
  pronunciation?: Pronunciation;
  importanceRank: number;
  imageUrl?: string;
}

interface Creature {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  description: string;
  habitat: string;
  abilities: string[];
  dangerLevel: number;
  imageUrl?: string;
}

interface Artifact {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  ownerId?: string;
  type: string;
  description: string;
  powers: string[];
  originStory?: string;
  imageUrl?: string;
}

interface Story {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary: string;
  fullNarrative?: string;
  keyExcerpts?: string;
  category: string;
  moralThemes?: string[];
  culturalSignificance?: string;
}

interface Relationship {
  id: string;
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
  confidenceLevel: string;
  description?: string;
  storyContext?: string;
  isDisputed?: boolean;
}

interface Location {
  id: string;
  name: string;
  locationType: string;
  pantheonId: string;
  description: string;
  latitude?: number;
  longitude?: number;
}

// Simple GraphQL query parser
function parseGraphQLQuery(query: string): { operationName: string; variables: Record<string, unknown> } {
  // Extract query name
  const queryMatch = query.match(/query\s+(\w+)/);
  const operationName = queryMatch ? queryMatch[1] : '';
  return { operationName, variables: {} };
}

// Resolvers
function resolvePantheons(): Pantheon[] {
  return pantheons as Pantheon[];
}

function resolveDeities(pantheonId?: string): Deity[] {
  if (pantheonId) {
    return (deities as Deity[]).filter(d => d.pantheonId === pantheonId);
  }
  return deities as Deity[];
}

function resolveDeity(id: string): Deity | undefined {
  // Try to find by id first, then by slug
  return (deities as Deity[]).find(d => d.id === id || d.slug === id);
}

function resolveCreatures(pantheonId?: string): Creature[] {
  if (pantheonId) {
    return (creatures as Creature[]).filter(c => c.pantheonId === pantheonId);
  }
  return creatures as Creature[];
}

function resolveCreature(id: string): Creature | undefined {
  return (creatures as Creature[]).find(c => c.id === id || c.slug === id);
}

function resolveArtifacts(pantheonId?: string): Artifact[] {
  if (pantheonId) {
    return (artifacts as Artifact[]).filter(a => a.pantheonId === pantheonId);
  }
  return artifacts as Artifact[];
}

function resolveArtifact(id: string): Artifact | undefined {
  return (artifacts as Artifact[]).find(a => a.id === id || a.slug === id);
}

function resolveStories(pantheonId?: string): Story[] {
  if (pantheonId) {
    return (stories as Story[]).filter(s => s.pantheonId === pantheonId);
  }
  return stories as Story[];
}

function resolveStory(id: string): Story | undefined {
  return (stories as Story[]).find(s => s.id === id || s.slug === id);
}

function resolveDeityRelationships(deityId: string): Relationship[] {
  return (relationships as Relationship[]).filter(
    r => r.fromDeityId === deityId || r.toDeityId === deityId
  );
}

function resolveAllRelationships(pantheonId?: string): Relationship[] {
  if (pantheonId) {
    const pantheonDeityIds = (deities as Deity[])
      .filter(d => d.pantheonId === pantheonId)
      .map(d => d.id);
    return (relationships as Relationship[]).filter(
      r => pantheonDeityIds.includes(r.fromDeityId) || pantheonDeityIds.includes(r.toDeityId)
    );
  }
  return relationships as Relationship[];
}

function resolveLocations(pantheonId?: string): Location[] {
  if (pantheonId) {
    return (locations as Location[]).filter(l => l.pantheonId === pantheonId);
  }
  return locations as Location[];
}

function resolveLocation(id: string): Location | undefined {
  return (locations as Location[]).find(l => l.id === id);
}

// Constants for input validation
const MAX_SEARCH_LIMIT = 100;
const MIN_SEARCH_LIMIT = 1;

function resolveSearch(queryStr: string, limit: number = 10) {
  const options = {
    includeScore: true,
    threshold: 0.3, // 0.0 is perfect match, 1.0 is match anything
  };

  const deityFuse = new Fuse(deities as Deity[], {
    ...options,
    keys: [
      { name: 'name', weight: 0.7 },
      { name: 'alternateNames', weight: 0.5 },
      { name: 'domain', weight: 0.4 },
      { name: 'description', weight: 0.2 },
      { name: 'detailedBio', weight: 0.2 },
    ],
  });

  const creatureFuse = new Fuse(creatures as Creature[], {
    ...options,
    keys: [
      { name: 'name', weight: 0.7 },
      { name: 'habitat', weight: 0.5 },
      { name: 'description', weight: 0.3 },
      { name: 'abilities', weight: 0.3 },
    ],
  });

  const artifactFuse = new Fuse(artifacts as Artifact[], {
    ...options,
    keys: [
      { name: 'name', weight: 0.7 },
      { name: 'type', weight: 0.5 },
      { name: 'description', weight: 0.3 },
      { name: 'powers', weight: 0.3 },
    ],
  });

  const pantheonFuse = new Fuse(pantheons as Pantheon[], {
    ...options,
    keys: [
      { name: 'name', weight: 0.7 },
      { name: 'culture', weight: 0.5 },
      { name: 'description', weight: 0.3 },
      { name: 'detailedHistory', weight: 0.2 },
    ],
  });

  const storyFuse = new Fuse(stories as Story[], {
    ...options,
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'summary', weight: 0.3 },
      { name: 'fullNarrative', weight: 0.2 },
      { name: 'moralThemes', weight: 0.3 },
    ],
  });

  const matchedDeities = deityFuse.search(queryStr).map(result => result.item).slice(0, limit);
  const matchedCreatures = creatureFuse.search(queryStr).map(result => result.item).slice(0, limit);
  const matchedArtifacts = artifactFuse.search(queryStr).map(result => result.item).slice(0, limit);
  const matchedPantheons = pantheonFuse.search(queryStr).map(result => result.item).slice(0, limit);
  const matchedStories = storyFuse.search(queryStr).map(result => result.item).slice(0, limit);

  return {
    deities: matchedDeities,
    creatures: matchedCreatures,
    artifacts: matchedArtifacts,
    pantheons: matchedPantheons,
    stories: matchedStories,
  };
}

// Main handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, variables = {} } = body;

    const data: Record<string, unknown> = {};

    // Parse the query to determine what to resolve
    if (query.includes('GetPantheons') || query.includes('pantheons {')) {
      data.pantheons = resolvePantheons();
    }

    if (query.includes('GetDeities') || query.includes('deities(') || query.includes('deities {')) {
      data.deities = resolveDeities(variables.pantheonId as string | undefined);
    }

    if (query.includes('GetDeity') || query.includes('deity(')) {
      const id = variables.id as string;
      if (id) {
        data.deity = resolveDeity(id);
      }
    }

    if (query.includes('GetCreatures') || query.includes('creatures(') || query.includes('creatures {')) {
      data.creatures = resolveCreatures(variables.pantheonId as string | undefined);
    }

    if (query.includes('GetCreature') || query.includes('creature(')) {
      const id = variables.id as string;
      if (id) {
        data.creature = resolveCreature(id);
      }
    }

    if (query.includes('GetArtifacts') || query.includes('artifacts(') || query.includes('artifacts {')) {
      data.artifacts = resolveArtifacts(variables.pantheonId as string | undefined);
    }

    if (query.includes('GetArtifact') || query.includes('artifact(')) {
      const id = variables.id as string;
      if (id) {
        data.artifact = resolveArtifact(id);
      }
    }

    if (query.includes('GetStories') || query.includes('stories(') || query.includes('stories {')) {
      data.stories = resolveStories(variables.pantheonId as string | undefined);
    }

    if (query.includes('GetStory') || query.includes('story(')) {
      const id = variables.id as string;
      if (id) {
        data.story = resolveStory(id);
      }
    }

    if (query.includes('GetDeityRelationships') || query.includes('deityRelationships(')) {
      const deityId = variables.deityId as string;
      if (deityId) {
        data.deityRelationships = resolveDeityRelationships(deityId);
      }
    }

    if (query.includes('GetAllRelationships') || query.includes('allRelationships(')) {
      data.allRelationships = resolveAllRelationships(variables.pantheonId as string | undefined);
    }

    if (query.includes('Search') || query.includes('search(')) {
      const queryStr = variables.query as string;
      // Validate and cap the limit to prevent DoS
      const rawLimit = Number(variables.limit) || 10;
      const limit = Math.min(Math.max(rawLimit, MIN_SEARCH_LIMIT), MAX_SEARCH_LIMIT);
      if (queryStr && typeof queryStr === 'string' && queryStr.length <= 500) {
        data.search = resolveSearch(queryStr.trim(), limit);
      }
    }

    // Handle locations and events
    if (query.includes('GetLocations') || query.includes('locations(') || query.includes('locations {')) {
      data.locations = resolveLocations(variables.pantheonId as string | undefined);
    }

    if (query.includes('GetLocation') || query.includes('location(')) {
      const id = variables.id as string;
      if (id) {
        data.location = resolveLocation(id);
      }
    }

    if (query.includes('events')) {
      data.events = [];
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GraphQL API error:', error);
    return NextResponse.json(
      { errors: [{ message: 'Internal server error' }] },
      { status: 500 }
    );
  }
}

// Handle GET requests for GraphQL playground
export async function GET() {
  return NextResponse.json({
    message: 'Mythos Atlas GraphQL API',
    endpoints: {
      pantheons: 'Query all pantheons',
      deities: 'Query deities, optionally filtered by pantheonId',
      deity: 'Query a single deity by id',
      creatures: 'Query all creatures, optionally filtered by pantheonId',
      creature: 'Query a single creature by id/slug',
      artifacts: 'Query all artifacts, optionally filtered by pantheonId',
      artifact: 'Query a single artifact by id/slug',
      stories: 'Query stories, optionally filtered by pantheonId',
      story: 'Query a single story by id',
      deityRelationships: 'Query relationships for a specific deity',
      allRelationships: 'Query all relationships, optionally filtered by pantheonId',
      search: 'Search across deities, pantheons, and stories',
    },
  });
}
