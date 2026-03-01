/**
 * Relationship utilities for deity connections
 */

import relationshipsData from '@/data/relationships.json';

export interface Relationship {
  id: string;
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
  confidenceLevel?: string;
}

const relationships = relationshipsData as Relationship[];

export const RELATIONSHIP_LABELS: Record<string, string> = {
  'parent_of': 'Parent',
  'child_of': 'Child',
  'sibling_of': 'Sibling',
  'spouse_of': 'Spouse',
  'ally_of': 'Ally',
  'enemy_of': 'Rival',
  'lover': 'Lover',
  'aspect_of': 'Aspect',
};

// Priority order for displaying relationships (family > allies > enemies)
const RELATIONSHIP_PRIORITY: Record<string, number> = {
  'parent_of': 1,
  'child_of': 2,
  'sibling_of': 3,
  'spouse_of': 4,
  'lover': 5,
  'ally_of': 6,
  'enemy_of': 7,
  'aspect_of': 8,
};

export interface RelatedDeity {
  deityId: string;
  relationshipType: string;
  label: string;
  direction: 'from' | 'to';
}

/**
 * Get all relationships for a deity
 */
export function getDeityRelationships(deityId: string): RelatedDeity[] {
  const related: RelatedDeity[] = [];

  for (const rel of relationships) {
    if (rel.fromDeityId === deityId) {
      related.push({
        deityId: rel.toDeityId,
        relationshipType: rel.relationshipType,
        label: RELATIONSHIP_LABELS[rel.relationshipType] || rel.relationshipType,
        direction: 'to',
      });
    } else if (rel.toDeityId === deityId) {
      // Invert the relationship type for display
      const invertedType = invertRelationshipType(rel.relationshipType);
      related.push({
        deityId: rel.fromDeityId,
        relationshipType: invertedType,
        label: RELATIONSHIP_LABELS[invertedType] || invertedType,
        direction: 'from',
      });
    }
  }

  // Sort by priority
  return related.sort((a, b) => {
    const priorityA = RELATIONSHIP_PRIORITY[a.relationshipType] ?? 99;
    const priorityB = RELATIONSHIP_PRIORITY[b.relationshipType] ?? 99;
    return priorityA - priorityB;
  });
}

/**
 * Invert relationship type (e.g., parent_of -> child_of)
 */
function invertRelationshipType(type: string): string {
  const inversions: Record<string, string> = {
    'parent_of': 'child_of',
    'child_of': 'parent_of',
    'sibling_of': 'sibling_of',
    'spouse_of': 'spouse_of',
    'ally_of': 'ally_of',
    'enemy_of': 'enemy_of',
    'lover': 'lover',
    'aspect_of': 'aspect_of',
  };
  return inversions[type] || type;
}

/**
 * Get top N related deities, prioritizing family relationships
 * If fewer than N relationships exist, can fill with same-pantheon deities
 */
export function getTopRelatedDeities(
  deityId: string,
  count: number = 6
): RelatedDeity[] {
  const related = getDeityRelationships(deityId);

  // Remove duplicates (same deity might have multiple relationship types)
  const seen = new Set<string>();
  const unique: RelatedDeity[] = [];

  for (const rel of related) {
    if (!seen.has(rel.deityId)) {
      seen.add(rel.deityId);
      unique.push(rel);
    }
  }

  return unique.slice(0, count);
}

/**
 * Check if two deities are related
 */
export function areRelated(deityId1: string, deityId2: string): boolean {
  return relationships.some(
    (rel) =>
      (rel.fromDeityId === deityId1 && rel.toDeityId === deityId2) ||
      (rel.fromDeityId === deityId2 && rel.toDeityId === deityId1)
  );
}

/**
 * Get relationship type between two deities
 */
export function getRelationshipBetween(
  deityId1: string,
  deityId2: string
): string | null {
  const rel = relationships.find(
    (r) =>
      (r.fromDeityId === deityId1 && r.toDeityId === deityId2) ||
      (r.fromDeityId === deityId2 && r.toDeityId === deityId1)
  );
  return rel?.relationshipType || null;
}
