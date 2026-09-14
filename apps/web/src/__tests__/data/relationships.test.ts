import relationships from "../../data/relationships.json";
import deities from "../../data/deities.json";
import pantheons from "../../data/pantheons.json";

const { describe, it, expect } = await import("vitest");

const validDeityIds = deities.map((d: { id: string }) => d.id);

const validRelationshipTypes = [
  "parent_of",
  "child_of",
  "sibling_of",
  "spouse_of",
  "ally_of",
  "enemy_of",
  "aspect_of",
  "lover",
  "deity",
];

const validConfidenceLevels = ["high", "medium", "low"];

describe("relationships.json data integrity", () => {
  it("should have at least one relationship", () => {
    expect(relationships.length).toBeGreaterThan(0);
  });

  it("every relationship should have required fields", () => {
    for (const rel of relationships) {
      expect(rel.id).toBeTruthy();
      expect(rel.fromDeityId).toBeTruthy();
      expect(rel.toDeityId).toBeTruthy();
      expect(rel.relationshipType).toBeTruthy();
      expect(rel.confidenceLevel).toBeTruthy();
    }
  });

  it("every relationship should have a unique id", () => {
    const ids = relationships.map((r: { id: string }) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("every relationship should have a valid relationshipType", () => {
    for (const rel of relationships) {
      expect(validRelationshipTypes).toContain(rel.relationshipType);
    }
  });

  it("every relationship should have a valid confidenceLevel", () => {
    for (const rel of relationships) {
      expect(validConfidenceLevels).toContain(rel.confidenceLevel);
    }
  });

  it("fromDeityId should not equal toDeityId", () => {
    for (const rel of relationships) {
      expect(rel.fromDeityId).not.toBe(rel.toDeityId);
    }
  });

  it("description should be a string when present", () => {
    for (const rel of relationships) {
      if ("description" in rel && rel.description !== undefined) {
        expect(typeof rel.description).toBe("string");
        expect(rel.description.length).toBeGreaterThan(0);
      }
    }
  });

  describe("referential integrity", () => {
    it("fromDeityId should reference an existing deity", () => {
      const missingFromDeities: string[] = [];
      for (const rel of relationships) {
        if (!validDeityIds.includes(rel.fromDeityId)) {
          missingFromDeities.push(
            `${rel.id}: fromDeityId "${rel.fromDeityId}" not found`,
          );
        }
      }
      expect(missingFromDeities).toEqual([]);
    });

    it("toDeityId should reference an existing deity", () => {
      const missingToDeities: string[] = [];
      for (const rel of relationships) {
        if (!validDeityIds.includes(rel.toDeityId)) {
          missingToDeities.push(
            `${rel.id}: toDeityId "${rel.toDeityId}" not found`,
          );
        }
      }
      expect(missingToDeities).toEqual([]);
    });
  });

  it("every rank-1 deity appears in the family graph", () => {
    const inGraph = new Set<string>();
    for (const rel of relationships) {
      inGraph.add(rel.fromDeityId);
      inGraph.add(rel.toDeityId);
    }
    const missing = deities
      .filter(
        (d: { importanceRank?: number; id: string }) =>
          d.importanceRank === 1 && !inGraph.has(d.id),
      )
      .map((d: { id: string }) => d.id);
    expect(missing).toEqual([]);
  });

  it("every pantheon should have at least four deities in the graph", () => {
    const deityPantheon = new Map(
      deities.map((d: { id: string; pantheonId: string }) => [
        d.id,
        d.pantheonId,
      ]),
    );
    const covered = new Map<string, Set<string>>();
    for (const pantheon of pantheons) {
      covered.set(pantheon.id, new Set());
    }
    for (const rel of relationships) {
      for (const deityId of [rel.fromDeityId, rel.toDeityId]) {
        const pantheonId = deityPantheon.get(deityId);
        if (pantheonId) {
          covered.get(pantheonId)?.add(deityId);
        }
      }
    }
    for (const pantheon of pantheons) {
      expect(
        covered.get(pantheon.id)?.size ?? 0,
        `${pantheon.id} is underrepresented in relationships.json`,
      ).toBeGreaterThanOrEqual(4);
    }
  });
});
