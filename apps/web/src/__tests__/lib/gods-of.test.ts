import { describe, expect, it } from "vitest";
import deities from "@/data/deities.json";
import pantheons from "@/data/pantheons.json";
import {
  MIN_DEITIES,
  MIN_TRADITIONS,
  domainSlug,
  getGodsOfDomain,
  getGodsOfDomains,
  godsOfFaq,
  godsOfLeads,
  godsOfLinksForDomains,
  godsOfShortAnswer,
  godsOfTitle,
  normalizeDomain,
} from "@/lib/gods-of";

const byId = new Map(
  (
    deities as Array<{
      id: string;
      domain?: string[];
      pantheonId: string;
      importanceRank?: number | null;
    }>
  ).map((d) => [d.id, d]),
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

  it("leads each tradition with the deity whose own entry names the domain first", () => {
    const first = (slug: string, pantheonId: string) =>
      getGodsOfDomain(slug)?.traditions.find((t) => t.pantheonId === pantheonId)
        ?.deities[0]?.name;
    expect(first("war", "greek-pantheon")).toBe("Ares");
    expect(first("war", "norse-pantheon")).toBe("Tyr");
    expect(first("wisdom", "greek-pantheon")).toBe("Athena");
    expect(first("love", "greek-pantheon")).toBe("Aphrodite");

    for (const page of pages) {
      for (const tradition of page.traditions) {
        const keys = tradition.deities.map((listed) => {
          const record = byId.get(listed.id);
          const at = (record?.domain ?? []).findIndex(
            (raw) => domainSlug(raw) === page.slug,
          );
          // A listed deity always names the domain; -1 would sort it first.
          expect(at, `${page.slug}: ${listed.name}`).toBeGreaterThanOrEqual(0);
          return [at, record?.importanceRank ?? 99, listed.name] as const;
        });
        const sorted = [...keys].sort(
          (x, y) => x[0] - y[0] || x[1] - y[1] || x[2].localeCompare(y[2]),
        );
        expect(keys, `${page.slug}: ${tradition.name}`).toEqual(sorted);
      }
    }
  });

  it("picks one lead per tradition, in the order the catalog lists traditions", () => {
    const war = getGodsOfDomain("war")!;
    const leads = godsOfLeads(war);
    expect(leads).toHaveLength(war.traditions.length);
    expect(leads.slice(0, 4).map((lead) => lead.tradition)).toEqual([
      "Greek",
      "Norse",
      "Egyptian",
      "Roman",
    ]);
    for (const lead of leads) {
      const tradition = war.traditions.find((t) => t.name === lead.tradition);
      expect(tradition?.deities[0]?.name, lead.tradition).toBe(lead.name);
    }

    const catalogOrder = (pantheons as Array<{ id: string }>).map((p) => p.id);
    for (const page of pages) {
      const places = godsOfLeads(page).map((lead) =>
        catalogOrder.indexOf(
          page.traditions.find((t) => t.name === lead.tradition)?.pantheonId ??
            "",
        ),
      );
      expect(places, page.slug).toEqual([...places].sort((x, y) => x - y));
      expect(places, page.slug).not.toContain(-1);
    }
  });

  it("opens with names, then says how many deities and traditions the page lists", () => {
    const war = getGodsOfDomain("war")!;
    const answer = godsOfShortAnswer(war);
    expect(answer).toMatch(
      /^Ares \(Greek\), Tyr \(Norse\), .+ \(Egyptian\), Mars \(Roman\) and .+ are among the /,
    );
    expect(answer).toContain(
      `${war.deityCount} deities from ${war.traditions.length} traditions`,
    );

    for (const page of pages) {
      const text = godsOfShortAnswer(page);
      const named = godsOfLeads(page).filter((lead) =>
        text.includes(`${lead.name} (${lead.tradition})`),
      );
      expect(named.length, page.slug).toBe(Math.min(5, page.traditions.length));
      expect(text.endsWith(`list ${page.domain} among their domains.`)).toBe(
        true,
      );
      // "among" only when the page lists more deities than the sentence names.
      expect(text.includes(" are among the "), page.slug).toBe(
        named.length < page.deityCount,
      );
    }
  });

  it("answers the general question first, then one question per leading tradition", () => {
    const war = getGodsOfDomain("war")!;
    const faq = godsOfFaq(war);
    expect(faq).toHaveLength(6);
    expect(faq[0]?.question).toBe("Who is the god of war?");
    expect(faq[0]?.answer).toContain("Ares (Greek)");
    expect(faq[0]?.answer).toContain(`${war.deityCount} deities`);
    expect(faq[1]?.question).toBe("Who is the Greek god of war?");
    expect(faq[2]?.question).toBe("Who is the Norse god of war?");

    for (const page of pages) {
      const leads = godsOfLeads(page);
      for (const [index, entry] of godsOfFaq(page).slice(1).entries()) {
        const tradition = page.traditions.find(
          (t) => t.name === leads[index]?.tradition,
        );
        expect(entry.question).toBe(
          `Who is the ${tradition?.name} god of ${page.domain}?`,
        );
        for (const deity of tradition?.deities ?? []) {
          expect(entry.answer).toContain(deity.name);
        }
      }
    }
  });

  it("keeps the quick answers inside the limit it is given", () => {
    const war = getGodsOfDomain("war")!;
    expect(godsOfFaq(war, 3)).toHaveLength(3);
    expect(godsOfFaq(war, 1).map((entry) => entry.question)).toEqual([
      "Who is the god of war?",
    ]);
    expect(godsOfFaq(war, 0)).toEqual([]);
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

describe("gods-of domain identity", () => {
  it("groups spellings through the shared domain category table", () => {
    expect(normalizeDomain("the hunt")).toBe("hunting");
    expect(normalizeDomain("hunt")).toBe("hunting");
    expect(normalizeDomain("craftsmanship")).toBe("crafts");
    expect(normalizeDomain("medicine")).toBe("healing");
  });

  it("redirects every merged slug to a page that exists", async () => {
    const { CONSOLIDATION_REDIRECTS } = await import("@/lib/route-redirects");
    const slugs = new Set(getGodsOfDomains().map((page) => page.slug));
    const merged = CONSOLIDATION_REDIRECTS.filter((r) =>
      r.source.startsWith("/gods-of/"),
    );
    expect(merged.length).toBeGreaterThan(0);
    for (const { source, destination } of merged) {
      expect(slugs.has(source.replace("/gods-of/", ""))).toBe(false);
      expect(slugs.has(destination.replace("/gods-of/", ""))).toBe(true);
    }
  });
});
