import heroes from "../../data/heroes.json";
import pantheons from "../../data/pantheons.json";
import deities from "../../data/deities.json";

const { describe, it, expect } = await import("vitest");

const validPantheonIds = pantheons.map((p: { id: string }) => p.id);
const validDeityIds = new Set(deities.map((d: { id: string }) => d.id));
const validHeroIds = new Set(heroes.map((h: { id: string }) => h.id));

describe("heroes.json data integrity", () => {
  it("should have at least one hero", () => {
    expect(heroes.length).toBeGreaterThan(0);
  });

  it("every hero should have required fields", () => {
    for (const hero of heroes) {
      expect(hero.id).toBeTruthy();
      expect(hero.name).toBeTruthy();
      expect(hero.slug).toBeTruthy();
      expect(hero.pantheonId).toBeTruthy();
      expect(hero.description).toBeTruthy();
      expect(typeof hero.detailedBio).toBe("string");
      expect(hero.detailedBio.length).toBeGreaterThan(0);
      expect(typeof hero.fate).toBe("string");
      expect(hero.fate.length).toBeGreaterThan(0);
      expect(Array.isArray(hero.keyDeeds)).toBe(true);
      expect(hero.keyDeeds.length).toBeGreaterThan(0);
    }
  });

  it("every hero should have a valid pantheonId", () => {
    for (const hero of heroes) {
      expect(validPantheonIds).toContain(hero.pantheonId);
    }
  });

  it("every hero should have a unique id", () => {
    const ids = heroes.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every hero should have a unique slug", () => {
    const slugs = heroes.map((h) => h.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every hero id should match its slug", () => {
    for (const hero of heroes) {
      expect(hero.id).toBe(hero.slug);
    }
  });

  it("should not duplicate a deity already present in deities.json", () => {
    for (const hero of heroes) {
      expect(validDeityIds.has(hero.id), hero.id).toBe(false);
    }
  });

  it("parentage.divineParentId, when present, resolves to a real deity", () => {
    for (const hero of heroes) {
      const divineParentId = hero.parentage?.divineParentId;
      if (divineParentId) {
        expect(validDeityIds.has(divineParentId), hero.id).toBe(true);
      }
    }
  });

  it("relatedDeityIds, when present, resolve to real deities", () => {
    for (const hero of heroes) {
      for (const id of hero.relatedDeityIds ?? []) {
        expect(validDeityIds.has(id), `${hero.id} -> ${id}`).toBe(true);
      }
    }
  });

  it("crossPantheonParallels, when present, resolve to a real hero or deity", () => {
    for (const hero of heroes) {
      for (const parallel of hero.crossPantheonParallels ?? []) {
        expect(validPantheonIds, hero.id).toContain(parallel.pantheonId);
        const set = parallel.kind === "hero" ? validHeroIds : validDeityIds;
        expect(set.has(parallel.refId), `${hero.id} -> ${parallel.refId}`).toBe(
          true,
        );
      }
    }
  });

  it("every primary source, when present, has non-empty text and source", () => {
    for (const hero of heroes) {
      for (const source of hero.primarySources ?? []) {
        expect(source.text.length, hero.id).toBeGreaterThan(0);
        expect(source.source.length, hero.id).toBeGreaterThan(0);
      }
    }
  });
});
