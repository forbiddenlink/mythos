import { describe, expect, it } from "vitest";
import stories from "@/data/stories.json";
import { countWords, readingMinutes } from "@/lib/reading-time";

const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");

describe("reading time", () => {
  it("counts whitespace-separated words and ignores blank text", () => {
    expect(countWords("  one two\n\nthree  ")).toBe(3);
    expect(countWords("   ")).toBe(0);
  });

  it("rounds to whole minutes at 200 words per minute, minimum 1", () => {
    expect(readingMinutes("")).toBe(1);
    expect(readingMinutes(words(299))).toBe(1);
    expect(readingMinutes(words(300))).toBe(2);
    expect(readingMinutes(words(1000))).toBe(5);
  });

  it("gives every story narrative in the catalog a positive estimate", () => {
    for (const story of stories as { fullNarrative?: string }[]) {
      if (story.fullNarrative) {
        expect(readingMinutes(story.fullNarrative)).toBeGreaterThanOrEqual(1);
      }
    }
  });
});
