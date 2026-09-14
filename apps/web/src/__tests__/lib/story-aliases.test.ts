import { describe, expect, it } from "vitest";
import { canonicalStorySlug, STORY_ALIASES } from "@/lib/story-aliases";

describe("story aliases", () => {
  it("sends duplicate Aztec/Mesoamerican slugs to one canonical story", () => {
    expect(canonicalStorySlug("five-suns-mesoamerican")).toBe("five-suns");
    expect(canonicalStorySlug("birth-huitzilopochtli")).toBe(
      "birth-of-huitzilopochtli",
    );
    expect(canonicalStorySlug("birth-huitzilopochtli-full")).toBe(
      "birth-of-huitzilopochtli",
    );
    expect(canonicalStorySlug("five-suns")).toBe("five-suns");
  });

  it("does not alias unrelated stories", () => {
    expect(Object.keys(STORY_ALIASES).length).toBe(3);
  });
});
