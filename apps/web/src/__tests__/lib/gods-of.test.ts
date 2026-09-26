import { describe, expect, it } from "vitest";
import deities from "@/data/deities.json";
import {
  MIN_DEITIES,
  MIN_TRADITIONS,
  domainSlug,
  getGodsOfDomain,
  getGodsOfDomains,
  godsOfFaq,
  godsOfLinksForDomains,
  godsOfTitle,
  normalizeDomain,
} from "@/lib/gods-of";

const byId = new Map(
  (deities as Array<{ id: string; domain?: string[]; pantheonId: string }>).map(
    (d) => [d.id, d],
  ),
);

describe("gods-of domain pages", () => {
  const pages = getGodsOfDomains();

  it("folds only true spelling variants together", () => {
    expect(normalizeDomain("The Sun")).toBe("sun");
    expect(normalizeDomain("Warfare")).toBe("war");
    expect(normalizeDomain("ocean")).toBe("sea");
    expect(normalizeDomain("love")).toBe("love");
    expect(domainSlug("the underworld")).toBe("underworld");
  });

  it("builds a page only when enough deities and traditions share the domain", () => {
    expect(pages.length).toBeGreaterThan(20);
    for (const page of pages) {
      expect(page.deityCount, page.slug).toBeGreaterThanOrEqual(MIN_DEITIES);
      expect(page.traditions.length, page.slug).toBeGreaterThanOrEqual(
        MIN_TRADITIONS,
      );
    }
    expect(new Set(pages.map((p) => p.slug)).size).toBe(pages.length);
  });

  it("lists only deities whose own catalog entry names the domain", () => {
    for (const page of pages) {
      for (const tradition of page.traditions) {
        for (const listed of tradition.deities) {
          const record = byId.get(listed.id);
          expect(record, listed.id).toBeTruthy();
          expect(record?.pantheonId).toBe(tradition.pantheonId);
          const slugs = (record?.domain ?? []).map(domainSlug);
          expect(slugs, `${page.slug}: ${listed.id}`).toContain(page.slug);
        }
      }
    }
  });

  it("covers the headline search domains", () => {
    for (const slug of ["war", "love", "sea", "death", "wisdom", "sun"]) {
      expect(getGodsOfDomain(slug), slug).not.toBeNull();
    }
    expect(godsOfTitle(getGodsOfDomain("war")!)).toBe("Gods of War");
    expect(getGodsOfDomain("war")?.matchedTerms).toEqual(
      expect.arrayContaining(["war", "warfare"]),
    );
  });

  it("answers FAQ questions with the names the page lists", () => {
    const war = getGodsOfDomain("war")!;
    const faq = godsOfFaq(war);
    expect(faq.length).toBeGreaterThan(0);
    for (const [index, entry] of faq.entries()) {
      const tradition = war.traditions[index];
      expect(entry.question).toBe(`Who is the ${tradition.name} god of war?`);
      for (const deity of tradition.deities) {
        expect(entry.answer).toContain(deity.name);
      }
    }
  });

  it("links a deity's domains to the pages that exist", () => {
    const links = godsOfLinksForDomains(["war", "warfare", "no-such-domain"]);
    expect(links).toEqual([{ slug: "war", label: "War" }]);
  });

  it("links parallels to comparison pages only when one exists", () => {
    const war = getGodsOfDomain("war")!;
    for (const parallel of war.parallels) {
      if (parallel.compareSlug) {
        expect(parallel.compareSlug).toMatch(/^[a-z0-9-]+-vs-[a-z0-9-]+$/);
      }
    }
  });
});
