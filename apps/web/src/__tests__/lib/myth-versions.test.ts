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
    expect(osiris?.sources[0].name).toBe("Pyramid Texts (selected utterances)");
  });

  it("returns null for a story without a matrix", () => {
    expect(getMythVersions("no-such-story")).toBeNull();
  });

  it("scopes the checked Osiris and Valmiki columns to named editions", () => {
    const osiris = getMythVersions("osiris-myth");
    const hymn = osiris?.sources.find((s) => s.name.startsWith("Great Hymn"));
    expect(hymn?.work).toContain("Miriam Lichtheim translation (1976)");
    expect(hymn?.cells.murder.note).toMatch(/does not narrate/);
    expect(hymn?.cells.search.note).toMatch(/plumage/);
    expect(hymn?.cells.conception.note).toMatch(/weary one's inertness/);

    const contendings = osiris?.sources.find((s) =>
      s.name.startsWith("The Contendings"),
    );
    expect(contendings?.work).toContain("Alan H. Gardiner translation (1931)");
    expect(contendings?.readingUrl).toContain("chesterbeatty.ie");
    expect(contendings?.cells.rule.note).toMatch(/West/);
    expect(contendings?.cells.contest.note).toMatch(/eighty years/);
    expect(contendings?.cells.contest.note).toMatch(/White Crown/);

    const valmiki = getMythVersions("ramayana")?.sources.find((s) =>
      s.name.startsWith("Valmiki"),
    );
    expect(valmiki?.work).toContain("Griffith");
    expect(valmiki?.readingUrl).toBe(
      "https://sacred-texts.com/hin/rama/index.htm",
    );
    expect(valmiki?.cells.abduction.note).toMatch(/Canto XLIX/);
    expect(valmiki?.cells.banishment.note).toMatch(/Uttara Kanda/);
    expect(valmiki?.cells.banishment.note).toMatch(/Canto CXXX/);

    const ramayana = getMythVersions("ramayana");
    const kamba = ramayana?.sources.find((s) => s.name.startsWith("Kamba"));
    expect(kamba?.work).toContain("Mudaliar");
    expect(kamba?.cells.abduction.note).toMatch(/hut/);
    expect(kamba?.cells.abduction.note).not.toMatch(/earth she stands on/);
    expect(kamba?.cells.banishment.state).toBe("absent");

    const adhyatma = ramayana?.sources.find((s) =>
      s.name.startsWith("Adhyatma"),
    );
    expect(adhyatma?.work).toContain("Baij Nath");
    expect(adhyatma?.readingUrl).toBe(
      "https://archive.org/details/TheAdhyatmaRamayana",
    );
    expect(adhyatma?.cells.abduction.note).toMatch(/chapter VII/);
    expect(adhyatma?.cells.banishment.note).toMatch(/Uttara Kanda/);

    const tulsi = ramayana?.sources.find((s) => s.name.startsWith("Tulsidas"));
    expect(tulsi?.work).toContain("Growse");
    expect(tulsi?.cells.abduction.note).toMatch(/doha 19/);
    expect(tulsi?.cells.hanuman.note).toMatch(/doha 8/);
    expect(tulsi?.cells.war.note).toMatch(/thirty-one shafts/);
    expect(tulsi?.cells.ordeal.note).toMatch(/dohas 105/);
    expect(tulsi?.cells.banishment.note).toMatch(/Kakabhushundi/);
  });
});
