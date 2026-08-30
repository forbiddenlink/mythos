import { describe, it, expect } from "vitest";
import {
  compileKeywordPatterns,
  scoreArchetypeMatch,
  qualifies,
  DOMAIN_WEIGHT,
  SYMBOL_WEIGHT,
  MAX_PROSE_CREDIT,
} from "@/lib/archetype-matching";
import deitiesData from "@/data/deities.json";

interface Deity {
  name: string;
  domain: string[];
  symbols: string[];
  description: string | null;
}

const deities = deitiesData as Deity[];
const byName = (name: string) => {
  const found = deities.find((d) => d.name === name);
  if (!found) throw new Error(`fixture deity missing from data: ${name}`);
  return found;
};

const SOLAR = [
  "sun",
  "light",
  "dawn",
  "prophecy",
  "radiance",
  "truth",
  "healing",
];
const STORM = [
  "sky",
  "thunder",
  "lightning",
  "storm",
  "storms",
  "kingship",
  "sovereignty",
];
const SPRING = [
  "love",
  "beauty",
  "fertility",
  "marriage",
  "spring",
  "desire",
  "motherhood",
];

function score(deityName: string, keywords: string[]): number {
  return scoreArchetypeMatch(
    byName(deityName),
    compileKeywordPatterns(keywords),
  );
}

describe("scoreArchetypeMatch weighting", () => {
  const patterns = compileKeywordPatterns(["thunder"]);

  it("weights a domain hit above a symbol hit above prose", () => {
    const domainHit = scoreArchetypeMatch({ domain: ["thunder"] }, patterns);
    const symbolHit = scoreArchetypeMatch({ symbols: ["thunder"] }, patterns);
    const proseHit = scoreArchetypeMatch(
      { description: "god of thunder" },
      patterns,
    );

    expect(domainHit).toBe(DOMAIN_WEIGHT);
    expect(symbolHit).toBe(SYMBOL_WEIGHT);
    expect(domainHit).toBeGreaterThan(symbolHit);
    expect(symbolHit).toBeGreaterThan(proseHit);
  });

  it("counts each keyword only at its strongest location", () => {
    const both = scoreArchetypeMatch(
      { domain: ["thunder"], symbols: ["thunder"], description: "thunder" },
      patterns,
    );
    expect(both).toBe(DOMAIN_WEIGHT);
  });

  it("caps prose credit so description alone can never qualify a deity", () => {
    const proseOnly = scoreArchetypeMatch(
      { description: "sun light dawn prophecy radiance truth healing" },
      compileKeywordPatterns(SOLAR),
    );

    expect(proseOnly).toBeLessThanOrEqual(MAX_PROSE_CREDIT);
    expect(qualifies(proseOnly)).toBe(false);
  });

  it("tolerates missing/null fields", () => {
    expect(scoreArchetypeMatch({}, patterns)).toBe(0);
    expect(
      scoreArchetypeMatch(
        { domain: null, symbols: null, description: null },
        patterns,
      ),
    ).toBe(0);
  });

  it("treats regex metacharacters in keywords as literal text", () => {
    expect(() => compileKeywordPatterns(["sun (", "a+b", "[x"])).not.toThrow();
    expect(
      scoreArchetypeMatch({ domain: ["a+b"] }, compileKeywordPatterns(["a+b"])),
    ).toBe(DOMAIN_WEIGHT);
  });
});

describe("word-boundary matching (false positives that shipped before)", () => {
  it("does not match 'light' inside 'lightning'", () => {
    const patterns = compileKeywordPatterns(["light"]);
    expect(scoreArchetypeMatch({ domain: ["lightning"] }, patterns)).toBe(0);
  });

  it("does not match 'spring' inside 'offspring'", () => {
    const patterns = compileKeywordPatterns(["spring"]);
    expect(
      scoreArchetypeMatch({ description: "his offspring ruled" }, patterns),
    ).toBe(0);
  });

  it("does not match 'sun' inside 'sunset'", () => {
    const patterns = compileKeywordPatterns(["sun"]);
    expect(scoreArchetypeMatch({ description: "at sunset" }, patterns)).toBe(0);
  });

  it("keeps storm-gods out of the solar archetype", () => {
    // Zeus and Thor previously qualified as solar deities purely because
    // "lightning" contains "light".
    expect(qualifies(score("Zeus", SOLAR))).toBe(false);
    expect(qualifies(score("Thor", SOLAR))).toBe(false);
  });

  it("keeps Thor out of the love/fertility archetype", () => {
    expect(qualifies(score("Thor", SPRING))).toBe(false);
  });
});

describe("archetype rosters against real atlas data", () => {
  it("puts the canonical sky-fathers in the storm archetype", () => {
    for (const name of ["Zeus", "Jupiter", "Thor", "Indra", "Shango"]) {
      expect(qualifies(score(name, STORM))).toBe(true);
    }
  });

  it("puts the canonical solar deities in the solar archetype", () => {
    for (const name of ["Ra", "Amaterasu", "Shamash"]) {
      expect(qualifies(score(name, SOLAR))).toBe(true);
    }
  });

  it("ranks Jupiter above Zeus's brother Poseidon for the storm archetype", () => {
    expect(score("Jupiter", STORM)).toBeGreaterThan(score("Poseidon", STORM));
  });

  it("selects a focused roster, not a third of the atlas", () => {
    const patterns = compileKeywordPatterns(STORM);
    const matched = deities.filter((d) =>
      qualifies(scoreArchetypeMatch(d, patterns)),
    );

    // The substring version returned 58/190 here, including Hades.
    expect(matched.length).toBeGreaterThan(10);
    expect(matched.length).toBeLessThan(deities.length / 4);
    expect(matched.map((d) => d.name)).not.toContain("Hades");
  });
});
