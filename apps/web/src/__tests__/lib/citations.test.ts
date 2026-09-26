import { describe, expect, it } from "vitest";
import {
  citationsFromHits,
  dedupePrimarySources,
  formatPrimarySource,
  isSitePath,
  parseOracleSourcesPayload,
  primarySourcesFromRecord,
} from "@/lib/oracle/citations";

describe("oracle citation extraction", () => {
  it("builds entity citations with site paths, de-duplicated", () => {
    const hit = {
      type: "deity" as const,
      id: "zeus",
      slug: "zeus",
      title: "Zeus",
      subtitle: "Greek Deity",
      matchScore: 1,
    };
    expect(citationsFromHits([hit, hit])).toEqual([
      { type: "deity", slug: "zeus", title: "Zeus", path: "/deities/zeus" },
    ]);
  });

  it("pulls title + locator from excerpts, story citations and plain primary sources", () => {
    const sources = primarySourcesFromRecord(
      {
        primarySourceExcerpts: [
          {
            source: "Hesiod, Theogony",
            sourceId: "theogony",
            lineNumbers: "116-138",
          },
          { source: "Unknown Scroll", sourceId: "not-a-page" },
        ],
        citationSources: [
          {
            title: "Library",
            author: "Apollodorus",
            book: "1.2.1",
            type: "primary",
          },
          { title: "Early Greek Myth", author: "Gantz", type: "secondary" },
        ],
        primarySources: [{ source: "Homer, Iliad 5" }, "Ovid, Metamorphoses"],
      },
      new Set(["theogony"]),
    );
    expect(sources).toEqual([
      {
        title: "Hesiod, Theogony",
        locator: "116–138",
        path: "/sources/theogony",
      },
      { title: "Unknown Scroll", locator: undefined, path: undefined },
      { title: "Apollodorus, Library", locator: "1.2.1" },
      { title: "Homer, Iliad 5" },
      { title: "Ovid, Metamorphoses" },
    ]);
    expect(formatPrimarySource(sources[0]!)).toBe("Hesiod, Theogony 116–138");
  });

  it("dedupes, preferring located entries over bare titles", () => {
    expect(
      dedupePrimarySources([
        { title: "Hesiod, Theogony" },
        { title: "Hesiod, Theogony", locator: "71–73" },
        { title: "hesiod, theogony", locator: "71–73" },
        { title: "Homer, Iliad" },
      ]),
    ).toEqual([
      { title: "Hesiod, Theogony", locator: "71–73" },
      { title: "Homer, Iliad" },
    ]);
  });

  it("caps the number of primary sources", () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ title: `Work ${i}` }));
    expect(dedupePrimarySources(many, 3)).toHaveLength(3);
  });
});

describe("parseOracleSourcesPayload", () => {
  it("accepts a well-formed payload", () => {
    const payload = {
      hitCount: 2,
      entities: [
        { type: "deity", slug: "zeus", title: "Zeus", path: "/deities/zeus" },
      ],
      primarySources: [
        {
          title: "Hesiod, Theogony",
          locator: "71–73",
          path: "/sources/theogony",
        },
      ],
    };
    expect(parseOracleSourcesPayload(payload)).toEqual(payload);
  });

  it("drops off-site links and malformed rows", () => {
    expect(
      parseOracleSourcesPayload({
        hitCount: "3",
        entities: [
          {
            type: "deity",
            slug: "x",
            title: "X",
            path: "https://evil.example",
          },
          { type: "deity", slug: "y", title: "Y", path: "//evil.example" },
          { nope: true },
        ],
        primarySources: [{ title: "T", path: "javascript:alert(1)" }, 5],
      }),
    ).toEqual({
      hitCount: 0,
      entities: [],
      primarySources: [{ title: "T", locator: undefined, path: undefined }],
    });
  });

  it("returns null for non-objects", () => {
    expect(parseOracleSourcesPayload("garbage")).toBeNull();
    expect(parseOracleSourcesPayload(null)).toBeNull();
  });

  it("recognises same-site paths only", () => {
    expect(isSitePath("/deities/zeus")).toBe(true);
    expect(isSitePath("//evil.example")).toBe(false);
    expect(isSitePath("https://evil.example")).toBe(false);
    expect(isSitePath(undefined)).toBe(false);
  });
});
