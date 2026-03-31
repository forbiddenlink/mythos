// ============================================================================
// Hygraph CMS Types
// These types represent the data structure returned by Hygraph API
// ============================================================================

// Base types for pagination and connections
export interface HygraphConnection<T> {
  edges: Array<{ node: T }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
  aggregate: {
    count: number;
  };
}

export interface HygraphPagination {
  first?: number;
  skip?: number;
  after?: string;
  before?: string;
}

// ============================================================================
// Core Content Types
// ============================================================================

export interface HygraphPantheon {
  id: string;
  name: string;
  slug: string;
  culture: string;
  region: string;
  description: string;
  timePeriodStart?: string | number;
  timePeriodEnd?: string | number;
  imageUrl?: string;
  deities?: HygraphDeity[];
}

export interface HygraphPronunciation {
  ipa: string;
  phonetic: string;
  audioUrl?: string;
}

export interface HygraphCrossPantheonParallel {
  pantheonId: string;
  deityId: string;
  note: string;
}

export interface HygraphPrimarySource {
  text: string;
  source: string;
  date?: string;
}

export interface HygraphWorship {
  temples?: string[];
  festivals?: string[];
  practices?: string;
}

export interface HygraphDeity {
  id: string;
  name: string;
  slug: string;
  gender: "male" | "female" | "other";
  domain: string[];
  symbols: string[];
  description: string;
  detailedBio?: string;
  originStory?: string;
  importanceRank: number;
  alternateNames: string[];
  imageUrl?: string;
  pronunciation?: HygraphPronunciation;
  crossPantheonParallels?: HygraphCrossPantheonParallel[];
  primarySources?: HygraphPrimarySource[];
  worship?: HygraphWorship;
  pantheon?: {
    id: string;
    slug: string;
    name: string;
    culture?: string;
  };
}

export interface HygraphCitationSource {
  title: string;
  author?: string;
  lines?: string;
  book?: string;
  chapters?: string;
  chapter?: string;
  type?: string;
}

export interface HygraphMythVariant {
  source: string;
  date?: string;
  difference: string;
  note?: string;
}

export interface HygraphStory {
  id: string;
  title: string;
  slug: string;
  summary: string;
  fullNarrative?: string;
  keyExcerpts?: string;
  category: string;
  moralThemes: string[];
  culturalSignificance?: string;
  imageUrl?: string;
  citationSources?: HygraphCitationSource[];
  featuredDeities?: Array<{ id: string; name: string; slug: string }>;
  featuredLocations?: Array<{ id: string; name: string; slug: string }>;
  relatedStories?: Array<{ id: string; title: string; slug: string }>;
  variants?: HygraphMythVariant[];
  pantheon?: {
    id: string;
    slug: string;
    name: string;
  };
}

export interface HygraphCreature {
  id: string;
  name: string;
  slug: string;
  habitat: string;
  abilities: string[];
  dangerLevel: number;
  description: string;
  imageUrl?: string;
  pantheon?: {
    id: string;
    slug: string;
    name: string;
  };
}

export interface HygraphArtifact {
  id: string;
  name: string;
  slug: string;
  type: string;
  powers: string[];
  description: string;
  originStory?: string;
  imageUrl?: string;
  owner?: {
    id: string;
    name: string;
    slug: string;
  };
  pantheon?: {
    id: string;
    slug: string;
    name: string;
  };
}

export interface HygraphLocation {
  id: string;
  name: string;
  slug: string;
  locationType: string;
  description: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  pantheon?: {
    id: string;
    slug: string;
    name: string;
  };
}

export interface HygraphDeityRelationship {
  id: string;
  relationshipType: string;
  description?: string;
  storyContext?: string;
  confidenceLevel?: number;
  isDisputed?: boolean;
  fromDeity: {
    id: string;
    name: string;
    slug: string;
  };
  toDeity: {
    id: string;
    name: string;
    slug: string;
  };
}

// ============================================================================
// Query Response Types
// ============================================================================

export interface GetDeitiesResponse {
  deities: HygraphDeity[];
  deitiesConnection: {
    aggregate: { count: number };
  };
}

export interface GetDeityBySlugResponse {
  deity: HygraphDeity | null;
}

export interface GetPantheonsResponse {
  pantheons: HygraphPantheon[];
}

export interface GetPantheonBySlugResponse {
  pantheon: HygraphPantheon | null;
}

export interface GetStoriesResponse {
  stories: HygraphStory[];
  storiesConnection: {
    aggregate: { count: number };
  };
}

export interface GetStoryBySlugResponse {
  story: HygraphStory | null;
}

export interface GetCreaturesResponse {
  creatures: HygraphCreature[];
  creaturesConnection: {
    aggregate: { count: number };
  };
}

export interface GetCreatureBySlugResponse {
  creature: HygraphCreature | null;
}

export interface GetArtifactsResponse {
  artifacts: HygraphArtifact[];
  artifactsConnection: {
    aggregate: { count: number };
  };
}

export interface GetArtifactBySlugResponse {
  artifact: HygraphArtifact | null;
}

export interface GetLocationsResponse {
  locations: HygraphLocation[];
  locationsConnection: {
    aggregate: { count: number };
  };
}

export interface GetLocationBySlugResponse {
  location: HygraphLocation | null;
}

export interface GetDeityRelationshipsResponse {
  deityRelationships: HygraphDeityRelationship[];
}

export interface SearchResponse {
  deities: Array<{
    id: string;
    name: string;
    slug: string;
    domain: string[];
    description: string;
    imageUrl?: string;
  }>;
  creatures: Array<{
    id: string;
    name: string;
    slug: string;
    habitat: string;
    description: string;
    imageUrl?: string;
  }>;
  artifacts: Array<{
    id: string;
    name: string;
    slug: string;
    type: string;
    description: string;
    imageUrl?: string;
  }>;
  pantheons: Array<{
    id: string;
    name: string;
    slug: string;
    culture: string;
    description: string;
  }>;
  stories: Array<{
    id: string;
    title: string;
    slug: string;
    summary: string;
  }>;
}
