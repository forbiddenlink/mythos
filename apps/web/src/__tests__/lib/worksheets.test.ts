import { describe, expect, it } from "vitest";
import pantheons from "@/data/pantheons.json";
import {
  buildWorksheet,
  getWorksheetSlugs,
  hasWorksheet,
} from "@/lib/data/worksheets";

describe("pantheon worksheets", () => {
  const slugs = getWorksheetSlugs();

  it("exist for the major traditions and never for collections", () => {
    expect(slugs).toEqual(
      expect.arrayContaining(["greek", "norse", "egyptian"]),
    );
    const collections = (
      pantheons as Array<{ slug: string; isCollection?: boolean }>
    )
      .filter((p) => p.isCollection)
      .map((p) => p.slug);
    for (const slug of collections) expect(hasWorksheet(slug)).toBe(false);
    expect(buildWorksheet("no-such-pantheon")).toBeNull();
  });

  it.each(slugs)("%s has a consistent matching exercise and key", (slug) => {
    const sheet = buildWorksheet(slug)!;
    expect(sheet.matching.length).toBeGreaterThanOrEqual(4);
    expect(sheet.roles).toHaveLength(sheet.matching.length);
    const letters = sheet.matching.map((m) => m.letter);
    expect(new Set(letters).size).toBe(letters.length);
    expect(letters.toSorted()).toEqual(sheet.roles.map((r) => r.letter));
    // Every role is distinct, so each name has exactly one right letter.
    expect(new Set(sheet.roles.map((r) => r.role)).size).toBe(
      sheet.roles.length,
    );
  });

  it.each(slugs)("%s fills every family blank from the word bank", (slug) => {
    const sheet = buildWorksheet(slug)!;
    for (const item of sheet.family) {
      expect(item.sentence).toContain("____");
      expect(sheet.wordBank).toContain(item.answer);
    }
    expect(sheet.shortAnswers.length).toBeGreaterThan(0);
  });

  it("is deterministic", () => {
    expect(buildWorksheet("greek")).toEqual(buildWorksheet("greek"));
  });
});
