import { describe, it, expect } from 'vitest';
import {
  getDeityRelationships,
  getTopRelatedDeities,
  areRelated,
  getRelationshipBetween,
  RELATIONSHIP_LABELS,
} from '@/lib/relationships';

// Mirror of the module's internal priority map for testing sort order
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

describe('relationships', () => {
  describe('RELATIONSHIP_LABELS', () => {
    it('should have labels for all known relationship types', () => {
      expect(RELATIONSHIP_LABELS['parent_of']).toBe('Parent');
      expect(RELATIONSHIP_LABELS['child_of']).toBe('Child');
      expect(RELATIONSHIP_LABELS['sibling_of']).toBe('Sibling');
      expect(RELATIONSHIP_LABELS['spouse_of']).toBe('Spouse');
      expect(RELATIONSHIP_LABELS['ally_of']).toBe('Ally');
      expect(RELATIONSHIP_LABELS['enemy_of']).toBe('Rival');
      expect(RELATIONSHIP_LABELS['lover']).toBe('Lover');
      expect(RELATIONSHIP_LABELS['aspect_of']).toBe('Aspect');
    });
  });

  describe('getDeityRelationships', () => {
    it('should return an array of RelatedDeity objects', () => {
      const result = getDeityRelationships('zeus');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      for (const rel of result) {
        expect(rel).toHaveProperty('deityId');
        expect(rel).toHaveProperty('relationshipType');
        expect(rel).toHaveProperty('label');
        expect(rel).toHaveProperty('direction');
        expect(['from', 'to']).toContain(rel.direction);
      }
    });

    it('should return outgoing relationships with direction "to"', () => {
      // Zeus → Hera (spouse_of) exists in the data
      const result = getDeityRelationships('zeus');
      const heraRel = result.find(
        (r) => r.deityId === 'hera' && r.relationshipType === 'spouse_of'
      );
      expect(heraRel).toBeDefined();
      expect(heraRel?.direction).toBe('to');
    });

    it('should return incoming relationships with inverted type and direction "from"', () => {
      // Zeus → Hera (spouse_of) in data, so from Hera's perspective it's also spouse_of (symmetric)
      const result = getDeityRelationships('hera');
      const zeusRel = result.find(
        (r) => r.deityId === 'zeus' && r.relationshipType === 'spouse_of'
      );
      expect(zeusRel).toBeDefined();
      expect(zeusRel?.direction).toBe('from');
    });

    it('should invert parent_of to child_of for incoming relationships', () => {
      // If Zeus is parent_of Athena, then from Athena's perspective it should be child_of Zeus
      const zeusRels = getDeityRelationships('zeus');
      const athenaAsChild = zeusRels.find(
        (r) => r.deityId === 'athena' && r.relationshipType === 'parent_of'
      );

      if (athenaAsChild) {
        const athenaRels = getDeityRelationships('athena');
        const zeusAsParent = athenaRels.find(
          (r) => r.deityId === 'zeus' && r.relationshipType === 'child_of'
        );
        expect(zeusAsParent).toBeDefined();
        expect(zeusAsParent?.label).toBe('Child');
      }
    });

    it('should sort results by priority (family > allies > enemies)', () => {
      const result = getDeityRelationships('zeus');
      if (result.length >= 2) {
        for (let i = 1; i < result.length; i++) {
          const prevPriority = RELATIONSHIP_PRIORITY[result[i - 1].relationshipType] ?? 99;
          const currPriority = RELATIONSHIP_PRIORITY[result[i].relationshipType] ?? 99;
          expect(prevPriority).toBeLessThanOrEqual(currPriority);
        }
      }
    });

    it('should return empty array for deity with no relationships', () => {
      const result = getDeityRelationships('nonexistent-deity-12345');
      expect(result).toEqual([]);
    });

    it('should include a label for each relationship', () => {
      const result = getDeityRelationships('zeus');
      for (const rel of result) {
        expect(typeof rel.label).toBe('string');
        expect(rel.label.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getTopRelatedDeities', () => {
    it('should return at most the specified count', () => {
      const result = getTopRelatedDeities('zeus', 3);
      expect(result.length).toBeLessThanOrEqual(3);
    });

    it('should default to count of 6', () => {
      const result = getTopRelatedDeities('zeus');
      expect(result.length).toBeLessThanOrEqual(6);
    });

    it('should not contain duplicate deities', () => {
      const result = getTopRelatedDeities('zeus', 10);
      const ids = result.map((r) => r.deityId);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should return empty array for nonexistent deity', () => {
      const result = getTopRelatedDeities('nonexistent-deity-12345');
      expect(result).toEqual([]);
    });

    it('should prioritize family relationships', () => {
      const result = getTopRelatedDeities('zeus', 20);
      if (result.length >= 2) {
        // The first results should have lower priority numbers (family)
        const firstPriority = RELATIONSHIP_PRIORITY[result[0].relationshipType] ?? 99;
        const lastPriority = RELATIONSHIP_PRIORITY[result.at(-1)!.relationshipType] ?? 99;
        expect(firstPriority).toBeLessThanOrEqual(lastPriority);
      }
    });
  });

  describe('areRelated', () => {
    it('should return true for directly related deities', () => {
      // Zeus and Hera are related (spouse_of)
      expect(areRelated('zeus', 'hera')).toBe(true);
    });

    it('should return true regardless of direction', () => {
      expect(areRelated('zeus', 'hera')).toBe(true);
      expect(areRelated('hera', 'zeus')).toBe(true);
    });

    it('should return false for unrelated deities', () => {
      expect(areRelated('nonexistent1', 'nonexistent2')).toBe(false);
    });

    it('should return false when one deity does not exist', () => {
      expect(areRelated('zeus', 'nonexistent-deity-12345')).toBe(false);
    });
  });

  describe('getRelationshipBetween', () => {
    it('should return the relationship type for related deities', () => {
      const result = getRelationshipBetween('zeus', 'hera');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should find relationship regardless of argument order', () => {
      const forward = getRelationshipBetween('zeus', 'hera');
      const reverse = getRelationshipBetween('hera', 'zeus');
      // Both should find the same relationship entry
      expect(forward).toBeTruthy();
      expect(reverse).toBeTruthy();
    });

    it('should return null for unrelated deities', () => {
      expect(getRelationshipBetween('nonexistent1', 'nonexistent2')).toBeNull();
    });

    it('should return null when one deity does not exist', () => {
      expect(getRelationshipBetween('zeus', 'nonexistent-deity-12345')).toBeNull();
    });
  });
});
