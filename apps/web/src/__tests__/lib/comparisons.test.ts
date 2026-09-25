import { describe, expect, it } from "vitest";
import {
  counterpart,
  getComparisonsForDeity,
  getDeityComparison,
  getDeityComparisons,
  getRelatedComparisons,
  getReversedComparisonSlugs,
} from "@/lib/comparisons";

describe("deity comparisons", () => {
  const all = getDeityComparisons();

  it("builds a non-trivial set", () => {
    expect(all.length).toBeGreaterThan(100);
  });

  it("keeps slugs unique and canonically ordered", () => {
    const slugs = all.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const comparison of all) {
      expect(comparison.slug).toBe(
        `${comparison.a.slug}-vs-${comparison.b.slug}`,
      );
      // Canonical order is alphabetical, so a reader can predict the URL.
      expect(
        comparison.a.slug.localeCompare(comparison.b.slug),
      ).toBeLessThanOrEqual(0);
    }
  });

  it("never shadows a static child of /compare", () => {
    const reserved = new Set(["myths", "parallels", "pairs", "mythologies"]);
    for (const comparison of all) {
      expect(reserved.has(comparison.slug)).toBe(false);
      expect(comparison.slug).toContain("-vs-");
    }
  });

  it("never pairs a deity with itself", () => {
    for (const comparison of all) {
      expect(comparison.a.id).not.toBe(comparison.b.id);
    }
  });

  it("justifies every pair from existing data", () => {
    for (const comparison of all) {
      if (comparison.basis.kind === "parallel") {
        expect(comparison.basis.notes.length).toBeGreaterThan(0);
        for (const note of comparison.basis.notes) {
          expect(note.trim().length).toBeGreaterThan(0);
        }
      } else {
        expect(["siblings", "rivals", "parent and child"]).toContain(
          comparison.basis.relation,
        );
        // Kinship only justifies a pairing inside one tradition.
        expect(comparison.sameTradition).toBe(true);
      }
    }
  });

  it("qualifies names that more than one deity carries", () => {
    const romanApollo = all.find((c) => c.slug === "apollo-vs-apollo-roman");
    expect(romanApollo).toBeDefined();
    expect(romanApollo?.a.displayName).not.toBe(romanApollo?.b.displayName);
  });

  it("covers the pairings readers actually search for", () => {
    const slugs = new Set(all.map((c) => c.slug));
    for (const slug of [
      "odin-vs-zeus",
      "jupiter-vs-zeus",
      "hades-vs-zeus",
      "poseidon-vs-zeus",
      "odin-vs-thor",
      "horus-vs-set",
    ]) {
      expect(slugs, `expected ${slug}`).toContain(slug);
    }
  });

  it("computes shared and distinct domains consistently", () => {
    for (const comparison of all.slice(0, 40)) {
      const lower = (values: string[]) => values.map((v) => v.toLowerCase());
      for (const shared of comparison.sharedDomains) {
        expect(lower(comparison.b.domain)).toContain(shared.toLowerCase());
      }
      for (const solo of comparison.distinctDomains.a) {
        expect(lower(comparison.b.domain)).not.toContain(solo.toLowerCase());
      }
      expect(
        comparison.sharedDomains.length + comparison.distinctDomains.a.length,
      ).toBe(comparison.a.domain.length);
    }
  });

  it("looks a comparison up by slug and rejects unknown ones", () => {
    expect(getDeityComparison("odin-vs-zeus")?.slug).toBe("odin-vs-zeus");
    expect(getDeityComparison("not-a-pair")).toBeNull();
    expect(getDeityComparison("")).toBeNull();
  });

  it("relates a comparison only to pairings sharing a deity", () => {
    const comparison = getDeityComparison("odin-vs-zeus");
    expect(comparison).not.toBeNull();
    if (!comparison) return;
    const related = getRelatedComparisons(comparison);
    expect(related.length).toBeGreaterThan(0);
    for (const other of related) {
      expect(other.slug).not.toBe(comparison.slug);
      expect(
        [other.a.id, other.b.id].some((id) => id === "odin" || id === "zeus"),
      ).toBe(true);
    }
  });

  it("maps every pair written in the other order to its canonical slug", () => {
    const reversed = getReversedComparisonSlugs();
    expect(reversed["zeus-vs-odin"]).toBe("odin-vs-zeus");
    expect(reversed["zeus-vs-hades"]).toBe("hades-vs-zeus");
    expect(Object.keys(reversed)).toHaveLength(all.length);

    const canonical = new Set(all.map((c) => c.slug));
    for (const [alias, target] of Object.entries(reversed)) {
      // An alias must never collide with a real page, or the redirect would
      // shadow it and the pair would be unreachable.
      expect(canonical.has(alias)).toBe(false);
      expect(canonical.has(target)).toBe(true);
      expect(alias).not.toBe(target);
    }
  });

  it("lists a deity's own pairings and names the other side", () => {
    const forZeus = getComparisonsForDeity("zeus");
    expect(forZeus.length).toBeGreaterThan(0);
    for (const comparison of forZeus) {
      expect([comparison.a.id, comparison.b.id]).toContain("zeus");
      expect(counterpart(comparison, "zeus").id).not.toBe("zeus");
    }
    expect(getComparisonsForDeity("no-such-deity")).toEqual([]);
  });
});
