import "server-only";

/**
 * Server-only access to the static catalog JSON.
 *
 * Every read of the large catalog files (deities.json is ~830 KB, stories.json
 * ~540 KB) from page code should go through here. The `server-only` import
 * turns an accidental import from a "use client" module into a build error, so
 * the full files can never end up in a browser chunk again. Client components
 * receive slim projections as props (see `./project`) or fetch the cached
 * indexes under `/api/catalog/*`.
 */
import branchingStoriesJson from "@/data/branching-stories.json";
import deitiesJson from "@/data/deities.json";
import heroesJson from "@/data/heroes.json";
import journeysJson from "@/data/journeys.json";
import pantheonsJson from "@/data/pantheons.json";
import relationshipsJson from "@/data/relationships.json";
import sourcesJson from "@/data/sources.json";
import storiesJson from "@/data/stories.json";
import type { BranchingStory } from "@/lib/branching-story";
import { createDeityLookup, type DeityLookup } from "@/lib/deity-reference";
import type { JourneyDetail } from "@/lib/journeys";
import type {
  DeityIndexEntry,
  DeityListItem,
  DeityRecord,
  DeityRef,
  PantheonRecord,
  RelationshipRecord,
  StoryIndexEntry,
  StoryRecord,
  StoryRef,
} from "./types";
import { indexBy, project } from "./project";

const deities = deitiesJson as unknown as readonly DeityRecord[];
const stories = storiesJson as unknown as readonly StoryRecord[];
const pantheons = pantheonsJson as unknown as readonly PantheonRecord[];
const relationships =
  relationshipsJson as unknown as readonly RelationshipRecord[];
const branchingStories =
  branchingStoriesJson as unknown as readonly BranchingStory[];

export interface HeroRecord {
  id: string;
  name: string;
  slug: string;
  pantheonId?: string;
  [key: string]: unknown;
}
const heroes = heroesJson as unknown as readonly HeroRecord[];

const journeys = journeysJson as unknown as readonly JourneyDetail[];

export function getJourneys(): readonly JourneyDetail[] {
  return journeys;
}

export function getDeities(): readonly DeityRecord[] {
  return deities;
}

export function getStories(): readonly StoryRecord[] {
  return stories;
}

export function getPantheons(): readonly PantheonRecord[] {
  return pantheons;
}

/**
 * Pantheon records that are traditions in their own right. Collection
 * records (`isCollection: true`, e.g. the African overview that groups the
 * Yoruba and Akan entries) are navigation aids, not an additional tradition.
 */
export function getTraditions(): readonly PantheonRecord[] {
  return pantheons.filter((p) => !p.isCollection);
}

/** How many traditions the atlas covers; use this in copy, never a literal. */
export function getTraditionCount(): number {
  return getTraditions().length;
}

export function getRelationships(): readonly RelationshipRecord[] {
  return relationships;
}

export function getBranchingStories(): readonly BranchingStory[] {
  return branchingStories;
}

export function getHeroes(): readonly HeroRecord[] {
  return heroes;
}

let deityLookup: DeityLookup<DeityRecord> | null = null;

/** Resolve an id, slug or alternate name (any casing/diacritics) to a deity. */
export function findDeity(reference: string): DeityRecord | undefined {
  deityLookup ??= createDeityLookup(deities);
  return deityLookup.find(reference);
}

/** Catalog-backed lookup helpers (slug/name/path/distinct) over every deity. */
export function getDeityLookup(): DeityLookup<DeityRecord> {
  deityLookup ??= createDeityLookup(deities);
  return deityLookup;
}

let deityById: Map<string, DeityRecord> | null = null;
export function getDeityById(id: string): DeityRecord | undefined {
  deityById ??= indexBy(deities, (d) => d.id);
  return deityById.get(id);
}

let pantheonById: Map<string, PantheonRecord> | null = null;
export function getPantheonById(id: string): PantheonRecord | undefined {
  pantheonById ??= indexBy(pantheons, (p) => p.id);
  return pantheonById.get(id);
}

/** id / name / slug / pantheonId for every deity: enough for links and labels. */
export function getDeityRefs(): DeityRef[] {
  return project(deities, ["id", "name", "slug", "pantheonId"]);
}

/** id / title / slug / pantheonId for every story. */
export function getStoryRefs(): StoryRef[] {
  return project(stories, ["id", "title", "slug", "pantheonId"]);
}

export const DEITY_LIST_FIELDS = [
  "id",
  "name",
  "slug",
  "pantheonId",
  "gender",
  "domain",
  "symbols",
  "description",
  "importanceRank",
  "imageUrl",
  "alternateNames",
] as const satisfies readonly (keyof DeityListItem)[];

/** Card/table/filter fields for every deity (no biographies or sources). */
export function getDeityListItems(): DeityListItem[] {
  return project(deities, DEITY_LIST_FIELDS);
}

/** Pantheon id → display name without the " Pantheon" suffix ("Greek"). */
export function getPantheonShortNames(): Record<string, string> {
  return Object.fromEntries(
    pantheons.map((p) => [p.id, p.name.replace(" Pantheon", "")]),
  );
}

export interface ResolvedParallelRef {
  pantheonId: string;
  deityId: string;
  note: string;
  /** The other deity's page; absent when the reference is dangling or self. */
  related?: { name: string; slug: string };
}

/** A deity's cross-pantheon parallels with the target deity resolved. */
export function resolveParallelRefs(
  deity: Pick<DeityRecord, "id" | "crossPantheonParallels">,
): ResolvedParallelRef[] | undefined {
  const lookup = getDeityLookup();
  return deity.crossPantheonParallels?.map((parallel) => {
    const related = lookup.distinct(deity.id, parallel.deityId);
    return related
      ? { ...parallel, related: { name: related.name, slug: related.slug } }
      : { ...parallel };
  });
}

export interface SourceWorkSummary {
  id: string;
  title: string;
  author?: string;
  type: string;
  description: string;
}

/** Title-level metadata for every primary source work (no passages). */
export function getSourceWorks(): SourceWorkSummary[] {
  return (sourcesJson as unknown as SourceWorkSummary[]).map((source) => ({
    id: source.id,
    title: source.title,
    ...(source.author ? { author: source.author } : {}),
    type: source.type,
    description: source.description,
  }));
}

/** Rows served by `/api/catalog/deities`. */
export function getDeityIndex(): DeityIndexEntry[] {
  return project(deities, [
    "id",
    "name",
    "slug",
    "pantheonId",
    "domain",
    "symbols",
    "alternateNames",
    "description",
    "originStory",
    "pronunciation",
  ]);
}

/** Rows served by `/api/catalog/stories`. */
export function getStoryIndex(): StoryIndexEntry[] {
  return project(stories, ["id", "title", "slug", "pantheonId", "category"]);
}
