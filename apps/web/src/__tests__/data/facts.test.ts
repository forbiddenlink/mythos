import facts from "../../data/mythology-facts.json";
import deities from "../../data/deities.json";

const { describe, it, expect } = await import("vitest");

const deityIds = new Set(
  (deities as Array<{ id: string; slug: string }>).flatMap((d) => [
    d.id,
    d.slug,
  ]),
);

const VALID_CATEGORIES = new Set([
  "connections",
  "language",
  "science",
  "origins",
  "symbolism",
  "stories",
  "misconceptions",
  "history",
]);

type FactRecord = {
  id: string;
  fact: string;
  category: string;
  relatedDeities: string[];
};

describe("mythology-facts.json data integrity", () => {
  it("should contain at least 40 facts", () => {
    expect(facts.length).toBeGreaterThanOrEqual(40);
  });

  it("every fact should have required fields", () => {
    for (const fact of facts as FactRecord[]) {
      expect(fact.id).toBeTruthy();
      expect(fact.fact).toBeTruthy();
      expect(fact.category).toBeTruthy();
      expect(Array.isArray(fact.relatedDeities)).toBe(true);
    }
  });

  it("every fact id should be unique", () => {
    const ids = (facts as FactRecord[]).map((f) => f.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("every fact category should be valid", () => {
    for (const fact of facts as FactRecord[]) {
      expect(VALID_CATEGORIES.has(fact.category)).toBe(true);
    }
  });

  it("every related deity should resolve to a valid deity in deities.json", () => {
    for (const fact of facts as FactRecord[]) {
      for (const deityId of fact.relatedDeities) {
        expect(
          deityIds.has(deityId),
          `Fact "${fact.id}" references unknown deity "${deityId}"`,
        ).toBe(true);
      }
    }
  });

  it("every fact text should have substantial length", () => {
    for (const fact of facts as FactRecord[]) {
      expect(fact.fact.trim().length).toBeGreaterThanOrEqual(30);
    }
  });
});
