/**
 * Search engine for Mythos Atlas: scored matching over a slim search index.
 *
 * Pure module with no catalog imports. The server builds the index from the
 * JSON catalog (`@/lib/search`, `/api/catalog/search-index`); the command
 * palette fetches that prebuilt index on first open instead of bundling every
 * catalog file into its chunk.
 */

// Content type definitions
import type { ContentType, SearchResult } from "./search-result";
import { foldForSearch } from "./search-fold";
export type { ContentType, SearchResult } from "./search-result";
export { getResultUrl } from "./search-result";

export interface DeityData {
  id: string;
  name: string;
  slug: string;
  description: string;
  domain?: string[];
  /** Attributes a reader searches by ("owl", "trident"). */
  symbols?: string[];
  alternateNames?: string[];
  pantheonId?: string;
  /** "male" / "female" etc., used only to read "goddess of ..." queries. */
  gender?: string;
  /**
   * How widely the catalog connects this figure across traditions (its own
   * parallels plus the parallels that name it). Ranks "god of the sea"
   * results: Poseidon before a figure who also has the sea as a domain.
   */
  prominence?: number;
}

export interface StoryData {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category?: string;
  pantheonId?: string;
}

export interface CreatureData {
  id: string;
  name: string;
  slug: string;
  description: string;
  habitat?: string;
  pantheonId?: string;
}

export interface ArtifactData {
  id: string;
  name: string;
  slug: string;
  description: string;
  type?: string;
  pantheonId?: string;
}

export interface LocationData {
  id: string;
  name: string;
  slug?: string;
  description: string;
  locationType?: string;
  pantheonId?: string;
}

export interface HeroData {
  id: string;
  name: string;
  slug: string;
  description: string;
  alternateNames?: string[];
  pantheonId?: string;
}

export interface SourceData {
  id: string;
  title: string;
  author?: string;
  description: string;
}

/** Exactly the fields `searchIndex` reads, per content type. */
export interface SearchIndex {
  deities: DeityData[];
  stories: StoryData[];
  creatures: CreatureData[];
  artifacts: ArtifactData[];
  locations: LocationData[];
  heroes: HeroData[];
  sources: SourceData[];
  /** Short tradition name per pantheon id ("Chinese", "Aztec"), for labels and queries. */
  pantheonLabels?: Record<string, string>;
}

type Loose = Record<string, unknown>;
const str = (v: unknown): string | undefined =>
  typeof v === "string" ? v : undefined;
const strs = (v: unknown): string[] | undefined =>
  Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string")
    : undefined;

function compact<T extends object>(row: T): T {
  return Object.fromEntries(
    Object.entries(row).filter(([, value]) => value !== undefined),
  ) as T;
}

/** The deity ids a raw catalog row lists as cross-pantheon parallels. */
function parallelIds(row: Loose): string[] {
  const list = row.crossPantheonParallels;
  if (!Array.isArray(list)) return [];
  return list
    .map((p) =>
      p && typeof p === "object" ? str((p as Loose).deityId) : undefined,
    )
    .filter((id): id is string => Boolean(id));
}

/** Reduce raw catalog rows to a search index (drops biographies, narratives, passages). */
export function toSearchIndex(raw: {
  deities: readonly object[];
  stories: readonly object[];
  creatures: readonly object[];
  artifacts: readonly object[];
  locations: readonly object[];
  heroes: readonly object[];
  sources: readonly object[];
  pantheons?: readonly object[];
}): SearchIndex {
  const rows = (list: readonly object[]) => list as readonly Loose[];
  const pantheonLabels = Object.fromEntries(
    rows(raw.pantheons ?? []).map((p) => [
      String(p.id),
      // "Canaanite Pantheon (Ugarit)" -> "Canaanite", "Haudenosaunee Tradition" -> "Haudenosaunee"
      String(p.name)
        .replace(/\s*\([^)]*\)/g, "")
        .replace(/\s+(?:Pantheon|Traditions?)$/, ""),
    ]),
  );
  const inboundParallels = new Map<string, number>();
  for (const d of rows(raw.deities)) {
    for (const id of parallelIds(d)) {
      inboundParallels.set(id, (inboundParallels.get(id) ?? 0) + 1);
    }
  }
  return {
    pantheonLabels,
    deities: rows(raw.deities).map((d) =>
      compact({
        id: String(d.id),
        name: String(d.name),
        slug: String(d.slug),
        description: str(d.description) ?? "",
        domain: strs(d.domain),
        symbols: strs(d.symbols),
        alternateNames: strs(d.alternateNames),
        pantheonId: str(d.pantheonId),
        gender: str(d.gender),
        prominence:
          (inboundParallels.get(String(d.id)) ?? 0) + parallelIds(d).length ||
          undefined,
      }),
    ),
    stories: rows(raw.stories).map((s) =>
      compact({
        id: String(s.id),
        title: String(s.title),
        slug: String(s.slug),
        summary: str(s.summary) ?? "",
        category: str(s.category),
        pantheonId: str(s.pantheonId),
      }),
    ),
    creatures: rows(raw.creatures).map((c) =>
      compact({
        id: String(c.id),
        name: String(c.name),
        slug: String(c.slug),
        description: str(c.description) ?? "",
        habitat: str(c.habitat),
        pantheonId: str(c.pantheonId),
      }),
    ),
    artifacts: rows(raw.artifacts).map((a) =>
      compact({
        id: String(a.id),
        name: String(a.name),
        slug: String(a.slug),
        description: str(a.description) ?? "",
        type: str(a.type),
        pantheonId: str(a.pantheonId),
      }),
    ),
    locations: rows(raw.locations).map((l) =>
      compact({
        id: String(l.id),
        name: String(l.name),
        slug: str(l.slug),
        description: str(l.description) ?? "",
        locationType: str(l.locationType),
        pantheonId: str(l.pantheonId),
      }),
    ),
    heroes: rows(raw.heroes).map((h) =>
      compact({
        id: String(h.id),
        name: String(h.name),
        slug: String(h.slug),
        description: str(h.description) ?? "",
        alternateNames: strs(h.alternateNames),
        pantheonId: str(h.pantheonId),
      }),
    ),
    sources: rows(raw.sources).map((s) =>
      compact({
        id: String(s.id),
        title: String(s.title),
        author: str(s.author),
        description: str(s.description) ?? "",
      }),
    ),
  };
}

/** Words that carry no meaning in a query like "norse god of war". */
const QUERY_STOPWORDS = new Set([
  "of",
  "the",
  "a",
  "an",
  "and",
  "in",
  "from",
  "for",
  // Question words: "who killed baldur" should search "killed baldur".
  "who",
  "what",
  "which",
  "where",
  "when",
  "why",
  "how",
  "is",
  "was",
  "are",
  "did",
  "does",
]);

/**
 * Fallback for multi-word queries that match no field as a whole phrase:
 * every meaningful word must match some field (or the tradition name), and
 * the score is half the per-word scores so phrase matches still lead.
 */
function calculateWordScore(
  query: string,
  fields: { value: string; weight: number }[],
): number {
  const words = foldForSearch(query)
    .split(/\s+/)
    .filter((word) => word.length > 1 && !QUERY_STOPWORDS.has(word));
  if (words.length < 2) return 0;
  let total = 0;
  for (const word of words) {
    const score = Math.max(
      ...wordVariants(word).map((variant) =>
        calculateMatchScore(variant, fields),
      ),
    );
    if (score === 0) return 0;
    total += score;
  }
  return total / 2;
}

/**
 * What a reader calls each kind of entry, so "god" in "egyptian god of the
 * dead" counts toward deities, not toward every place whose description
 * mentions a god.
 */
const TYPE_WORDS: Partial<Record<ContentType, string>> = {
  deity: "god goddess deity",
  hero: "hero heroine",
  creature: "creature monster beast",
  story: "story myth tale",
};

/**
 * Words a reader uses for what the catalog files under another word
 * ("god of the dead" for domains listed as death or the afterlife).
 */
const RELATED_WORDS: Record<string, string[]> = {
  dead: ["death", "afterlife", "underworld"],
  death: ["dead", "afterlife"],
  afterlife: ["death", "underworld"],
  sea: ["ocean"],
  ocean: ["sea"],
  sun: ["solar"],
  moon: ["lunar"],
  battle: ["war"],
  // "who killed baldur" finds "The Death of Baldur".
  kill: ["death", "slay", "murder"],
  killed: ["death", "slain", "murder"],
  murdered: ["murder", "death"],
  died: ["death"],
};

/** The word, its plain singular ("gods" -> "god"), and related words. */
function wordVariants(word: string): string[] {
  const variants = [word, ...(RELATED_WORDS[word] ?? [])];
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) {
    variants.push(word.slice(0, -1));
  }
  // "killed" / "killing" -> "kill", which also finds "killing" and "kills".
  const stem = word.replace(/(?:ed|ing)$/, "");
  if (stem !== word && stem.length >= 3) variants.push(stem);
  return variants;
}

/**
 * Calculate match score based on where the query matches
 * Higher scores for title matches, lower for description matches
 */
function calculateMatchScore(
  query: string,
  fields: { value: string; weight: number }[],
): number {
  const normalizedQuery = foldForSearch(query).trim();
  let totalScore = 0;

  for (const field of fields) {
    if (!field.value) continue;
    const normalizedValue = foldForSearch(field.value);

    // Exact match gets highest score
    if (normalizedValue === normalizedQuery) {
      totalScore += 100 * field.weight;
    }
    // Starts with query
    else if (normalizedValue.startsWith(normalizedQuery)) {
      totalScore += 80 * field.weight;
    }
    // Word boundary match
    else if (
      normalizedValue.includes(` ${normalizedQuery}`) ||
      normalizedValue.includes(`${normalizedQuery} `)
    ) {
      totalScore += 60 * field.weight;
    }
    // Contains query mid-word ("thor" in "Hathor"). Kept, so partial
    // typing still finds something, but weighted well under a whole-word
    // match in a lower-weight field.
    else if (normalizedValue.includes(normalizedQuery)) {
      totalScore += 10 * field.weight;
    }
  }

  return totalScore;
}

/** Build a pantheon-prefixed label like "Greek Deity" or just "Deity" */
function getPantheonLabel(
  labels: Record<string, string>,
  pantheonId: string | undefined,
  typeName: string,
): string {
  const name = pantheonId ? labels[pantheonId] : "";
  return name ? `${name} ${typeName}` : typeName;
}

/** Larger than any combination of field scores, so an exact title always leads. */
const EXACT_TITLE_BONUS = 1000;

/** Generic scored search over a typed collection */
function searchItems<T extends { id: string }>(
  items: T[],
  query: string,
  config: {
    type: ContentType;
    getTitle: (item: T) => string;
    getSlug: (item: T) => string;
    getSearchFields: (item: T) => { value: string; weight: number }[];
    getSubtitle: (item: T) => string;
    /** Tradition name, matched only by the word-by-word fallback. */
    getTradition?: (item: T) => string;
    /** Other names; one that IS the query ranks like an exact title. */
    getAliases?: (item: T) => string[] | undefined;
  },
): SearchResult[] {
  const results: SearchResult[] = [];
  const foldedQuery = foldForSearch(query).trim();
  for (const item of items) {
    const fields = config.getSearchFields(item);
    let score = calculateMatchScore(query, fields);
    if (score === 0) {
      score = calculateWordScore(query, [
        ...fields,
        { value: config.getTradition?.(item) ?? "", weight: 1 },
        { value: TYPE_WORDS[config.type] ?? "", weight: 2 },
      ]);
    }
    // A title that IS the query must beat any entry that merely starts with it
    // plus a matching summary ("Hera" over "Heracles", "Prometheus" over
    // "Prometheus Steals Fire"). Field weights alone let those outscore it.
    if (score > 0 && foldForSearch(config.getTitle(item)) === foldedQuery) {
      score += EXACT_TITLE_BONUS;
    } else if (
      score > 0 &&
      config
        .getAliases?.(item)
        ?.some((alias) => foldForSearch(alias) === foldedQuery)
    ) {
      // "Hercules" opens Heracles before "The Twelve Labors of Hercules".
      score += EXACT_TITLE_BONUS * 0.9;
    }
    if (score > 0) {
      results.push({
        type: config.type,
        id: item.id,
        slug: config.getSlug(item),
        title: config.getTitle(item),
        subtitle: config.getSubtitle(item),
        matchScore: score,
      });
    }
  }
  return results;
}

/**
 * Search across all content types
 */
export function searchIndex(
  index: SearchIndex,
  query: string,
  limit: number = 10,
): SearchResult[] {
  if (!query || query.trim().length < 2) {
    return [];
  }
  const folded = foldForSearch(query).trim();

  // "god of the sea", "norse goddess of love": the reader wants the figures
  // whose domain it is, ranked by prominence, ahead of any text match.
  const intent = parseDomainIntent(folded);
  const intentResults = intent ? domainIntentResults(index, intent) : [];

  // An epithet such as Guan Yu's "God of War" should not outrank Ares and
  // Tyr on a domain query, so alias bonuses are off when the intent applies.
  let results = scoredSearch(index, folded, { aliasBonus: !intent });
  // Transliterations a reader types ("herakles", "kronos", "dionysos").
  if (results.length === 0) {
    for (const variant of transliterations(folded)) {
      results = scoredSearch(index, variant);
      if (results.length > 0) break;
    }
  }
  // One typo in a name ("zues", "posiedon", "quetzalcoatal").
  if (results.length === 0 && intentResults.length === 0) {
    results = fuzzyNameResults(index, folded);
  }

  const merged = new Map<string, SearchResult>();
  for (const r of [...intentResults, ...results]) {
    const key = `${r.type}:${r.id}`;
    const existing = merged.get(key);
    if (!existing || existing.matchScore < r.matchScore) merged.set(key, r);
  }
  return [...merged.values()]
    .toSorted((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

/* ----------------------- "god of X" domain intent ------------------------ */

interface DomainIntent {
  topic: string;
  female?: boolean;
  tradition?: string;
}

const INTENT_RE =
  /^(?:([a-z]+)\s+)?(god|goddess|deity|gods|goddesses|deities)\s+of\s+(?:the\s+)?(.+)$/;

/** Read "norse goddess of love" as { tradition, female, topic }. */
export function parseDomainIntent(folded: string): DomainIntent | null {
  const m = INTENT_RE.exec(folded);
  if (!m) return null;
  const topic = m[3].trim();
  if (!topic) return null;
  return {
    topic,
    ...(m[2].startsWith("goddess") ? { female: true } : {}),
    ...(m[1] ? { tradition: m[1] } : {}),
  };
}

/** Above every ordinary text match, below an exact title (EXACT_TITLE_BONUS). */
const INTENT_BASE = 400;

function domainIntentResults(
  index: SearchIndex,
  intent: DomainIntent,
): SearchResult[] {
  const labels = index.pantheonLabels ?? {};
  const topics = new Set(
    intent.topic.split(/\s+/).length === 1
      ? wordVariants(intent.topic)
      : [intent.topic],
  );
  const results: SearchResult[] = [];
  for (const d of index.deities) {
    const domains = (d.domain ?? []).map((x) => foldForSearch(x).trim());
    // "war" also matches "warfare"; "dead" matches "death" via wordVariants.
    const position = domains.findIndex((domain) =>
      [...topics].some(
        (t) =>
          domain === t || domain.startsWith(`${t} `) || domain.startsWith(t),
      ),
    );
    if (position < 0) continue;
    const label = d.pantheonId ? (labels[d.pantheonId] ?? "") : "";
    if (
      intent.tradition &&
      !foldForSearch(label).startsWith(intent.tradition) &&
      !foldForSearch(d.pantheonId ?? "").startsWith(intent.tradition)
    ) {
      continue;
    }
    let score = INTENT_BASE + (position === 0 ? 120 : 60);
    score += Math.min(d.prominence ?? 0, 20) * 15;
    if (intent.female !== undefined) {
      score += d.gender === "female" ? 60 : -60;
    }
    results.push({
      type: "deity",
      id: d.id,
      slug: d.slug,
      title: d.name,
      subtitle: getPantheonLabel(labels, d.pantheonId, "Deity"),
      matchScore: score,
    });
  }
  return results;
}

/* ------------------------ transliteration variants ----------------------- */

/**
 * Greek and Latin spellings a reader types for the catalog's English forms:
 * k/c (Herakles, Kronos), -os/-us (Dionysos), ai/ae.
 */
export function transliterations(folded: string): string[] {
  const out = new Set<string>();
  const kc = folded.replace(/k/g, "c");
  out.add(kc);
  for (const base of [folded, kc]) {
    out.add(base.replace(/os\b/g, "us"));
    out.add(base.replace(/us\b/g, "os"));
    out.add(base.replace(/ai/g, "ae"));
  }
  out.delete(folded);
  return [...out];
}

/* --------------------------- typo-tolerant names -------------------------- */

/** Optimal string alignment distance (Levenshtein plus adjacent swaps). */
export function editDistance(a: string, b: string, max = 3): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const rows: number[][] = [];
  for (let i = 0; i <= a.length; i += 1) {
    rows.push([i, ...Array.from({ length: b.length }, () => 0)]);
  }
  for (let j = 0; j <= b.length; j += 1) rows[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, rows[i - 2][j - 2] + 1);
      }
      rows[i][j] = v;
    }
  }
  return rows[a.length][b.length];
}

/** Typos allowed for a query of this length: none under 4 letters. */
function allowedTypos(length: number): number {
  if (length < 4) return 0;
  return length < 8 ? 1 : 2;
}

function fuzzyNameResults(index: SearchIndex, folded: string): SearchResult[] {
  const max = allowedTypos(folded.length);
  if (max === 0 || folded.includes(" ")) return [];
  const labels = index.pantheonLabels ?? {};
  const results: SearchResult[] = [];
  const consider = (
    type: ContentType,
    item: {
      id: string;
      slug?: string;
      name: string;
      alternateNames?: string[];
      pantheonId?: string;
    },
    typeName: string,
  ) => {
    const names = [item.name, ...(item.alternateNames ?? [])].flatMap((n) => {
      const f = foldForSearch(n).trim();
      // "Longwang (the Dragon Kings)" is also tried as "longwang".
      return [f, f.split(/[\s(]/)[0]];
    });
    let best = max + 1;
    for (const n of names) best = Math.min(best, editDistance(folded, n, max));
    if (best > max) return;
    results.push({
      type,
      id: item.id,
      slug: item.slug ?? item.id,
      title: item.name,
      subtitle: getPantheonLabel(labels, item.pantheonId, typeName),
      // Below any real text match, nearer spellings first.
      matchScore: 50 - best * 15,
    });
  };
  for (const d of index.deities) consider("deity", d, "Deity");
  for (const h of index.heroes) consider("hero", h, "Hero");
  for (const c of index.creatures) consider("creature", c, "Creature");
  for (const a of index.artifacts) consider("artifact", a, "Artifact");
  for (const l of index.locations) consider("location", l, "Location");
  return results;
}

/* ---------------------------- scored text search -------------------------- */

function scoredSearch(
  index: SearchIndex,
  normalizedQuery: string,
  { aliasBonus = true }: { aliasBonus?: boolean } = {},
) {
  const labels = index.pantheonLabels ?? {};
  const tradition = (item: { pantheonId?: string }) =>
    item.pantheonId ? (labels[item.pantheonId] ?? "") : "";

  const results: SearchResult[] = [
    ...searchItems(index.heroes, normalizedQuery, {
      type: "hero",
      getTitle: (h) => h.name,
      getSlug: (h) => h.slug,
      getSearchFields: (h) => [
        { value: h.name, weight: 3 },
        { value: h.alternateNames?.join(" ") || "", weight: 2.5 },
        { value: h.description, weight: 1 },
      ],
      getTradition: tradition,
      getAliases: aliasBonus ? (h) => h.alternateNames : undefined,
      getSubtitle: (h) => getPantheonLabel(labels, h.pantheonId, "Hero"),
    }),
    ...searchItems(index.sources, normalizedQuery, {
      type: "source",
      getTitle: (s) => s.title,
      getSlug: (s) => s.id,
      getSearchFields: (s) => [
        { value: s.title, weight: 3 },
        { value: s.author || "", weight: 2 },
        { value: s.description, weight: 1 },
      ],
      getSubtitle: (s) => (s.author ? `Source · ${s.author}` : "Source"),
    }),
    ...searchItems(index.deities, normalizedQuery, {
      type: "deity",
      getTitle: (d) => d.name,
      getSlug: (d) => d.slug,
      getSearchFields: (d) => [
        { value: d.name, weight: 3 },
        { value: d.alternateNames?.join(" ") || "", weight: 2.5 },
        { value: d.domain?.join(" ") || "", weight: 1.5 },
        { value: d.symbols?.join(" ") || "", weight: 1.2 },
        { value: d.description, weight: 1 },
      ],
      getTradition: tradition,
      getAliases: aliasBonus ? (d) => d.alternateNames : undefined,
      getSubtitle: (d) => getPantheonLabel(labels, d.pantheonId, "Deity"),
    }),
    ...searchItems(index.stories, normalizedQuery, {
      type: "story",
      getTitle: (s) => s.title,
      getSlug: (s) => s.slug,
      getSearchFields: (s) => [
        { value: s.title, weight: 3 },
        { value: s.summary, weight: 1.5 },
        { value: s.category || "", weight: 1 },
      ],
      getTradition: tradition,
      getSubtitle: (s) => getPantheonLabel(labels, s.pantheonId, "Story"),
    }),
    ...searchItems(index.creatures, normalizedQuery, {
      type: "creature",
      getTitle: (c) => c.name,
      getSlug: (c) => c.slug,
      getSearchFields: (c) => [
        { value: c.name, weight: 3 },
        { value: c.description, weight: 1.5 },
        { value: c.habitat || "", weight: 1 },
      ],
      getTradition: tradition,
      getSubtitle: (c) =>
        c.habitat || getPantheonLabel(labels, c.pantheonId, "Creature"),
    }),
    ...searchItems(index.artifacts, normalizedQuery, {
      type: "artifact",
      getTitle: (a) => a.name,
      getSlug: (a) => a.slug,
      getSearchFields: (a) => [
        { value: a.name, weight: 3 },
        { value: a.description, weight: 1.5 },
        { value: a.type || "", weight: 1 },
      ],
      getTradition: tradition,
      getSubtitle: (a) =>
        a.type ? a.type.charAt(0).toUpperCase() + a.type.slice(1) : "Artifact",
    }),
    ...searchItems(index.locations, normalizedQuery, {
      type: "location",
      getTitle: (l) => l.name,
      getSlug: (l) => l.slug || l.id,
      getSearchFields: (l) => [
        { value: l.name, weight: 3 },
        { value: l.description, weight: 1.5 },
        { value: l.locationType || "", weight: 1 },
      ],
      getTradition: tradition,
      getSubtitle: (l) => {
        const pantheonName = tradition(l);
        const locationType = l.locationType?.replace("_", " ") || "";
        const capitalizedType =
          locationType.charAt(0).toUpperCase() + locationType.slice(1);
        return pantheonName
          ? `${pantheonName} ${capitalizedType}`
          : capitalizedType || "Location";
      },
    }),
  ];

  return results;
}

/**
 * Keep at most `perType` results of each content type, in score order, so a
 * topic query ("underworld") shows stories and places instead of a list
 * filled by one type.
 */
export function capPerType(
  results: SearchResult[],
  perType: number,
  limit: number,
): SearchResult[] {
  const seen = new Map<ContentType, number>();
  const kept: SearchResult[] = [];
  for (const result of results) {
    const count = seen.get(result.type) ?? 0;
    if (count >= perType) continue;
    seen.set(result.type, count + 1);
    kept.push(result);
    if (kept.length === limit) break;
  }
  return kept;
}

// Popular/trending searches - static list of common searches
const POPULAR_SEARCHES = [
  "Zeus",
  "Thor",
  "Odin",
  "Ragnarok",
  "Cerberus",
  "Olympus",
  "Athena",
  "Poseidon",
  "Hades",
  "Titanomachy",
];

/**
 * Get popular/trending search terms
 */
export function getPopularSearches(): string[] {
  return POPULAR_SEARCHES;
}

// LocalStorage key for recent searches
const RECENT_SEARCHES_KEY = "mythos-atlas-recent-searches";
const MAX_RECENT_SEARCHES = 10;

/**
 * Get recent searches from localStorage
 */
export function getRecentSearches(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is string => typeof entry === "string")
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

/**
 * Save a search term to recent searches
 */
export function saveRecentSearch(query: string): void {
  if (typeof window === "undefined" || !query.trim()) {
    return;
  }

  try {
    const recent = getRecentSearches();
    const normalized = query.trim();

    // Remove if already exists (to move to front)
    const filtered = recent.filter(
      (s) => s.toLowerCase() !== normalized.toLowerCase(),
    );

    // Add to front and limit
    const updated = [normalized, ...filtered].slice(0, MAX_RECENT_SEARCHES);

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Clear recent searches
 */
export function clearRecentSearches(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore localStorage errors
  }
}
