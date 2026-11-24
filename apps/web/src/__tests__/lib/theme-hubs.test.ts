import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import stories from "@/data/stories.json";
import { THEME_HUBS, getThemeHub, hubStories } from "@/lib/theme-hubs";

const bySlug = new Map(
  (stories as Array<{ slug: string; pantheonId: string }>).map((s) => [
    s.slug,
    s,
  ]),
);

describe("theme hubs", () => {
  it("defines ten hubs with unique slugs", () => {
    expect(THEME_HUBS).toHaveLength(10);
    expect(new Set(THEME_HUBS.map((h) => h.slug)).size).toBe(10);
  });

  it("links only stories that exist in the catalog, with no repeats per hub", () => {
    for (const hub of THEME_HUBS) {
      expect(new Set(hub.stories).size, hub.slug).toBe(hub.stories.length);
      for (const slug of hub.stories) {
        expect(bySlug.has(slug), `${hub.slug}: ${slug}`).toBe(true);
      }
    }
  });

  it("gives every hub enough stories from more than one tradition", () => {
    for (const hub of THEME_HUBS) {
      expect(hub.stories.length, hub.slug).toBeGreaterThanOrEqual(3);
      const traditions = new Set(
        hub.stories.map((s) => bySlug.get(s)?.pantheonId),
      );
      expect(traditions.size, hub.slug).toBeGreaterThanOrEqual(2);
    }
  });

  it("states a hedged claim and never writes an em dash", () => {
    for (const hub of THEME_HUBS) {
      expect(hub.claim.length, hub.slug).toBeGreaterThan(40);
      expect(hub.claim, hub.slug).toMatch(
        /does not claim|not a claim|separate/i,
      );
      expect(JSON.stringify(hub), hub.slug).not.toMatch(/—/);
    }
  });

  it("resolves hub stories in the hub's own order", () => {
    const hub = getThemeHub("flood");
    expect(hub).toBeDefined();
    expect(hubStories(hub!).map((s) => s.slug)).toEqual(hub!.stories);
    expect(getThemeHub("nope")).toBeUndefined();
  });

  it("lists every hub in the sitemap, not the retired index", () => {
    const urls = new Set(sitemap().map((e) => e.url));
    expect(urls).not.toContain("https://mythosatlas.com/themes");
    for (const hub of THEME_HUBS) {
      expect(urls).toContain(`https://mythosatlas.com/themes/${hub.slug}`);
    }
  });
});
