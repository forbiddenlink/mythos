import "server-only";

import deitiesData from "@/data/deities.json";
import pantheonsData from "@/data/pantheons.json";
import { getDeityComparisons } from "@/lib/comparisons";
import { domainCategoryForTerm } from "@/lib/domain-categories";
import { shortTraditionName } from "@/lib/tradition-name";

/**
 * "Gods of <domain>" landing pages, derived entirely from the catalog.
 *
 * A page exists only for a domain that at least MIN_DEITIES deities in at
 * least MIN_TRADITIONS traditions list in their own `domain` field. Nothing on
 * the page is written for it: every name, description and parallel comes from
 * the deity records, so a domain with too little behind it simply gets no page
 * (which is what keeps these from becoming doorway pages).
 */

export const MIN_DEITIES = 3;
export const MIN_TRADITIONS = 2;

interface RawDeity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  domain?: string[];
  description?: string | null;
  imageUrl?: string | null;
  importanceRank?: number | null;
  crossPantheonParallels?: Array<{ deityId: string; note?: string }>;
}

interface RawPantheon {
  id: string;
  name: string;
}

export interface DomainDeity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  /** The deity's own domain list, for context beside the matched one. */
  domains: string[];
}

export interface DomainTradition {
  pantheonId: string;
  /** Short tradition name ("Greek"). */
  name: string;
  deities: DomainDeity[];
}

export interface DomainParallel {
  a: { name: string; slug: string; tradition: string };
  b: { name: string; slug: string; tradition: string };
  note: string;
  /** Slug of the /compare page for the pair, when one exists. */
  compareSlug: string | null;
}

export interface GodsOfDomain {
  slug: string;
  /** Canonical, lower-case domain name ("war"). */
  domain: string;
  /** Every catalog spelling folded into this page ("war", "warfare"). */
  matchedTerms: string[];
  deityCount: number;
  traditions: DomainTradition[];
  parallels: DomainParallel[];
}

const deities = deitiesData as unknown as RawDeity[];
const pantheons = pantheonsData as unknown as RawPantheon[];

function shortTradition(pantheonId: string): string {
  const name = pantheons.find((p) => p.id === pantheonId)?.name;
  return name ? shortTraditionName(name) : pantheonId.replace(/-pantheon$/, "");
}

/**
 * "The Sun" → "sun"; "Warfare" → "war"; "the hunt" → "hunting". Spellings are
 * merged only through the shared alias table in domain-categories.ts, and the
 * page names every spelling it matched.
 */
export function normalizeDomain(raw: string): string {
  const key = raw.toLowerCase().trim();
  const base = key.replace(/^the\s+/, "");
  return domainCategoryForTerm(key) ?? domainCategoryForTerm(base) ?? base;
}

export function domainSlug(domain: string): string {
  return normalizeDomain(domain)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** "war" → "War"; "arts and crafts" → "Arts and Crafts". */
export function domainLabel(domain: string): string {
  return domain
    .split(" ")
    .map((word, i) =>
      i > 0 && ["and", "of", "the"].includes(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

/**
 * Where a deity's own entry names the page's domain; 0 is first. The deity
 * that names it first leads its tradition: Ares before Athena for war, Athena
 * before Zeus for wisdom.
 */
function domainPosition(deity: RawDeity, slug: string): number {
  return (deity.domain ?? []).findIndex((raw) => domainSlug(raw) === slug);
}

let cache: GodsOfDomain[] | null = null;

/** Every qualifying domain page, largest first. */
export function getGodsOfDomains(): GodsOfDomain[] {
  if (cache) return cache;

  const bySlug = new Map<
    string,
    { domain: string; terms: Set<string>; deities: RawDeity[] }
  >();
  for (const deity of deities) {
    const seen = new Set<string>();
    for (const raw of deity.domain ?? []) {
      const domain = normalizeDomain(raw);
      const slug = domainSlug(domain);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      const entry = bySlug.get(slug) ?? {
        domain,
        terms: new Set<string>(),
        deities: [],
      };
      entry.terms.add(raw.toLowerCase().trim());
      entry.deities.push(deity);
      bySlug.set(slug, entry);
    }
  }

  const comparisonSlugs = new Set(getDeityComparisons().map((c) => c.slug));

  const pages: GodsOfDomain[] = [];
  for (const [slug, { domain, terms, deities: members }] of bySlug) {
    const traditionIds = [...new Set(members.map((d) => d.pantheonId))];
    if (members.length < MIN_DEITIES) continue;
    if (traditionIds.length < MIN_TRADITIONS) continue;

    const traditions: DomainTradition[] = traditionIds
      .map((pantheonId) => ({
        pantheonId,
        name: shortTradition(pantheonId),
        deities: members
          .filter((d) => d.pantheonId === pantheonId)
          .sort(
            (x, y) =>
              domainPosition(x, slug) - domainPosition(y, slug) ||
              (x.importanceRank ?? 99) - (y.importanceRank ?? 99) ||
              x.name.localeCompare(y.name),
          )
          .map((d) => ({
            id: d.id,
            name: d.name,
            slug: d.slug,
            description: d.description ?? null,
            imageUrl: d.imageUrl ?? null,
            domains: d.domain ?? [],
          })),
      }))
      .sort(
        (x, y) =>
          y.deities.length - x.deities.length || x.name.localeCompare(y.name),
      );

    const memberById = new Map(members.map((d) => [d.id, d]));
    const parallels: DomainParallel[] = [];
    const seenPairs = new Set<string>();
    for (const deity of members) {
      for (const parallel of deity.crossPantheonParallels ?? []) {
        const other = memberById.get(parallel.deityId);
        const note = parallel.note?.trim();
        if (!other || other.id === deity.id || !note) continue;
        const [first, second] =
          deity.slug.localeCompare(other.slug) <= 0
            ? [deity, other]
            : [other, deity];
        const pairSlug = `${first.slug}-vs-${second.slug}`;
        if (seenPairs.has(pairSlug)) continue;
        seenPairs.add(pairSlug);
        parallels.push({
          a: {
            name: deity.name,
            slug: deity.slug,
            tradition: shortTradition(deity.pantheonId),
          },
          b: {
            name: other.name,
            slug: other.slug,
            tradition: shortTradition(other.pantheonId),
          },
          note,
          compareSlug: comparisonSlugs.has(pairSlug) ? pairSlug : null,
        });
      }
    }

    pages.push({
      slug,
      domain,
      matchedTerms: [...terms].sort(),
      deityCount: members.length,
      traditions,
      parallels,
    });
  }

  cache = pages.sort(
    (x, y) => y.deityCount - x.deityCount || x.slug.localeCompare(y.slug),
  );
  return cache;
}

export function getGodsOfDomain(slug: string): GodsOfDomain | null {
  return getGodsOfDomains().find((page) => page.slug === slug) ?? null;
}

/** Page slugs for a deity's own domains, for links from its entry. */
export function godsOfLinksForDomains(
  domains: readonly string[],
): Array<{ slug: string; label: string }> {
  const available = new Set(getGodsOfDomains().map((page) => page.slug));
  const out: Array<{ slug: string; label: string }> = [];
  for (const raw of domains) {
    const slug = domainSlug(raw);
    if (!available.has(slug) || out.some((link) => link.slug === slug)) {
      continue;
    }
    out.push({ slug, label: domainLabel(normalizeDomain(raw)) });
  }
  return out;
}

export interface DomainLead {
  name: string;
  slug: string;
  /** Short tradition name ("Greek"). */
  tradition: string;
}

/**
 * The first deity of each tradition. Traditions follow the catalog's own order
 * (Greek, Norse, Egyptian, Roman, ...) and not their size on this page, so the
 * names a reader is most likely to look for come first.
 */
export function godsOfLeads(page: GodsOfDomain): DomainLead[] {
  const order = new Map(pantheons.map((p, index) => [p.id, index]));
  return [...page.traditions]
    .sort(
      (x, y) =>
        (order.get(x.pantheonId) ?? pantheons.length) -
        (order.get(y.pantheonId) ?? pantheons.length),
    )
    .flatMap((tradition) =>
      tradition.deities
        .slice(0, 1)
        .map(({ name, slug }) => ({ name, slug, tradition: tradition.name })),
    );
}

function sentenceList(items: string[]): string {
  return items.length > 1
    ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`
    : (items[0] ?? "");
}

/** "Ares (Greek), Tyr (Norse) and Mars (Roman)": the leads a short answer names. */
function leadNames(page: GodsOfDomain, limit: number): string {
  return sentenceList(
    godsOfLeads(page)
      .slice(0, limit)
      .map((lead) => `${lead.name} (${lead.tradition})`),
  );
}

/**
 * "are among the N deities from M traditions"; "are the N deities ..." when
 * the sentence already names every deity on the page.
 */
function countPhrase(page: GodsOfDomain, limit: number): string {
  const named = Math.min(limit, page.traditions.length);
  const verb = named < page.deityCount ? "are among the" : "are the";
  return `${verb} ${page.deityCount} deities from ${page.traditions.length} traditions`;
}

/**
 * The page's opening sentence: names first, then what the list is. Every name
 * comes from a deity record that lists the domain, so it adds no claim the
 * listing below does not already make.
 */
export function godsOfShortAnswer(page: GodsOfDomain, limit = 5): string {
  return `${leadNames(page, limit)} ${countPhrase(page, limit)} whose entries in this atlas list ${page.domain} among their domains.`;
}

/** "Gods of War" — the page's name, singular noun kept plural for search intent. */
export function godsOfTitle(page: Pick<GodsOfDomain, "domain">): string {
  return `Gods of ${domainLabel(page.domain)}`;
}

/**
 * Quick answers drawn from the listing itself. The first is the general
 * question; the rest ask, for each leading tradition, which of its deities the
 * catalog files under this domain. The block stays short.
 */
export function godsOfFaq(
  page: GodsOfDomain,
  limit = 6,
): Array<{ question: string; answer: string }> {
  const label = page.domain;
  const general = {
    question: `Who is the god of ${label}?`,
    answer: `It depends on the tradition. In the Mythos Atlas catalog, ${leadNames(page, 5)} ${countPhrase(page, 5)} whose domains include ${label}.`,
  };
  const byName = new Map(page.traditions.map((t) => [t.name, t]));
  const perTradition = godsOfLeads(page)
    .slice(0, Math.max(0, limit - 1))
    .flatMap((lead) => {
      const tradition = byName.get(lead.tradition);
      if (!tradition) return [];
      const names = tradition.deities.map((d) => d.name);
      const verb = names.length > 1 ? "are" : "is";
      const noun = names.length > 1 ? "deities" : "deity";
      return [
        {
          question: `Who is the ${tradition.name} god of ${label}?`,
          answer: `In the Mythos Atlas catalog, the ${tradition.name} ${noun} whose domains include ${label} ${verb} ${sentenceList(names)}.`,
        },
      ];
    });
  return [general, ...perTradition].slice(0, Math.max(0, limit));
}
