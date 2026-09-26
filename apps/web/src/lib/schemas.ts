/**
 * Zod schemas for data validation
 *
 * These schemas validate the JSON data files at runtime,
 * catching malformed data early and providing type safety.
 */

import { z } from "zod";

const JsonObjectSchema = z.record(z.string(), z.unknown());

/**
 * Optional structured link from a free-text citation to a work in
 * `sources.json`. `source` stays the human-readable label; `sourceId` names
 * the catalog record and `locator` the book, line, or chapter within it.
 */
const SourceReferenceFields = {
  sourceId: z.string().optional(),
  locator: z.string().optional(),
};

const CitationSourceSchema = z.looseObject({
  title: z.string(),
  url: z.url({ protocol: /^https?$/ }).optional(),
  author: z.string().optional(),
  date: z.string().optional(),
  type: z.string().optional(),
  lines: z.string().optional(),
  book: z.string().optional(),
  chapter: z.string().optional(),
  chapters: z.string().optional(),
  ...SourceReferenceFields,
});

const PrimarySourceExcerptSchema = z.looseObject({
  text: z.string(),
  translation: z.string(),
  source: z.string(),
  sourceId: z.string().optional(),
  lineNumbers: z.string().optional(),
  translator: z.string().optional(),
  originalLanguage: z.string().optional(),
  quoteStatus: z.enum([
    "direct-quotation",
    "editorial-paraphrase",
    "unverified",
  ]),
  verification: z.enum([
    "verified",
    "source-and-locator-verified",
    "not-verified",
  ]),
  sourceUrl: z.url({ protocol: /^https?$/ }),
  edition: z.string().min(1),
});

export const PrimarySourceSchema = z.looseObject({
  text: z.string(),
  source: z.string(),
  date: z.string().optional(),
  ...SourceReferenceFields,
});

export type PrimarySource = z.infer<typeof PrimarySourceSchema>;

const MythVariantSchema = z.looseObject({
  source: z.string(),
  passage: z.string().optional(),
  sourceUrl: z.url({ protocol: /^https?$/ }).optional(),
  translator: z.string().optional(),
  date: z.string().optional(),
  difference: z.string(),
  note: z.string().optional(),
  ...SourceReferenceFields,
});

// ═══════════════════════════════════════════════════════════════════
// PRONUNCIATION
// ═══════════════════════════════════════════════════════════════════

export const PronunciationSchema = z.object({
  ipa: z.string(),
  phonetic: z.string(),
  audioUrl: z.string().optional(),
});

export type Pronunciation = z.infer<typeof PronunciationSchema>;

// ═══════════════════════════════════════════════════════════════════
// PANTHEON
// ═══════════════════════════════════════════════════════════════════

export const PantheonSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  culture: z.string(),
  region: z.string(),
  timePeriodStart: z.number().nullable(),
  timePeriodEnd: z.number().nullable(),
  description: z.string(),
  detailedHistory: z.string().optional(),
  citationSources: z.array(CitationSourceSchema).optional(),
});

export type Pantheon = z.infer<typeof PantheonSchema>;

// ═══════════════════════════════════════════════════════════════════
// DEITY
// ═══════════════════════════════════════════════════════════════════

export const DeitySchema = z.looseObject({
  id: z.string(),
  pantheonId: z.string(),
  name: z.string(),
  slug: z.string(),
  alternateNames: z.array(z.string()).optional(),
  gender: z.string(),
  domain: z.array(z.string()),
  symbols: z.array(z.string()),
  description: z.string(),
  detailedBio: z.string().optional(),
  originStory: z.string().optional(),
  pronunciation: PronunciationSchema.optional(),
  importanceRank: z.number(),
  imageUrl: z.string().optional(),
  originalLanguageName: z
    .looseObject({
      text: z.string(),
      language: z.string(),
      transliteration: z.string().optional(),
      meaning: z.string().optional(),
    })
    .optional(),
  crossPantheonParallels: z
    .array(
      z.looseObject({
        pantheonId: z.string(),
        deityId: z.string(),
        note: z.string(),
      }),
    )
    .optional(),
  /** Parallels whose counterpart is a hero in heroes.json, not a deity. */
  heroParallels: z
    .array(
      z.looseObject({
        pantheonId: z.string(),
        heroId: z.string(),
        note: z.string(),
      }),
    )
    .optional(),
  primarySources: z.array(PrimarySourceSchema).optional(),
  primarySourceExcerpts: z.array(PrimarySourceExcerptSchema).optional(),
  furtherReading: z.array(JsonObjectSchema).optional(),
  worship: z
    .looseObject({
      temples: z.array(z.string()).optional(),
      festivals: z.array(z.string()).optional(),
      practices: z.union([z.string(), z.array(z.string())]).optional(),
    })
    .optional(),
});

export type Deity = z.infer<typeof DeitySchema>;

// ═══════════════════════════════════════════════════════════════════
// STORY
// ═══════════════════════════════════════════════════════════════════

export const StorySchema = z.looseObject({
  id: z.string(),
  pantheonId: z.string(),
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  fullNarrative: z.string().optional(),
  keyExcerpts: z.string().optional(),
  category: z.string(),
  moralThemes: z.array(z.string()).optional(),
  culturalSignificance: z.string().optional(),
  citationSources: z.array(CitationSourceSchema).optional(),
  featuredDeities: z.array(z.string()).optional(),
  featuredLocations: z.array(z.string()).optional(),
  relatedStories: z.array(z.string()).optional(),
  variants: z.array(MythVariantSchema).optional(),
  primarySourceExcerpts: z.array(PrimarySourceExcerptSchema).optional(),
  furtherReading: z.array(JsonObjectSchema).optional(),
  imageUrl: z.string().optional(),
});

export type Story = z.infer<typeof StorySchema>;

// ═══════════════════════════════════════════════════════════════════
// CREATURE
// ═══════════════════════════════════════════════════════════════════

export const CreatureSchema = z.looseObject({
  id: z.string(),
  pantheonId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  habitat: z.string(),
  abilities: z.array(z.string()),
  dangerLevel: z.number().min(1).max(10),
  imageUrl: z.string().optional(),
  detailedBio: z.string().optional(),
  primarySources: z.array(PrimarySourceSchema).optional(),
});

export type Creature = z.infer<typeof CreatureSchema>;

// ═══════════════════════════════════════════════════════════════════
// ARTIFACT
// ═══════════════════════════════════════════════════════════════════

export const ArtifactSchema = z.looseObject({
  id: z.string(),
  pantheonId: z.string(),
  name: z.string(),
  slug: z.string(),
  /** Deity or hero id of the owner, when the owner has an entry. */
  ownerId: z.string().optional(),
  /** Catalog `ownerId` belongs to; required whenever `ownerId` is set. */
  ownerKind: z.enum(["deity", "hero"]).optional(),
  /**
   * Display text for owners with no entity (e.g. "King Arthur") or a fuller
   * description of an entity owner (e.g. "Set and other Egyptian deities").
   */
  ownerLabel: z.string().optional(),
  type: z.string(),
  description: z.string(),
  powers: z.array(z.string()),
  originStory: z.string().optional(),
  origin: z.string().optional(),
  imageUrl: z.string().optional(),
  detailedBio: z.string().optional(),
  primarySources: z.array(PrimarySourceSchema).optional(),
});

export type Artifact = z.infer<typeof ArtifactSchema>;

// ═══════════════════════════════════════════════════════════════════
// LOCATION
// ═══════════════════════════════════════════════════════════════════

/**
 * - `physical`: a real place; coordinates mark it.
 * - `identified`: a mythic place with a traditional or ancient real-world
 *   identification (Circe's island at Monte Circeo); coordinates mark that
 *   identification, not proof of the myth.
 * - `mythic`: a realm or conceptual place with no terrestrial location
 *   (Asgard, the Duat); latitude and longitude are null.
 */
export const LocationGeographySchema = z.enum([
  "physical",
  "identified",
  "mythic",
]);

export type LocationGeography = z.infer<typeof LocationGeographySchema>;

export const LocationSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  locationType: z.string(),
  pantheonId: z.string(),
  description: z.string(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  geography: LocationGeographySchema,
  /** Why the coordinates point where they do, for identified places. */
  coordinateNote: z.string().optional(),
  imageUrl: z.string().optional(),
  detailedBio: z.string().optional(),
  primarySources: z.array(PrimarySourceSchema).optional(),
});

export type Location = z.infer<typeof LocationSchema>;

// ═══════════════════════════════════════════════════════════════════
// RELATIONSHIP
// ═══════════════════════════════════════════════════════════════════

/**
 * Stored relationship types, always read "from <type> to": `parent_of`
 * means fromDeity is the parent of toDeity. There is no stored `child_of`;
 * the inverse is derived at read time (see `src/lib/relationships.ts`).
 */
export const RELATIONSHIP_TYPES = [
  "parent_of",
  "sibling_of",
  "spouse_of",
  "lover_of",
  "ally_of",
  "enemy_of",
  "aspect_of",
] as const;

export const RelationshipTypeSchema = z.enum(RELATIONSHIP_TYPES);

export type RelationshipType = z.infer<typeof RelationshipTypeSchema>;

export const RelationshipSchema = z.looseObject({
  id: z.string(),
  fromDeityId: z.string(),
  toDeityId: z.string(),
  relationshipType: RelationshipTypeSchema,
  confidenceLevel: z.enum(["high", "medium", "low"]),
  description: z.string().optional(),
  storyContext: z.string().optional(),
  isDisputed: z.boolean().optional(),
});

export type Relationship = z.infer<typeof RelationshipSchema>;

// ═══════════════════════════════════════════════════════════════════
// JOURNEY
// ═══════════════════════════════════════════════════════════════════

/**
 * A journey's protagonist is usually a hero in heroes.json, but a few epic
 * travellers (Gilgamesh, the Hero Twins, Maui) are catalogued as deities and
 * heroes.json deliberately never duplicates a deity. `heroKind` says which
 * catalog `heroId` belongs to.
 */
export const JourneyHeroKindSchema = z.enum(["hero", "deity"]);

export type JourneyHeroKind = z.infer<typeof JourneyHeroKindSchema>;

export const JourneySchema = z.looseObject({
  id: z.string(),
  heroId: z.string(),
  heroKind: JourneyHeroKindSchema,
  heroName: z.string(),
  title: z.string(),
  slug: z.string(),
  pantheonId: z.string(),
  imageUrl: z.string().optional(),
});

export type Journey = z.infer<typeof JourneySchema>;

// ═══════════════════════════════════════════════════════════════════
// IMAGE PROVENANCE (src/data/image-provenance.json)
// ═══════════════════════════════════════════════════════════════════

/**
 * How an entity image was made. Only the illustration kinds occur today;
 * the others exist so a future sourced image can be recorded honestly.
 */
export const ImageProvenanceKindSchema = z.enum([
  "illustration-ai",
  "illustration-procedural",
  "public-domain",
  "licensed",
]);

export type ImageProvenanceKind = z.infer<typeof ImageProvenanceKindSchema>;

export const ImageGeneratorSchema = z.looseObject({
  kind: ImageProvenanceKindSchema,
  label: z.string(),
  description: z.string(),
  license: z.string().optional(),
  source: z.string().optional(),
  scripts: z.array(z.string()).optional(),
});

export const IMAGE_ENTITY_TYPES = [
  "deity",
  "hero",
  "creature",
  "artifact",
  "location",
  "story",
  "pantheon",
  "journey",
] as const;

export type ImageEntityType = (typeof IMAGE_ENTITY_TYPES)[number];

/**
 * Central provenance map: `entities[type][id]` names a key in `generators`.
 * Kept out of the entity records so 600+ entries share a handful of
 * descriptions; regenerate with `scripts/build_image_provenance.py`.
 */
export const ImageProvenanceFileSchema = z.looseObject({
  generators: z.record(z.string(), ImageGeneratorSchema),
  entities: z.record(
    z.enum(IMAGE_ENTITY_TYPES),
    z.record(z.string(), z.string()),
  ),
});

// ═══════════════════════════════════════════════════════════════════
// ARRAY VALIDATORS (for validating entire data files)
// ═══════════════════════════════════════════════════════════════════

export const PantheonsArraySchema = z.array(PantheonSchema);
export const DeitiesArraySchema = z.array(DeitySchema);
export const StoriesArraySchema = z.array(StorySchema);
export const CreaturesArraySchema = z.array(CreatureSchema);
export const ArtifactsArraySchema = z.array(ArtifactSchema);
export const LocationsArraySchema = z.array(LocationSchema);
export const RelationshipsArraySchema = z.array(RelationshipSchema);
export const JourneysArraySchema = z.array(JourneySchema);

// ═══════════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Safely parse data with a schema, returning the data if valid or throwing
 * a descriptive error if invalid.
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  entityName: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues
      .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
      .join("\n");
    throw new Error(`Invalid ${entityName} data:\n${errors}`);
  }
  return result.data;
}

/**
 * Validate data without throwing, returning a result object.
 */
export function safeValidateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
