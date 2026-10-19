import { describe, expect, it } from "vitest";
import deities from "@/data/deities.json";
import {
  domainCategories,
  domainFilterOptions,
  matchesDomainFilter,
  OTHER_DOMAIN,
  UNCERTAIN_DOMAIN,
} from "@/lib/domain-categories";

describe("domain browsing groups", () => {
  it("combines exact sun aliases and counts each deity once", () => {
    const entries = [
      { pantheonId: "greek", domain: ["sun", "the sun"] },
      { pantheonId: "egyptian", domain: ["the sun"] },
    ];
    expect(domainFilterOptions(entries, "all", "all")).toEqual([["sun", 2]]);
    expect(matchesDomainFilter(entries[0].domain, "the sun")).toBe(true);
    expect(matchesDomainFilter(entries[1].domain, "sun")).toBe(true);
  });

  it("keeps compound and qualified prose out of unqualified groups", () => {
    expect(domainCategories(["love and sexuality"])).toEqual([OTHER_DOMAIN]);
    expect(domainCategories(["the moon (in some tellings)"])).toEqual([
      OTHER_DOMAIN,
    ]);
    expect(matchesDomainFilter(["love and sexuality"], "love")).toBe(false);
    const khors = deities.find((deity) => deity.id === "khors")!;
    const simargl = deities.find((deity) => deity.id === "simargl")!;
    expect(domainCategories(khors.domain)).toEqual([UNCERTAIN_DOMAIN]);
    expect(domainCategories(simargl.domain)).toEqual([UNCERTAIN_DOMAIN]);
    expect(matchesDomainFilter(khors.domain, "sun")).toBe(false);
    expect(matchesDomainFilter(khors.domain, "moon")).toBe(false);
    expect(matchesDomainFilter(simargl.domain, "protection")).toBe(false);
  });

  it("preserves prose-valued historical deep links and their option", () => {
    const phrase = "uncertain; possibly the sun or moon";
    const khors = deities.find((deity) => deity.id === "khors")!;
    expect(matchesDomainFilter(khors.domain, phrase)).toBe(true);
    expect(domainFilterOptions(deities, "all", phrase)).toContainEqual([
      phrase,
      1,
    ]);
    expect(matchesDomainFilter(["autonomy"], "autonomy")).toBe(true);
  });

  it("shows singleton groups within a tradition and keeps a selected empty group", () => {
    const entries = [
      { pantheonId: "greek", domain: ["sun"] },
      { pantheonId: "egyptian", domain: ["the sun", "moon"] },
    ];
    expect(domainFilterOptions(entries, "greek", "moon")).toEqual([
      ["moon", 0],
      ["sun", 1],
    ]);
  });

  it("makes every catalog deity reachable without changing source descriptions", () => {
    const snapshot = JSON.stringify(deities);
    const options = domainFilterOptions(deities, "all", "all");
    expect(options.length).toBeLessThan(80);
    for (const deity of deities) {
      expect(
        options.some(([filter]) => matchesDomainFilter(deity.domain, filter)),
        deity.id,
      ).toBe(true);
    }
    expect(JSON.stringify(deities)).toBe(snapshot);
    expect(domainCategories([])).toEqual([UNCERTAIN_DOMAIN]);
  });
});
