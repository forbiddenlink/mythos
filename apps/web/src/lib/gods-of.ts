import "server-only";

import deitiesData from "@/data/deities.json";
import pantheonsData from "@/data/pantheons.json";
import { getDeityComparisons } from "@/lib/comparisons";

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

/**
 * Spellings the catalog uses for the same domain. Kept deliberately small:
 * only true synonyms are merged, and the page names every spelling it matched.
 */
const DOMAIN_ALIASES: Record<string, string> = {
  warfare: "war",
  ocean: "sea",
};

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
  return (
    name?.replace(/\s+(?:Pantheon|Tradition|Traditions)$/, "") ??
    pantheonId.replace(/-pantheon$/, "")
  );
}

/** "The Sun" → "sun"; "Warfare" → "war". */
export function normalizeDomain(raw: string): string {
  const base = raw
    .toLowerCase()
    .trim()
    .replace(/^the\s+/, "");
  return DOMAIN_ALIASES[base] ?? base;
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

/** "Gods of War" — the page's name, singular noun kept plural for search intent. */
export function godsOfTitle(page: Pick<GodsOfDomain, "domain">): string {
  return `Gods of ${domainLabel(page.domain)}`;
}

/**
 * Quick answers drawn from the listing itself: for each tradition with an
 * entry, which of its deities the catalog files under this domain. Only the
 * largest traditions get a question so the block stays short.
 */
export function godsOfFaq(
  page: GodsOfDomain,
  limit = 6,
): Array<{ question: string; answer: string }> {
  const label = page.domain;
  return page.traditions.slice(0, limit).map((tradition) => {
    const names = tradition.deities.map((d) => d.name);
    const list =
      names.length > 1
        ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`
        : names[0];
    const verb = names.length > 1 ? "are" : "is";
    const noun = names.length > 1 ? "deities" : "deity";
    return {
      question: `Who is the ${tradition.name} god of ${label}?`,
      answer: `In the Mythos Atlas catalog, the ${tradition.name} ${noun} whose domains include ${label} ${verb} ${list}.`,
    };
  });
}
