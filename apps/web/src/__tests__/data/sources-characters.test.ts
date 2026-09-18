import sources from "../../data/sources.json";
import deities from "../../data/deities.json";
import heroes from "../../data/heroes.json";

const { describe, it, expect } = await import("vitest");

const validDeityIds = new Set(deities.map((d: { id: string }) => d.id));
const validHeroIds = new Set(heroes.map((h: { id: string }) => h.id));

interface SourceCharacter {
  id: string;
  kind: "deity" | "hero";
  role: string;
  where: string;
}

describe("sources.json characters data integrity", () => {
  it("every source id is unique", () => {
    const ids = sources.map((s: { id: string }) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every characters[].id resolves to a real deity or hero", () => {
    for (const source of sources as Array<{
      id: string;
      characters?: SourceCharacter[];
    }>) {
      for (const character of source.characters ?? []) {
        const set = character.kind === "hero" ? validHeroIds : validDeityIds;
        expect(
          set.has(character.id),
          `${source.id} -> ${character.id} (${character.kind})`,
        ).toBe(true);
        expect(
          character.role.length,
          `${source.id} -> ${character.id}`,
        ).toBeGreaterThan(0);
        expect(
          character.where.length,
          `${source.id} -> ${character.id}`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("every keyScenes entry has a title, where, and summary", () => {
    for (const source of sources as Array<{
      id: string;
      keyScenes?: Array<{ title: string; where: string; summary: string }>;
    }>) {
      for (const scene of source.keyScenes ?? []) {
        expect(scene.title.length, source.id).toBeGreaterThan(0);
        expect(scene.where.length, source.id).toBeGreaterThan(0);
        expect(scene.summary.length, source.id).toBeGreaterThan(0);
      }
    }
  });

  it("the key epics named in the brief carry characters, keyScenes, and readingOrder", () => {
    const expected = [
      "iliad",
      "odyssey",
      "aeneid",
      "theogony",
      "metamorphoses",
      "poetic-edda",
      "prose-edda",
      "mahabharata",
      "ramayana",
      "epic-of-gilgamesh",
      "tain-bo-cuailnge",
      "enuma-elish",
      "book-of-the-dead",
      "pyramid-texts",
      "popol-vuh",
      "kojiki",
      "nihon-shoki",
      "rigveda",
      "works-and-days",
      "homeric-hymns",
      "library-apollodorus",
    ];
    const byId = new Map(sources.map((s: { id: string }) => [s.id, s]));
    for (const id of expected) {
      const source = byId.get(id) as
        | {
            characters?: unknown[];
            keyScenes?: unknown[];
            readingOrder?: string;
          }
        | undefined;
      expect(source, id).toBeTruthy();
      expect(source!.characters?.length ?? 0, id).toBeGreaterThan(0);
      expect(source!.keyScenes?.length ?? 0, id).toBeGreaterThan(0);
      expect(typeof source!.readingOrder, id).toBe("string");
    }
  });

  it("Achilles appears in both the Iliad and the Odyssey (Book 11)", () => {
    const iliad = sources.find((s) => s.id === "iliad") as
      | { characters?: SourceCharacter[] }
      | undefined;
    const odyssey = sources.find((s) => s.id === "odyssey") as
      | { characters?: SourceCharacter[] }
      | undefined;
    const inIliad = iliad?.characters?.some((c) => c.id === "achilles");
    const inOdyssey = odyssey?.characters?.find((c) => c.id === "achilles");
    expect(inIliad).toBe(true);
    expect(inOdyssey).toBeTruthy();
    expect(inOdyssey?.where).toMatch(/11/);
  });
});
