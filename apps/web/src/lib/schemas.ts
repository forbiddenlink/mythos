/**
 * Zod schemas for data validation
 *
 * These schemas validate the JSON data files at runtime,
 * catching malformed data early and providing type safety.
 */

import { z } from 'zod';

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

export const PantheonSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  culture: z.string(),
  region: z.string(),
  timePeriodStart: z.number(),
  timePeriodEnd: z.number(),
  description: z.string(),
  detailedHistory: z.string().optional(),
  citationSources: z.array(z.string()).optional(),
});

export type Pantheon = z.infer<typeof PantheonSchema>;

// ═══════════════════════════════════════════════════════════════════
// DEITY
// ═══════════════════════════════════════════════════════════════════

export const DeitySchema = z.object({
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
  crossPantheonParallels: z.array(z.string()).optional(),
  primarySources: z.array(z.string()).optional(),
  worship: z
    .object({
      temples: z.array(z.string()).optional(),
      festivals: z.array(z.string()).optional(),
      practices: z.array(z.string()).optional(),
    })
    .optional(),
});

export type Deity = z.infer<typeof DeitySchema>;

// ═══════════════════════════════════════════════════════════════════
// STORY
// ═══════════════════════════════════════════════════════════════════

export const StorySchema = z.object({
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
  citationSources: z.array(z.string()).optional(),
  featuredDeities: z.array(z.string()).optional(),
  featuredLocations: z.array(z.string()).optional(),
  relatedStories: z.array(z.string()).optional(),
  variants: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
});

export type Story = z.infer<typeof StorySchema>;

// ═══════════════════════════════════════════════════════════════════
// CREATURE
// ═══════════════════════════════════════════════════════════════════

export const CreatureSchema = z.object({
  id: z.string(),
  pantheonId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  habitat: z.string(),
  abilities: z.array(z.string()),
  dangerLevel: z.number().min(1).max(10),
  imageUrl: z.string().optional(),
});

export type Creature = z.infer<typeof CreatureSchema>;

// ═══════════════════════════════════════════════════════════════════
// ARTIFACT
// ═══════════════════════════════════════════════════════════════════

export const ArtifactSchema = z.object({
  id: z.string(),
  pantheonId: z.string(),
  name: z.string(),
  slug: z.string(),
  ownerId: z.string().optional(),
  type: z.string(),
  description: z.string(),
  powers: z.array(z.string()),
  originStory: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type Artifact = z.infer<typeof ArtifactSchema>;

// ═══════════════════════════════════════════════════════════════════
// LOCATION
// ═══════════════════════════════════════════════════════════════════

export const LocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  locationType: z.string(),
  pantheonId: z.string(),
  description: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  imageUrl: z.string().optional(),
});

export type Location = z.infer<typeof LocationSchema>;

// ═══════════════════════════════════════════════════════════════════
// RELATIONSHIP
// ═══════════════════════════════════════════════════════════════════

export const RelationshipSchema = z.object({
  id: z.string(),
  fromDeityId: z.string(),
  toDeityId: z.string(),
  relationshipType: z.enum([
    'parent',
    'child',
    'spouse',
    'sibling',
    'lover',
    'enemy',
    'ally',
    'offspring',
  ]),
  confidenceLevel: z.enum(['high', 'medium', 'low']),
  description: z.string().optional(),
  storyContext: z.string().optional(),
  isDisputed: z.boolean().optional(),
});

export type Relationship = z.infer<typeof RelationshipSchema>;

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
  entityName: string
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues
      .map((e: z.ZodIssue) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Invalid ${entityName} data:\n${errors}`);
  }
  return result.data;
}

/**
 * Validate data without throwing, returning a result object.
 */
export function safeValidateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
