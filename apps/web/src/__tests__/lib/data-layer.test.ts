import { describe, expect, it } from "vitest";
import deitiesData from "@/data/deities.json";
import storiesData from "@/data/stories.json";
import {
  DEITY_LIST_FIELDS,
  findDeity,
  getDeityIndex,
  getDeityListItems,
  getPantheonShortNames,
  getStoryIndex,
  resolveParallelRefs,
} from "@/lib/data/catalog";
import { indexBy, pick, project } from "@/lib/data/project";
import {
  createDeityLookup,
  formatDeityReference,
  normalizeDeityReference,
} from "@/lib/deity-reference";

describe("projection helpers", () => {
  it("picks listed keys and drops undefined values", () => {
    const row = { id: "a", name: "A", extra: "x", missing: undefined };
    expect(pick(row, ["id", "missing"])).toEqual({ id: "a" });
    expect(project([row, { ...row, id: "b" }], ["id", "name"])).toEqual([
      { id: "a", name: "A" },
      { id: "b", name: "A" },
    ]);
  });

  it("indexes by key keeping the first duplicate", () => {
    const map = indexBy(
      [
        { id: "a", n: 1 },
        { id: "a", n: 2 },
      ],
      (r) => r.id,
    );
    expect(map.get("a")?.n).toBe(1);
  });
});

describe("deity references", () => {
  it("normalizes casing, diacritics and punctuation", () => {
    expect(normalizeDeityReference("  Ódinn (All-Father) ")).toBe(
      "odinn-all-father",
    );
    expect(formatDeityReference("dyaus-pita")).toBe("Dyaus Pita");
  });

  it("resolves ids, slugs and alternate names over an explicit list", () => {
    const lookup = createDeityLookup([
      { id: "zeus", name: "Zeus", slug: "zeus", alternateNames: ["Dias"] },
    ]);
    expect(lookup.find("DIAS")?.id).toBe("zeus");
    expect(lookup.path("dias")).toBe("/deities/zeus");
    expect(lookup.path("Unknown God")).toBe("/deities/unknown-god");
    expect(lookup.name("unknown-god")).toBe("Unknown God");
    expect(lookup.distinct("zeus", "dias")).toBeUndefined();
  });
});

describe("server catalog projections", () => {
  it("list items carry card fields only", () => {
    const items = getDeityListItems();
    expect(items).toHaveLength(deitiesData.length);
    for (const item of items) {
      for (const key of Object.keys(item)) {
        expect(DEITY_LIST_FIELDS).toContain(key);
      }
    }
    expect(items[0]).not.toHaveProperty("detailedBio");
  });

  it("the lazily fetched indexes are a fraction of the source files", () => {
    const deityIndex = JSON.stringify(getDeityIndex());
    const storyIndex = JSON.stringify(getStoryIndex());
    expect(deityIndex.length).toBeLessThan(
      JSON.stringify(deitiesData).length / 3,
    );
    expect(storyIndex.length).toBeLessThan(
      JSON.stringify(storiesData).length / 10,
    );
    expect(deityIndex).not.toContain("detailedBio");
    expect(storyIndex).not.toContain("fullNarrative");
  });

  it("resolves references and parallels against the whole catalog", () => {
    expect(findDeity("Zeus")?.id).toBe("zeus");
    expect(getPantheonShortNames()["greek-pantheon"]).toBe("Greek");
    const zeus = findDeity("zeus");
    const refs = resolveParallelRefs(zeus!);
    expect(refs?.length).toBe(zeus?.crossPantheonParallels?.length);
    expect(refs?.some((ref) => ref.related?.slug)).toBe(true);
  });
});
