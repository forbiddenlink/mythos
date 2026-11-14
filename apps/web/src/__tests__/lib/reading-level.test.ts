import { describe, expect, it } from "vitest";
import stories from "@/data/stories.json";
import {
  countSyllables,
  fleschKincaidGrade,
  READING_BANDS,
  readingBand,
  toPlainProse,
} from "@/lib/reading-level";

describe("countSyllables", () => {
  it.each([
    ["cat", 1],
    ["the", 1],
    ["serpent", 2],
    ["thunder", 2],
    ["mythology", 4],
    ["make", 1],
    ["", 0],
  ])("%s has %i", (word, expected) => {
    expect(countSyllables(word)).toBe(expected);
  });
});

describe("toPlainProse", () => {
  it("drops headings, emphasis and link targets", () => {
    expect(
      toPlainProse("## Title\nThor met *Loki* at [Asgard](/locations/asgard)."),
    ).toBe("Thor met Loki at Asgard.");
  });
});

describe("fleschKincaidGrade", () => {
  it("rates short plain sentences far below long academic ones", () => {
    const plain = "The cat sat. The dog ran. The sun was hot.";
    const dense =
      "Comparative reconstruction of Indo-European mythological narratives necessarily depends upon methodological assumptions regarding linguistic continuity and cultural transmission.";
    expect(fleschKincaidGrade(plain)).toBeLessThan(2);
    expect(fleschKincaidGrade(dense)).toBeGreaterThan(16);
  });

  it("returns 0 for text with no words", () => {
    expect(fleschKincaidGrade("## Heading only")).toBe(0);
  });

  it("gives every story a finite grade", () => {
    for (const story of stories) {
      expect(Number.isFinite(fleschKincaidGrade(story.fullNarrative))).toBe(
        true,
      );
    }
  });
});

describe("readingBand", () => {
  it.each([
    [4.3, "grades-5-6"],
    [6.99, "grades-5-6"],
    [7, "grades-7-8"],
    [10.5, "grades-9-10"],
    [11, "grades-11-up"],
    [24.6, "grades-11-up"],
  ])("grade %d falls in %s", (grade, id) => {
    expect(readingBand(grade).id).toBe(id);
  });

  it("orders the bands from easiest to hardest", () => {
    const limits = READING_BANDS.map((band) => band.below);
    expect(limits).toEqual([...limits].sort((a, b) => a - b));
  });
});
