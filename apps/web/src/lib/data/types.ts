/**
 * Record shapes for the static catalog, safe to import from client code
 * (types only; no data). The data itself is read through the server-only
 * accessors in `./catalog`.
 */
import type { PrimarySourceExcerpt } from "@/components/sources/SourceExcerpt";
import type { FurtherReadingReference } from "@/components/sources/ReferencesList";
import type { OriginalLanguageNameData } from "@/components/sources/OriginalLanguageName";
import type { Pantheon, Story } from "@/types/Entity";

export interface DeityRecord {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  gender: string;
  domain: string[];
  symbols: string[];
  description: string;
  detailedBio?: string | null;
  originStory?: string | null;
  pronunciation?: { ipa: string; phonetic: string; audioUrl?: string };
  importanceRank: number;
  imageUrl: string;
  alternateNames: string[];
  traditionRole?: string;
  crossPantheonParallels?: Array<{
    pantheonId: string;
    deityId: string;
    note: string;
  }>;
  heroParallels?: Array<{
    pantheonId: string;
    heroId: string;
    note: string;
  }>;
  primarySources?: Array<{ text: string; source: string; date?: string }>;
  primarySourceExcerpts?: PrimarySourceExcerpt[];
  furtherReading?: FurtherReadingReference[];
  sources?: string[];
  originalLanguageName?: OriginalLanguageNameData;
  worship?: {
    temples?: string[];
    festivals?: string[];
    practices?: string;
  };
}

export type StoryRecord = Story & {
  featuredDeityIds?: string[];
};

export type PantheonRecord = Pantheon;

export interface RelationshipRecord {
  id: string;
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
  description?: string | null;
  confidenceLevel?: string;
}

/** Minimal deity reference for links and labels. */
export interface DeityRef {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
}

/** Minimal story reference for links and labels. */
export interface StoryRef {
  id: string;
  title: string;
  slug: string;
  pantheonId: string;
}

/** The fields catalog list views (cards, table, filters) render for a deity. */
export interface DeityListItem {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  gender: string | null;
  domain: string[];
  symbols: string[];
  description: string | null;
  importanceRank: number | null;
  imageUrl: string | null;
  alternateNames: string[];
}

/**
 * One row of `/api/catalog/deities`: the deity fields interaction-time client
 * features (flashcard export, review cards, random discovery) read. Fetched
 * lazily, never bundled.
 */
export interface DeityIndexEntry {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  domain: string[];
  symbols: string[];
  alternateNames: string[];
  description: string;
  originStory?: string | null;
  pronunciation?: { ipa: string; phonetic: string; audioUrl?: string };
}

/** One row of `/api/catalog/stories`. */
export interface StoryIndexEntry {
  id: string;
  title: string;
  slug: string;
  pantheonId: string;
  category?: string;
}
