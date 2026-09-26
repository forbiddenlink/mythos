import type { Deity } from "@/types/Entity";
import type { Relationship } from "@/lib/relationship-quiz";

/**
 * Create a mock deity with sensible defaults
 */
export function createMockDeity(overrides: Partial<Deity> = {}): Deity {
  const id = overrides.id || `deity-${Math.random().toString(36).slice(2)}`;
  return {
    id,
    slug: id,
    name: overrides.name || "Test Deity",
    pantheonId: "greek-pantheon",
    alternateNames: [],
    gender: "male",
    domain: ["sky", "thunder"],
    symbols: ["lightning bolt", "eagle"],
    description: "A test deity for testing purposes",
    importanceRank: 1,
    imageUrl: "/images/test-deity.jpg",
    ...overrides,
  };
}

/**
 * Create a mock relationship
 */
export function createMockRelationship(
  overrides: Partial<Relationship> = {},
): Relationship {
  return {
    id: overrides.id || `rel-${Math.random().toString(36).slice(2)}`,
    fromDeityId: "zeus",
    toDeityId: "athena",
    relationshipType: "parent_of",
    confidenceLevel: "high",
    ...overrides,
  };
}
