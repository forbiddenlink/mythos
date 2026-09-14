import creatures from "../../data/creatures.json";
import pantheons from "../../data/pantheons.json";
import { CREATURE_ALIASES } from "@/lib/creature-aliases";

const { describe, it, expect } = await import("vitest");

const validPantheonIds = pantheons.map((p: { id: string }) => p.id);

type CreatureRecord = {
  id: string;
  slug: string;
  name: string;
  pantheonId: string;
  description: string;
  habitat: string;
  abilities: string[];
  dangerLevel: number;
  detailedBio?: string;
  primarySources?: Array<{ text?: string; source?: string; date?: string }>;
};

describe("creatures.json data integrity", () => {
  it("should have at least one creature", () => {
    expect(creatures.length).toBeGreaterThan(0);
  });

  it("every creature should have required fields", () => {
    for (const creature of creatures as CreatureRecord[]) {
      expect(creature.id).toBeTruthy();
      expect(creature.name).toBeTruthy();
      expect(creature.slug).toBeTruthy();
      expect(creature.pantheonId).toBeTruthy();
      expect(creature.description).toBeTruthy();
      expect(creature.habitat).toBeTruthy();
      expect(Array.isArray(creature.abilities)).toBe(true);
      expect(creature.abilities.length).toBeGreaterThan(0);
    }
  });

  it("every creature should have a valid pantheonId", () => {
    for (const creature of creatures as CreatureRecord[]) {
      expect(validPantheonIds).toContain(creature.pantheonId);
    }
  });

  it("every creature should have a unique id", () => {
    const ids = creatures.map((c: { id: string }) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every creature should have a unique slug", () => {
    const slugs = creatures.map((c: { slug: string }) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every creature should have a unique name", () => {
    const names = creatures.map((c: { name: string }) => c.name.trim());
    const seen = new Map<string, number>();
    for (const name of names) {
      seen.set(name, (seen.get(name) ?? 0) + 1);
    }
    const duplicates = [...seen.entries()]
      .filter(([, count]) => count > 1)
      .map(([name]) => name);
    expect(duplicates).toEqual([]);
  });

  it("every creature id should match its slug", () => {
    for (const creature of creatures as CreatureRecord[]) {
      expect(creature.id).toBe(creature.slug);
    }
  });

  it("dangerLevel is an integer from 1 to 10", () => {
    for (const creature of creatures as CreatureRecord[]) {
      expect(typeof creature.dangerLevel, creature.id).toBe("number");
      expect(Number.isInteger(creature.dangerLevel), creature.id).toBe(true);
      expect(creature.dangerLevel, creature.id).toBeGreaterThanOrEqual(1);
      expect(creature.dangerLevel, creature.id).toBeLessThanOrEqual(10);
    }
  });

  it("every creature should have a detailedBio", () => {
    for (const creature of creatures as CreatureRecord[]) {
      expect(typeof creature.detailedBio, creature.id).toBe("string");
      expect(
        creature.detailedBio!.trim().length,
        creature.id,
      ).toBeGreaterThanOrEqual(300);
    }
  });

  it("every creature has at least one primary source", () => {
    for (const creature of creatures as CreatureRecord[]) {
      expect(creature.primarySources?.length ?? 0, creature.id).toBeGreaterThan(
        0,
      );
      for (const source of creature.primarySources ?? []) {
        expect(source.source?.trim().length, creature.id).toBeGreaterThan(0);
        expect(source.text?.trim().length, creature.id).toBeGreaterThan(0);
      }
    }
  });

  it("aliased duplicate slugs are not still in the catalog", () => {
    const slugs = new Set(creatures.map((c: { slug: string }) => c.slug));
    for (const [from, to] of Object.entries(CREATURE_ALIASES)) {
      expect(slugs.has(from), from).toBe(false);
      expect(slugs.has(to), to).toBe(true);
    }
  });
});
