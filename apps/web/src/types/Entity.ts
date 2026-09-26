export type EntityType =
  "deity" | "creature" | "artifact" | "story" | "location" | "pantheon";

export interface BaseEntity {
  id: string;
  name: string; // or title for stories
  slug: string;
  description?: string;
  imageUrl?: string;
  pantheonId?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string; // e.g., "Greek Pantheon" or "Monster"
  href: string;
  type: EntityType;
  icon?: string; // identifier for icon component
}

/**
 * Optional structured link from a free-text citation to a work in
 * `sources.json`. Mirrors `SourceReferenceFields` in `src/lib/schemas.ts`.
 */
export interface SourceReference {
  /** `id` of a record in `src/data/sources.json`. */
  sourceId?: string;
  /** Book, chapter, line, or section within that work. */
  locator?: string;
}

/** A quoted or paraphrased passage attached to an entity. */
export interface PrimarySource extends SourceReference {
  text: string;
  /** Human-readable citation label (always present, even with `sourceId`). */
  source: string;
  date?: string;
}

// Specific schemas for data files
export interface Creature extends BaseEntity {
  habitat: string;
  abilities: string[];
  dangerLevel: number; // 1-10
  detailedBio?: string;
  primarySources?: PrimarySource[];
}

export interface Artifact extends BaseEntity {
  /** Deity or hero id of the owner, when the owner has an entry. */
  ownerId?: string;
  /** Catalog `ownerId` belongs to; set whenever `ownerId` is. */
  ownerKind?: "deity" | "hero";
  /** Display text for owners with no entry, or a fuller owner description. */
  ownerLabel?: string;
  originStory?: string;
  origin?: string;
  powers: string[];
  detailedBio?: string;
  primarySources?: PrimarySource[];
}

export interface Pronunciation {
  ipa: string;
  phonetic: string;
  audioUrl?: string;
}

export interface Deity extends BaseEntity {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  alternateNames: string[];
  gender: "male" | "female" | "other";
  domain: string[];
  symbols: string[];
  description: string;
  detailedBio?: string;
  originStory?: string;
  importanceRank: number;
  imageUrl?: string;
  pronunciation?: Pronunciation;
  traditionRole?: string;
  crossPantheonParallels?: Array<{
    pantheonId: string;
    deityId: string;
    note: string;
  }>;
  /** Parallels whose counterpart is a hero in heroes.json rather than a deity. */
  heroParallels?: Array<{
    pantheonId: string;
    heroId: string;
    note: string;
  }>;
  primarySources?: PrimarySource[];
  worship?: {
    temples?: string[];
    festivals?: string[];
    practices?: string;
  };
  /** Optional editorial bibliography lines (plain text) shown on the deity page. */
  sources?: string[];
}

export interface MythVariant extends SourceReference {
  source: string;
  passage?: string;
  sourceUrl?: string;
  translator?: string;
  date?: string;
  difference: string;
  note?: string;
}

export interface Story extends BaseEntity {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary: string;
  fullNarrative: string;
  keyExcerpts: string;
  category: string;
  moralThemes: string[];
  culturalSignificance: string;
  imageUrl?: string;
  citationSources?: Array<
    SourceReference & {
      title: string;
      url?: string;
      author?: string;
      lines?: string;
      book?: string;
      chapters?: string;
      chapter?: string;
      type?: string;
    }
  >;
  featuredDeities?: string[];
  featuredLocations?: string[];
  relatedStories?: string[];
  variants?: MythVariant[];
  /** Optional editorial bibliography lines (plain text) shown on the story page. */
  sources?: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  xp: number;
  icon: string;
  category?: "discovery" | "mastery" | "streak" | "exploration";
}

export interface UserProgress {
  deitiesViewed: string[];
  storiesRead: string[];
  pantheonsExplored: string[];
  locationsVisited: string[];
  quizScores: Record<string, number>;
  achievements: string[];
  dailyStreak: number;
  lastVisit: string;
  totalXP: number;
}

/**
 * How an entity image was made (mirrors `ImageProvenanceKindSchema`).
 * Resolve per entity with `getImageProvenance` from `src/lib/image-provenance.ts`.
 */
export type ImageProvenanceKind =
  "illustration-ai" | "illustration-procedural" | "public-domain" | "licensed";

/**
 * How a location relates to the map (mirrors `LocationGeographySchema`):
 * a real place, a mythic place pinned to a traditional identification, or a
 * realm with no terrestrial coordinates.
 */
export type LocationGeography = "physical" | "identified" | "mythic";

export interface MythLocation extends BaseEntity {
  locationType: string;
  pantheonId: string;
  /** null when `geography` is "mythic". */
  latitude: number | null;
  longitude: number | null;
  geography: LocationGeography;
  coordinateNote?: string;
  detailedBio?: string;
  primarySources?: PrimarySource[];
}

/**
 * Canonical stored relationship types (mirrors `RELATIONSHIP_TYPES` in
 * `src/lib/schemas.ts`). Read as "fromDeity <type> toDeity".
 */
export type RelationshipType =
  | "parent_of"
  | "sibling_of"
  | "spouse_of"
  | "lover_of"
  | "ally_of"
  | "enemy_of"
  | "aspect_of";

export interface Relationship {
  id: string;
  fromDeityId: string;
  toDeityId: string;
  relationshipType: RelationshipType;
  confidenceLevel: "high" | "medium" | "low";
  description?: string;
  storyContext?: string;
  isDisputed?: boolean;
}

/** Which catalog a journey's `heroId` points into. */
export type JourneyHeroKind = "hero" | "deity";

export interface JourneySummary {
  id: string;
  /** Id in heroes.json when `heroKind` is "hero", deities.json when "deity". */
  heroId: string;
  heroKind: JourneyHeroKind;
  heroName: string;
  title: string;
  slug: string;
  pantheonId: string;
  imageUrl?: string;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  pantheonId: string;
  locations: string[];
}

export interface Pantheon extends BaseEntity {
  id: string;
  name: string;
  slug: string;
  culture: string;
  region: string;
  timePeriodStart?: number | null;
  timePeriodEnd?: number | null;
  description: string;
  detailedHistory?: string;
  citationSources?: Array<
    SourceReference & {
      title: string;
      author?: string;
      date?: string;
      type?: string;
    }
  >;
  imageUrl?: string;
  figuresLabel?: string;
  /**
   * A regional collection page rather than a pantheon: it groups figures from
   * several unrelated peoples and may have no deities or stories of its own.
   */
  isCollection?: boolean;
}
