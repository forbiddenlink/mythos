// Relative rather than the "@/" alias: next.config.ts imports this module to
// build the redirect table, and the config loader does not resolve tsconfig
// paths.
import deitiesData from "../data/deities.json";
import pantheonsData from "../data/pantheons.json";
import relationshipsData from "../data/relationships.json";
import { readableParallelNote } from "./parallel-notes";

/**
 * Indexable head-to-head comparison pages.
 *
 * The /compare tool is client-rendered behind query params, so nothing it can
 * show is reachable by a crawler. These routes serve the same comparisons as
 * static pages.
 *
 * Pairs are never generated combinatorially. Each one is justified by data that
 * already exists: a curated `crossPantheonParallels` note across traditions, or
 * a recorded kinship/rivalry within one. A pair with no such justification gets
 * no page, which is what keeps these from becoming interchangeable stubs.
 */

export type KinRelation = "siblings" | "rivals" | "parent and child";

export type ComparisonBasis =
  | { kind: "parallel"; notes: string[] }
  | { kind: "kin"; relation: KinRelation; confidence: string | null };

export interface Worship {
  temples: string[];
  festivals: string[];
  practices: string | null;
}

export interface ComparisonDeity {
  id: string;
  name: string;
  /** Name plus tradition when the bare name is ambiguous (two Apollos). */
  displayName: string;
  slug: string;
  pantheonId: string;
  pantheonName: string;
  gender: string | null;
  domain: string[];
  symbols: string[];
  description: string | null;
  originStory: string | null;
  /** Opening section of the long biography, used as a comparative excerpt. */
  bioExcerpt: string | null;
  worship: Worship;
  alternateNames: string[];
  importanceRank: number | null;
  imageUrl: string | null;
}

export interface DeityComparison {
  slug: string;
  a: ComparisonDeity;
  b: ComparisonDeity;
  basis: ComparisonBasis;
  sharedDomains: string[];
  sharedSymbols: string[];
  distinctDomains: { a: string[]; b: string[] };
  sameTradition: boolean;
}

interface RawParallel {
  pantheonId?: string;
  deityId?: string;
  note?: string;
}

interface RawDeity {
  id: string;
  name: string;
  slug?: string;
  pantheonId: string;
  gender?: string | null;
  domain?: string[];
  symbols?: string[];
  description?: string | null;
  detailedBio?: string | null;
  originStory?: string | null;
  worship?: {
    temples?: string[];
    festivals?: string[];
    practices?: string | null;
  } | null;
  alternateNames?: string[];
  importanceRank?: number | null;
  imageUrl?: string | null;
  crossPantheonParallels?: RawParallel[];
}

interface RawRelationship {
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
  confidenceLevel?: string | null;
}

const deities = deitiesData as unknown as RawDeity[];
const pantheons = pantheonsData as unknown as { id: string; name: string }[];
const relationships = relationshipsData as unknown as RawRelationship[];

const deityById = new Map(deities.map((d) => [d.id, d]));
const pantheonNameById = new Map(pantheons.map((p) => [p.id, p.name]));

/** Names carried by more than one deity, which must be qualified on sight. */
const ambiguousNames = new Set(
  Object.entries(
    deities.reduce<Record<string, number>>((counts, d) => {
      counts[d.name] = (counts[d.name] ?? 0) + 1;
      return counts;
    }, {}),
  )
    .filter(([, count]) => count > 1)
    .map(([name]) => name),
);

/** Reserved static children of /compare that a pair slug must never shadow. */
const RESERVED_SLUGS = new Set(["myths", "parallels", "mythologies"]);

/**
 * A page only earns its place if both sides carry enough prose to say something.
 * Measured across every substantive field, not `description` alone: several
 * major deities carry a one-line summary and put their weight in `originStory`,
 * and gating on the summary alone dropped Hades and Poseidon.
 */
const MIN_PROSE_CHARS = 400;

/** Within one tradition, these are the relations people actually compare. */
const KIN_RELATIONS: Record<string, KinRelation> = {
  sibling_of: "siblings",
  enemy_of: "rivals",
  parent_of: "parent and child",
};

function proseLength(deity: RawDeity): number {
  return [deity.description, deity.detailedBio, deity.originStory]
    .map((field) => (field ?? "").trim().length)
    .reduce((total, length) => total + length, 0);
}

function isEligible(deity: RawDeity | undefined): deity is RawDeity {
  if (!deity) return false;
  if (proseLength(deity) < MIN_PROSE_CHARS) return false;
  return (deity.domain ?? []).length > 0;
}

/**
 * First prose block of `detailedBio`, with its markdown heading dropped. The
 * full biography belongs on the deity's own page; a comparison only needs
 * enough of it to stand on its own.
 */
function bioExcerpt(deity: RawDeity): string | null {
  const bio = (deity.detailedBio ?? "").trim();
  if (!bio) return null;
  const firstParagraph = bio
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .find((block) => block.length > 0 && !block.startsWith("#"));
  return firstParagraph ?? null;
}

function toComparisonDeity(deity: RawDeity): ComparisonDeity {
  const pantheonName = pantheonNameById.get(deity.pantheonId) ?? "Unattributed";
  return {
    id: deity.id,
    name: deity.name,
    displayName: ambiguousNames.has(deity.name)
      ? `${deity.name} (${pantheonName.replace(/\s+(Pantheon|Tradition|Traditions)$/, "")})`
      : deity.name,
    slug: deity.slug ?? deity.id,
    pantheonId: deity.pantheonId,
    pantheonName,
    gender: deity.gender ?? null,
    domain: deity.domain ?? [],
    symbols: deity.symbols ?? [],
    description: deity.description ?? null,
    originStory: deity.originStory ?? null,
    bioExcerpt: bioExcerpt(deity),
    worship: {
      temples: deity.worship?.temples ?? [],
      festivals: deity.worship?.festivals ?? [],
      practices: deity.worship?.practices ?? null,
    },
    alternateNames: deity.alternateNames ?? [],
    importanceRank: deity.importanceRank ?? null,
    imageUrl: deity.imageUrl ?? null,
  };
}

function overlap(left: string[], right: string[]): string[] {
  const other = new Set(right.map((v) => v.toLowerCase()));
  return left.filter((v) => other.has(v.toLowerCase()));
}

function only(left: string[], right: string[]): string[] {
  const other = new Set(right.map((v) => v.toLowerCase()));
  return left.filter((v) => !other.has(v.toLowerCase()));
}

/**
 * Canonical order is alphabetical by slug. `importanceRank` is scoped to a
 * single pantheon, so comparing it across traditions would order pairs by a
 * number that means nothing between them.
 */
function orderPair(x: RawDeity, y: RawDeity): [RawDeity, RawDeity] {
  const sx = x.slug ?? x.id;
  const sy = y.slug ?? y.id;
  return sx.localeCompare(sy) <= 0 ? [x, y] : [y, x];
}

function buildComparison(
  x: RawDeity,
  y: RawDeity,
  basis: ComparisonBasis,
): DeityComparison {
  const [first, second] = orderPair(x, y);
  const a = toComparisonDeity(first);
  const b = toComparisonDeity(second);

  return {
    slug: `${a.slug}-vs-${b.slug}`,
    a,
    b,
    basis,
    sharedDomains: overlap(a.domain, b.domain),
    sharedSymbols: overlap(a.symbols, b.symbols),
    distinctDomains: {
      a: only(a.domain, b.domain),
      b: only(b.domain, a.domain),
    },
    sameTradition: a.pantheonId === b.pantheonId,
  };
}

function parallelNotes(x: RawDeity, y: RawDeity): string[] {
  const notes = [
    ...(x.crossPantheonParallels ?? []).filter((p) => p.deityId === y.id),
    ...(y.crossPantheonParallels ?? []).filter((p) => p.deityId === x.id),
  ]
    .map((p) => (p.note ?? "").trim())
    .filter((note) => note.length > 0)
    .map(readableParallelNote);
  return [...new Set(notes)];
}

let cachedComparisons: DeityComparison[] | null = null;

/** Every justified pair that passes the quality gate, in canonical slug order. */
export function getDeityComparisons(): DeityComparison[] {
  if (cachedComparisons) return cachedComparisons;

  const bySlug = new Map<string, DeityComparison>();

  const add = (x: RawDeity, y: RawDeity, basis: ComparisonBasis) => {
    if (x.id === y.id) return;
    if (!isEligible(x) || !isEligible(y)) return;
    const comparison = buildComparison(x, y, basis);
    if (RESERVED_SLUGS.has(comparison.slug)) return;
    // A curated cross-tradition note outranks a bare kinship record, so it wins
    // when the same two deities qualify under both.
    const existing = bySlug.get(comparison.slug);
    if (existing && existing.basis.kind === "parallel") return;
    bySlug.set(comparison.slug, comparison);
  };

  for (const deity of deities) {
    for (const parallel of deity.crossPantheonParallels ?? []) {
      const other = parallel.deityId
        ? deityById.get(parallel.deityId)
        : undefined;
      if (!other) continue;
      const notes = parallelNotes(deity, other);
      if (notes.length === 0) continue;
      add(deity, other, { kind: "parallel", notes });
    }
  }

  for (const relation of relationships) {
    const kind = KIN_RELATIONS[relation.relationshipType];
    if (!kind) continue;
    const x = deityById.get(relation.fromDeityId);
    const y = deityById.get(relation.toDeityId);
    if (!x || !y || x.pantheonId !== y.pantheonId) continue;
    add(x, y, {
      kind: "kin",
      relation: kind,
      confidence: relation.confidenceLevel ?? null,
    });
  }

  const built = [...bySlug.values()].sort((l, r) =>
    l.slug.localeCompare(r.slug),
  );
  cachedComparisons = built;
  return built;
}

export function getDeityComparison(slug: string): DeityComparison | null {
  return getDeityComparisons().find((c) => c.slug === slug) ?? null;
}

/**
 * Every pair spelled in the non-canonical order, mapped to its canonical slug.
 *
 * Readers guess "zeus-vs-odin" as readily as "odin-vs-zeus", and so do people
 * linking in. These feed the redirect table so the wrong order lands on the one
 * canonical URL with a 308 rather than a 404, and the pair is never indexed
 * twice. Handling it in the page instead would answer 200, because
 * `generateMetadata` runs independently and would still title it not found.
 */
export function getReversedComparisonSlugs(): Record<string, string> {
  const reversed: Record<string, string> = {};
  for (const comparison of getDeityComparisons()) {
    const alias = `${comparison.b.slug}-vs-${comparison.a.slug}`;
    if (alias !== comparison.slug) reversed[alias] = comparison.slug;
  }
  return reversed;
}

/** Other pairings either deity takes part in, for internal linking. */
export function getRelatedComparisons(
  comparison: DeityComparison,
  limit = 6,
): DeityComparison[] {
  const ids = new Set([comparison.a.id, comparison.b.id]);
  return getDeityComparisons()
    .filter(
      (c) => c.slug !== comparison.slug && (ids.has(c.a.id) || ids.has(c.b.id)),
    )
    .slice(0, limit);
}

/** Pairings involving one deity, linked from that deity's own page. */
export function getComparisonsForDeity(
  deityId: string,
  limit = 4,
): DeityComparison[] {
  return getDeityComparisons()
    .filter((c) => c.a.id === deityId || c.b.id === deityId)
    .slice(0, limit);
}

/** The other side of a pairing, given one deity. */
export function counterpart(
  comparison: DeityComparison,
  deityId: string,
): ComparisonDeity {
  return comparison.a.id === deityId ? comparison.b : comparison.a;
}
