import { describe, expect, it } from "vitest";
import deities from "@/data/deities.json";
import relationships from "@/data/relationships.json";
import review from "@/data/relationship-review.json";
import sources from "@/data/sources.json";
import { getDeityRelationships } from "@/lib/relationships";
import {
  DeitiesArraySchema,
  RelationshipEvidenceSchema,
  RelationshipsArraySchema,
} from "@/lib/schemas";

describe("passage-backed relationship review", () => {
  const parsed = RelationshipsArraySchema.parse(relationships);
  const sourceIds = new Set(sources.map((source) => source.id));

  it("requires a source, passage, edition, and usable URL for evidence", () => {
    expect(
      RelationshipEvidenceSchema.safeParse({
        sourceId: "theogony",
        sourceUrl: "https://www.gutenberg.org/files/348/348-h/348-h.htm",
      }).success,
    ).toBe(false);
    for (const relationship of parsed) {
      for (const evidence of relationship.evidence ?? []) {
        expect(sourceIds.has(evidence.sourceId), relationship.id).toBe(true);
        expect(evidence.locator.trim(), relationship.id).not.toBe("");
        expect(evidence.edition.trim(), relationship.id).not.toBe("");
        expect(new URL(evidence.sourceUrl).protocol).toMatch(/^https?:$/);
      }
    }
  });

  it("keeps the explicit 20-entry review connected to passage-backed claims", () => {
    expect(new Set(review.deityIds).size).toBe(20);
    const deityIds = new Set(deities.map((deity) => deity.id));
    const covered = new Set<string>();
    for (const id of review.relationshipIds) {
      const relationship = parsed.find((record) => record.id === id);
      expect(relationship, id).toBeDefined();
      expect(relationship?.evidence?.length, id).toBeGreaterThan(0);
      covered.add(relationship!.fromDeityId);
      covered.add(relationship!.toDeityId);
    }
    for (const id of review.deityIds) {
      expect(deityIds.has(id), id).toBe(true);
      expect(covered.has(id), id).toBe(true);
    }
  });

  it("preserves both attested parents of all six children of Rhea and Cronus", () => {
    expect(DeitiesArraySchema.safeParse(deities).success).toBe(true);
    for (const child of [
      "zeus",
      "hera",
      "poseidon",
      "hades",
      "demeter",
      "hestia",
    ]) {
      const parents = parsed.filter(
        (relationship) =>
          relationship.toDeityId === child &&
          relationship.relationshipType === "parent_of",
      );
      expect(parents.map((parent) => parent.fromDeityId).sort(), child).toEqual(
        ["cronus", "rhea"],
      );
      for (const parent of parents) {
        expect(parent.evidence?.[0].sourceId, child).toBe("theogony");
        expect(parent.evidence?.[0].locator, child).toBe("Theogony 453–491");
      }
      expect(
        getDeityRelationships(child)
          .filter(
            (relationship) => relationship.relationshipType === "child_of",
          )
          .map((relationship) => relationship.deityId)
          .sort(),
        child,
      ).toEqual(["cronus", "rhea"]);
    }
  });

  it("does not treat Hesiod's mother-only Hephaestus account as Zeus paternity evidence", () => {
    expect(
      parsed.find((relationship) => relationship.id === "r13")?.isDisputed,
    ).toBe(true);
    const mother = parsed.find((relationship) => relationship.id === "r15");
    expect(mother?.evidence?.[0].locator).toBe("Theogony 924–929");
    expect(review.relationshipIds).not.toContain("r13");
  });

  it("attributes Athena's intervention with Achilles to the Iliad while flagging unverified wording", () => {
    const athena = DeitiesArraySchema.parse(deities).find(
      (deity) => deity.id === "athena",
    );
    const passage = athena?.primarySources?.find((citation) =>
      citation.text.includes("stay your fury"),
    );
    expect(passage?.sourceId).toBe("iliad");
    expect(passage?.locator).toBe("Book 1, lines 207–211");
    expect(passage?.source).toContain("translation wording unverified");
  });
});
