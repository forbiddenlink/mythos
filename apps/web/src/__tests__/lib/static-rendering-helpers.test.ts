import { describe, expect, it } from "vitest";
import deitiesData from "@/data/deities.json";
import heroesData from "@/data/heroes.json";
import {
  FESTIVALS,
  resolveFestivalDeitySlugs,
} from "@/lib/antiquity-festivals";
import { canonicalEntityPath } from "@/lib/entity-redirects";
import { parseLocaleCookie } from "@/i18n/client-locale";
import storiesData from "@/data/stories.json";
import creaturesData from "@/data/creatures.json";
import artifactsData from "@/data/artifacts.json";
import locationsData from "@/data/locations.json";
import sourcesData from "@/data/sources.json";
import { getSearchIndex } from "@/lib/search";
import { searchIndex, type SearchIndex } from "@/lib/search-engine";

describe("canonicalEntityPath", () => {
  it("redirects deity alternate names and casing to the canonical slug", () => {
    expect(canonicalEntityPath("/deities/Zeus")).toBe("/deities/zeus");
    expect(canonicalEntityPath("/deities/zeus")).toBeNull();
    const alias = deitiesData
      .flatMap((d) => d.alternateNames.map((name) => [name, d.slug] as const))
      .find(
        ([name, slug]) =>
          canonicalEntityPath(`/deities/${encodeURIComponent(name)}`) ===
          `/deities/${slug}`,
      );
    expect(alias).toBeDefined();
  });

  it("redirects hero ids and pantheon ids", () => {
    const hero = heroesData[0];
    expect(canonicalEntityPath(`/heroes/${hero.slug.toUpperCase()}`)).toBe(
      `/heroes/${hero.slug}`,
    );
    expect(canonicalEntityPath("/pantheons/greek-pantheon")).toBe(
      "/pantheons/greek",
    );
    expect(canonicalEntityPath("/pantheons/greek")).toBeNull();
  });

  it("leaves unknown slugs, sub-paths and other sections alone", () => {
    expect(canonicalEntityPath("/deities/not-a-deity")).toBeNull();
    expect(canonicalEntityPath("/deities/zeus/opengraph-image")).toBeNull();
    expect(canonicalEntityPath("/stories/Titanomachy")).toBeNull();
    expect(canonicalEntityPath("/deities/%E0%A4%A")).toBeNull();
  });
});

describe("parseLocaleCookie", () => {
  it("reads a supported locale and ignores anything else", () => {
    expect(parseLocaleCookie("a=1; locale=es; b=2")).toBe("es");
    expect(parseLocaleCookie("locale=xx")).toBeNull();
    expect(parseLocaleCookie("")).toBeNull();
  });
});

describe("resolveFestivalDeitySlugs", () => {
  it("links epithets and parentheticals to catalog deities", () => {
    const slugs = resolveFestivalDeitySlugs(deitiesData);
    expect(slugs.Dionysus).toBe("dionysus");
    expect(slugs["Hermes Chthonios"]).toBe("hermes");
    for (const slug of Object.values(slugs)) {
      expect(deitiesData.some((d) => d.slug === slug)).toBe(true);
    }
    const honored = new Set(FESTIVALS.flatMap((f) => f.honoredDeities));
    for (const name of Object.keys(slugs)) expect(honored.has(name)).toBe(true);
  });
});

describe("search index", () => {
  it("gives the same results as searching the raw catalog records", () => {
    // The fetched (serialized) slim index vs the untouched JSON rows.
    const slim = JSON.parse(JSON.stringify(getSearchIndex())) as SearchIndex;
    const raw = {
      deities: deitiesData,
      stories: storiesData,
      creatures: creaturesData,
      artifacts: artifactsData,
      locations: locationsData,
      heroes: heroesData,
      sources: sourcesData,
    } as unknown as SearchIndex;
    for (const query of [
      "zeus",
      "thunder",
      "underworld",
      "odyssey",
      "dragon",
    ]) {
      expect(searchIndex(slim, query, 15)).toEqual(searchIndex(raw, query, 15));
    }
  });

  it("omits long-form text", () => {
    const serialized = JSON.stringify(getSearchIndex());
    expect(serialized).not.toContain("detailedBio");
    expect(serialized).not.toContain("fullNarrative");
  });
});
