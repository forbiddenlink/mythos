import { describe, expect, it } from "vitest";
import versions from "@/data/myth-versions.json";
import stories from "@/data/stories.json";
import { getMythVersions, type MythVersions } from "@/lib/myth-versions";

const all = versions as MythVersions[];
const STATES = new Set(["present", "variant", "absent", "lost"]);
const KINDS = new Set(["primary", "later-ancient", "medieval", "modern"]);

describe("myth-versions data", () => {
  it("only targets stories that exist, once each", () => {
    const slugs = new Set(stories.map((s) => s.slug));
    const targets = all.map((v) => v.storySlug);
    expect(targets.filter((s) => !slugs.has(s))).toEqual([]);
    expect(new Set(targets).size).toBe(targets.length);
  });

  it("gives every source a valid cell for every beat and nothing extra", () => {
    for (const v of all) {
      const beatIds = v.beats.map((b) => b.id).sort();
      for (const s of v.sources) {
        expect(Object.keys(s.cells).sort(), `${v.storySlug}/${s.name}`).toEqual(
          beatIds,
        );
        for (const cell of Object.values(s.cells)) {
          expect(STATES.has(cell.state)).toBe(true);
        }
        expect(KINDS.has(s.kind)).toBe(true);
      }
    }
  });

  it("explains every variant in a note", () => {
    for (const v of all)
      for (const s of v.sources)
        for (const [beat, cell] of Object.entries(s.cells))
          if (cell.state === "variant")
            expect(cell.note, `${v.storySlug}/${s.name}/${beat}`).toBeTruthy();
  });

  it("marks at most one familiar reference version per story", () => {
    for (const v of all)
      expect(v.sources.filter((s) => s.reference).length).toBeLessThanOrEqual(
        1,
      );
  });
});

describe("getMythVersions", () => {
  it("orders sources oldest first", () => {
    const osiris = getMythVersions("osiris-myth");
    const years = osiris?.sources.map((s) => s.sortYear) ?? [];
    expect(years).toEqual([...years].sort((a, b) => a - b));
    expect(osiris?.sources[0].name).toBe("Pyramid Texts");
  });

  it("returns null for a story without a matrix", () => {
    expect(getMythVersions("no-such-story")).toBeNull();
  });
});
