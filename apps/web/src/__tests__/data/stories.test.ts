import stories from "../../data/stories.json";
import pantheons from "../../data/pantheons.json";
import deities from "../../data/deities.json";
import { STORY_ALIASES } from "@/lib/story-aliases";

const { describe, it, expect } = await import("vitest");

const validPantheonIds = pantheons.map((p: { id: string }) => p.id);

const validCategories = [
  "adventure",
  "afterlife",
  "apocalypse",
  "cosmology",
  "creation",
  "death",
  "epic",
  "hero",
  "heroic",
  "legend",
  "myth",
  "origin",
  "quest",
  "rivalry",
  "romance",
  "tragedy",
  "transformation",
  "trickster",
  "war",
];

describe("stories.json data integrity", () => {
  it("uses the featuredDeities field consumed by story pages for deity links", () => {
    const unsupported = stories
      .filter((story) => "featuredDeityIds" in story)
      .map((story) => story.id);
    expect(unsupported).toEqual([]);

    const deityIds = new Set(deities.map((deity) => deity.id));
    for (const story of stories) {
      for (const deityId of story.featuredDeities ?? []) {
        expect(deityIds.has(deityId), `${story.id}: ${deityId}`).toBe(true);
      }
    }
  });

  it("should have at least one story", () => {
    expect(stories.length).toBeGreaterThan(0);
  });

  it("every story should have required fields", () => {
    for (const story of stories) {
      expect(story.id).toBeTruthy();
      expect(story.title).toBeTruthy();
      expect(story.slug).toBeTruthy();
      expect(story.pantheonId).toBeTruthy();
      expect(story.summary).toBeTruthy();
      expect(story.category).toBeTruthy();
    }
  });

  it("every story should have a unique id", () => {
    const ids = stories.map((s: { id: string }) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("every story should have a unique slug", () => {
    const slugs = stories.map((s: { slug: string }) => s.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("every story should have a unique title", () => {
    const titles = stories.map((s: { title: string }) => s.title.trim());
    const seen = new Map<string, number>();
    for (const title of titles) {
      seen.set(title, (seen.get(title) ?? 0) + 1);
    }
    const duplicates = [...seen.entries()]
      .filter(([, count]) => count > 1)
      .map(([title]) => title);
    expect(duplicates).toEqual([]);
  });

  it("every story id should match its slug", () => {
    for (const story of stories) {
      expect(story.id).toBe(story.slug);
    }
  });

  it("every story should have a valid pantheonId", () => {
    for (const story of stories) {
      expect(validPantheonIds).toContain(story.pantheonId);
    }
  });

  it("every story should have a valid category", () => {
    for (const story of stories) {
      expect(validCategories).toContain(story.category);
    }
  });

  it("sources should be a non-empty string array when present", () => {
    for (const story of stories) {
      if ("sources" in story && story.sources !== undefined) {
        expect(Array.isArray(story.sources)).toBe(true);
        expect(story.sources.length).toBeGreaterThan(0);
        for (const line of story.sources) {
          expect(typeof line).toBe("string");
          expect(line.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("moralThemes should be a non-empty array when present", () => {
    for (const story of stories) {
      if ("moralThemes" in story && story.moralThemes !== undefined) {
        expect(Array.isArray(story.moralThemes)).toBe(true);
        expect(story.moralThemes.length).toBeGreaterThan(0);
      }
    }
  });

  it("culturalSignificance should be a non-empty string when present", () => {
    for (const story of stories) {
      if (
        "culturalSignificance" in story &&
        story.culturalSignificance !== undefined
      ) {
        expect(typeof story.culturalSignificance).toBe("string");
        expect(story.culturalSignificance.length).toBeGreaterThan(0);
      }
    }
  });

  it("keyExcerpts should be a non-empty string when present", () => {
    for (const story of stories) {
      if ("keyExcerpts" in story && story.keyExcerpts !== undefined) {
        expect(typeof story.keyExcerpts).toBe("string");
        expect(story.keyExcerpts.length).toBeGreaterThan(0);
      }
    }
  });

  it("citationSources should be a non-empty array when present", () => {
    for (const story of stories) {
      if ("citationSources" in story && story.citationSources !== undefined) {
        expect(Array.isArray(story.citationSources)).toBe(true);
        expect(story.citationSources.length).toBeGreaterThan(0);
        for (const source of story.citationSources) {
          expect(source.title).toBeTruthy();
        }
      }
    }
  });

  it("every pantheon should have at least one story", () => {
    for (const pantheon of pantheons) {
      const pantheonStories = stories.filter(
        (s: { pantheonId: string }) => s.pantheonId === pantheon.id,
      );
      expect(pantheonStories.length).toBeGreaterThan(0);
    }
  });

  it("drops alias slugs from the catalog and keeps the canonical story", () => {
    const slugs = new Set(stories.map((s: { slug: string }) => s.slug));
    for (const [alias, canonical] of Object.entries(STORY_ALIASES)) {
      expect(slugs.has(alias)).toBe(false);
      expect(slugs.has(canonical)).toBe(true);
    }
  });

  it("does not point relatedStories at retired aliases", () => {
    for (const story of stories) {
      for (const related of story.relatedStories ?? []) {
        expect(STORY_ALIASES[related]).toBeUndefined();
      }
    }
  });
});
