import artifacts from "@/data/artifacts.json";
import creatures from "@/data/creatures.json";
import deities from "@/data/deities.json";
import locations from "@/data/locations.json";
import pantheons from "@/data/pantheons.json";
import relationships from "@/data/relationships.json";
import stories from "@/data/stories.json";
import Fuse from "fuse.js";
import { NextRequest, NextResponse } from "next/server";
import type { ZodType } from "zod";
import {
  ArtifactsArraySchema,
  CreaturesArraySchema,
  DeitiesArraySchema,
  LocationsArraySchema,
  PantheonsArraySchema,
  RelationshipsArraySchema,
  StoriesArraySchema,
  safeValidateData,
  type Artifact,
  type Creature,
  type Deity,
  type Location,
  type Pantheon,
  type Relationship,
  type Story,
} from "../../../lib/schemas";

// ═══════════════════════════════════════════════════════════════════
// CACHED FUSE.JS INSTANCES
// Created once at module load time for better performance
// ═══════════════════════════════════════════════════════════════════

const fuseOptions = {
  includeScore: true,
  threshold: 0.3,
};

type GraphQLVariables = Record<string, unknown>;
type GraphQLResponseData = Record<string, unknown>;
type QueryResolver = {
  patterns: string[];
  apply: (data: GraphQLResponseData, variables: GraphQLVariables) => void;
};

function getValidatedDataOrFallback<T>(
  schema: ZodType<T>,
  source: unknown,
  label: string,
): T {
  const result = safeValidateData(schema, source);
  if (result.success) {
    return result.data;
  }

  const issueSummary = result.errors.issues
    .slice(0, 3)
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(" | ");
  console.warn(
    `[graphql-route] Invalid ${label} JSON schema, using raw fallback: ${issueSummary}`,
  );
  return source as T;
}

const pantheonData = getValidatedDataOrFallback(
  PantheonsArraySchema,
  pantheons,
  "pantheons",
);
const deityData = getValidatedDataOrFallback(
  DeitiesArraySchema,
  deities,
  "deities",
);
const storyData = getValidatedDataOrFallback(
  StoriesArraySchema,
  stories,
  "stories",
);
const creatureData = getValidatedDataOrFallback(
  CreaturesArraySchema,
  creatures,
  "creatures",
);
const artifactData = getValidatedDataOrFallback(
  ArtifactsArraySchema,
  artifacts,
  "artifacts",
);
const locationData = getValidatedDataOrFallback(
  LocationsArraySchema,
  locations,
  "locations",
);
const relationshipData = getValidatedDataOrFallback(
  RelationshipsArraySchema,
  relationships,
  "relationships",
);

const deityFuse = new Fuse(deityData, {
  ...fuseOptions,
  keys: [
    { name: "name", weight: 0.7 },
    { name: "alternateNames", weight: 0.5 },
    { name: "domain", weight: 0.4 },
    { name: "description", weight: 0.2 },
    { name: "detailedBio", weight: 0.2 },
  ],
});

const creatureFuse = new Fuse(creatureData, {
  ...fuseOptions,
  keys: [
    { name: "name", weight: 0.7 },
    { name: "habitat", weight: 0.5 },
    { name: "description", weight: 0.3 },
    { name: "abilities", weight: 0.3 },
  ],
});

const artifactFuse = new Fuse(artifactData, {
  ...fuseOptions,
  keys: [
    { name: "name", weight: 0.7 },
    { name: "type", weight: 0.5 },
    { name: "description", weight: 0.3 },
    { name: "powers", weight: 0.3 },
  ],
});

const pantheonFuse = new Fuse(pantheonData, {
  ...fuseOptions,
  keys: [
    { name: "name", weight: 0.7 },
    { name: "culture", weight: 0.5 },
    { name: "description", weight: 0.3 },
    { name: "detailedHistory", weight: 0.2 },
  ],
});

const storyFuse = new Fuse(storyData, {
  ...fuseOptions,
  keys: [
    { name: "title", weight: 0.7 },
    { name: "summary", weight: 0.3 },
    { name: "fullNarrative", weight: 0.2 },
    { name: "moralThemes", weight: 0.3 },
  ],
});

function resolvePantheons(): Pantheon[] {
  return pantheonData;
}

function resolveDeities(pantheonId?: string): Deity[] {
  if (pantheonId) {
    return deityData.filter((deity) => deity.pantheonId === pantheonId);
  }

  return deityData;
}

function resolveDeity(id: string): Deity | undefined {
  return deityData.find((deity) => deity.id === id || deity.slug === id);
}

function resolveCreatures(pantheonId?: string): Creature[] {
  if (pantheonId) {
    return creatureData.filter(
      (creature) => creature.pantheonId === pantheonId,
    );
  }

  return creatureData;
}

function resolveCreature(id: string): Creature | undefined {
  return creatureData.find(
    (creature) => creature.id === id || creature.slug === id,
  );
}

function resolveArtifacts(pantheonId?: string): Artifact[] {
  if (pantheonId) {
    return artifactData.filter(
      (artifact) => artifact.pantheonId === pantheonId,
    );
  }

  return artifactData;
}

function resolveArtifact(id: string): Artifact | undefined {
  return artifactData.find(
    (artifact) => artifact.id === id || artifact.slug === id,
  );
}

function resolveStories(pantheonId?: string): Story[] {
  if (pantheonId) {
    return storyData.filter((story) => story.pantheonId === pantheonId);
  }

  return storyData;
}

function resolveStory(id: string): Story | undefined {
  return storyData.find((story) => story.id === id || story.slug === id);
}

function resolveDeityRelationships(deityId: string): Relationship[] {
  return relationshipData.filter(
    (relationship) =>
      relationship.fromDeityId === deityId ||
      relationship.toDeityId === deityId,
  );
}

function resolveAllRelationships(pantheonId?: string): Relationship[] {
  if (!pantheonId) {
    return relationshipData;
  }

  const pantheonDeityIds = new Set(
    deityData
      .filter((deity) => deity.pantheonId === pantheonId)
      .map((deity) => deity.id),
  );

  return relationshipData.filter(
    (relationship) =>
      pantheonDeityIds.has(relationship.fromDeityId) ||
      pantheonDeityIds.has(relationship.toDeityId),
  );
}

function resolveLocations(pantheonId?: string): Location[] {
  if (pantheonId) {
    return locationData.filter(
      (location) => location.pantheonId === pantheonId,
    );
  }

  return locationData;
}

function resolveLocation(id: string): Location | undefined {
  return locationData.find((location) => location.id === id);
}

const MAX_SEARCH_LIMIT = 100;
const MIN_SEARCH_LIMIT = 1;

function hasQueryPattern(query: string, patterns: string[]): boolean {
  return patterns.some((pattern) => query.includes(pattern));
}

function getStringVariable(
  variables: GraphQLVariables,
  key: string,
): string | undefined {
  const value = variables[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function normalizeVariables(rawVariables: unknown): GraphQLVariables {
  return rawVariables &&
    typeof rawVariables === "object" &&
    !Array.isArray(rawVariables)
    ? (rawVariables as GraphQLVariables)
    : {};
}

function resolveSearch(queryStr: string, limit: number = 10) {
  const matchedDeities = deityFuse
    .search(queryStr)
    .map((result) => result.item)
    .slice(0, limit);
  const matchedCreatures = creatureFuse
    .search(queryStr)
    .map((result) => result.item)
    .slice(0, limit);
  const matchedArtifacts = artifactFuse
    .search(queryStr)
    .map((result) => result.item)
    .slice(0, limit);
  const matchedPantheons = pantheonFuse
    .search(queryStr)
    .map((result) => result.item)
    .slice(0, limit);
  const matchedStories = storyFuse
    .search(queryStr)
    .map((result) => result.item)
    .slice(0, limit);

  return {
    deities: matchedDeities,
    creatures: matchedCreatures,
    artifacts: matchedArtifacts,
    pantheons: matchedPantheons,
    stories: matchedStories,
  };
}

const queryResolvers: QueryResolver[] = [
  {
    patterns: ["GetPantheons", "pantheons {"],
    apply: (data) => {
      data.pantheons = resolvePantheons();
    },
  },
  {
    patterns: ["GetDeities", "deities(", "deities {"],
    apply: (data, variables) => {
      data.deities = resolveDeities(getStringVariable(variables, "pantheonId"));
    },
  },
  {
    patterns: ["GetDeity", "deity("],
    apply: (data, variables) => {
      const id = getStringVariable(variables, "id");
      if (id) {
        data.deity = resolveDeity(id);
      }
    },
  },
  {
    patterns: ["GetCreatures", "creatures(", "creatures {"],
    apply: (data, variables) => {
      data.creatures = resolveCreatures(
        getStringVariable(variables, "pantheonId"),
      );
    },
  },
  {
    patterns: ["GetCreature", "creature("],
    apply: (data, variables) => {
      const id = getStringVariable(variables, "id");
      if (id) {
        data.creature = resolveCreature(id);
      }
    },
  },
  {
    patterns: ["GetArtifacts", "artifacts(", "artifacts {"],
    apply: (data, variables) => {
      data.artifacts = resolveArtifacts(
        getStringVariable(variables, "pantheonId"),
      );
    },
  },
  {
    patterns: ["GetArtifact", "artifact("],
    apply: (data, variables) => {
      const id = getStringVariable(variables, "id");
      if (id) {
        data.artifact = resolveArtifact(id);
      }
    },
  },
  {
    patterns: ["GetStories", "stories(", "stories {"],
    apply: (data, variables) => {
      data.stories = resolveStories(getStringVariable(variables, "pantheonId"));
    },
  },
  {
    patterns: ["GetStory", "story("],
    apply: (data, variables) => {
      const id = getStringVariable(variables, "id");
      if (id) {
        data.story = resolveStory(id);
      }
    },
  },
  {
    patterns: ["GetDeityRelationships", "deityRelationships("],
    apply: (data, variables) => {
      const deityId = getStringVariable(variables, "deityId");
      if (deityId) {
        data.deityRelationships = resolveDeityRelationships(deityId);
      }
    },
  },
  {
    patterns: ["GetAllRelationships", "allRelationships("],
    apply: (data, variables) => {
      data.allRelationships = resolveAllRelationships(
        getStringVariable(variables, "pantheonId"),
      );
    },
  },
  {
    patterns: ["Search", "search("],
    apply: (data, variables) => {
      const queryStr = getStringVariable(variables, "query");
      const rawLimit = Number(variables.limit) || 10;
      const limit = Math.min(
        Math.max(rawLimit, MIN_SEARCH_LIMIT),
        MAX_SEARCH_LIMIT,
      );
      if (queryStr && queryStr.length <= 500) {
        data.search = resolveSearch(queryStr, limit);
      }
    },
  },
  {
    patterns: ["GetLocations", "locations(", "locations {"],
    apply: (data, variables) => {
      data.locations = resolveLocations(
        getStringVariable(variables, "pantheonId"),
      );
    },
  },
  {
    patterns: ["GetLocation", "location("],
    apply: (data, variables) => {
      const id = getStringVariable(variables, "id");
      if (id) {
        data.location = resolveLocation(id);
      }
    },
  },
  {
    patterns: ["events"],
    apply: (data) => {
      data.events = [];
    },
  },
];

function resolveQueryData(
  query: string,
  variables: GraphQLVariables,
): GraphQLResponseData {
  const data: GraphQLResponseData = {};

  for (const resolver of queryResolvers) {
    if (hasQueryPattern(query, resolver.patterns)) {
      resolver.apply(data, variables);
    }
  }

  return data;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = typeof body?.query === "string" ? body.query : "";

    if (!query) {
      return NextResponse.json({
        errors: [{ message: "Invalid GraphQL query" }],
      });
    }

    const variables = normalizeVariables(body?.variables);
    const data = resolveQueryData(query, variables);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GraphQL API error:", error);
    return NextResponse.json(
      { errors: [{ message: "Internal server error" }] },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Mythos Atlas GraphQL API",
    endpoints: {
      pantheons: "Query all pantheons",
      deities: "Query deities, optionally filtered by pantheonId",
      deity: "Query a single deity by id",
      creatures: "Query all creatures, optionally filtered by pantheonId",
      creature: "Query a single creature by id/slug",
      artifacts: "Query all artifacts, optionally filtered by pantheonId",
      artifact: "Query a single artifact by id/slug",
      stories: "Query stories, optionally filtered by pantheonId",
      story: "Query a single story by id",
      deityRelationships: "Query relationships for a specific deity",
      allRelationships:
        "Query all relationships, optionally filtered by pantheonId",
      search: "Search across deities, pantheons, and stories",
    },
  });
}
