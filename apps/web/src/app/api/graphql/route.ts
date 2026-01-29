import { NextRequest, NextResponse } from 'next/server';
import pantheons from '@/data/pantheons.json';
import deities from '@/data/deities.json';
import stories from '@/data/stories.json';
import relationships from '@/data/relationships.json';

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
  originStory?: string;
  importanceRank: number;
  imageUrl?: string;
}

interface Story {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary: string;
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

function resolveSearch(queryStr: string, limit: number = 10) {
  const query = queryStr.toLowerCase();

  const matchedDeities = (deities as Deity[])
    .filter(d =>
      d.name.toLowerCase().includes(query) ||
      d.description.toLowerCase().includes(query) ||
      d.domain.some(dom => dom.toLowerCase().includes(query))
    )
    .slice(0, limit);

  const matchedPantheons = (pantheons as Pantheon[])
    .filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.culture.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    )
    .slice(0, limit);

  const matchedStories = (stories as Story[])
    .filter(s =>
      s.title.toLowerCase().includes(query) ||
      s.summary.toLowerCase().includes(query)
    )
    .slice(0, limit);

  return {
    deities: matchedDeities,
    pantheons: matchedPantheons,
    stories: matchedStories,
  };
}

// Main handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, variables = {} } = body;

    let data: Record<string, unknown> = {};

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
      const limit = (variables.limit as number) || 10;
      if (queryStr) {
        data.search = resolveSearch(queryStr, limit);
      }
    }

    // Handle locations and events (return empty for now)
    if (query.includes('locations')) {
      data.locations = [];
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
      stories: 'Query stories, optionally filtered by pantheonId',
      story: 'Query a single story by id',
      deityRelationships: 'Query relationships for a specific deity',
      allRelationships: 'Query all relationships, optionally filtered by pantheonId',
      search: 'Search across deities, pantheons, and stories',
    },
  });
}
