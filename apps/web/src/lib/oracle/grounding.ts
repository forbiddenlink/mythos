/**
 * Corpus grounding for the Oracle.
 *
 * Keyword grounding is primary:
 *   1. exact entity-name / alias matches (Jupiter, Ulysses, Jove…),
 *   2. cross-pantheon counterparts when the question asks for them
 *      ("Roman equivalent of Persephone" → Proserpina),
 *   3. fuzzy lexical search over the whole catalog,
 *   4. stories featuring the matched figures.
 * Semantic retrieval (precomputed embeddings) only fills remaining slots and
 * is skipped entirely when no embeddings are bundled.
 *
 * Returns the REFERENCE block for the system prompt plus structured citations:
 * entity pages and primary sources (title + locator) from the same snippets.
 */

import type { Locale } from "@/i18n/config";
import artifacts from "@/data/artifacts.json";
import creatures from "@/data/creatures.json";
import deities from "@/data/deities.json";
import locations from "@/data/locations.json";
import relationships from "@/data/relationships.json";
import stories from "@/data/stories.json";
import heroes from "@/data/heroes.json";
import sources from "@/data/sources.json";
import {
  type CatalogSourceFields,
  citationsFromHits,
  dedupePrimarySources,
  formatPrimarySource,
  type OracleCitation,
  type OraclePrimarySource,
  primarySourcesFromRecord,
} from "@/lib/oracle/citations";
import { getLocaleStopwords } from "@/lib/oracle/oracle-locale";
import {
  isSemanticGroundingAvailable,
  semanticSearchResults,
} from "@/lib/oracle/semantic";
import { getResultUrl, searchAll, type SearchResult } from "@/lib/search";

const MAX_RESULTS = 7;
const MAX_SNIPPET = 720;
const MAX_RELATIONSHIP_LINES = 12;
const MAX_PRIMARY_SOURCES_PER_HIT = 3;
const MAX_PARALLELS_PER_DEITY = 2;
const MAX_STORY_EXPANSIONS = 2;
/** searchAll score for a whole-word match in a description (see lib/search.ts). */
const MIN_LEXICAL_SCORE = 60;
const LEXICAL_CANDIDATES_PER_PHRASE = 20;

export interface OracleGroundingResult {
  context: string;
  hitCount: number;
  citations: OracleCitation[];
  primarySources: OraclePrimarySource[];
}

const EMPTY_GROUNDING: OracleGroundingResult = {
  context: "",
  hitCount: 0,
  citations: [],
  primarySources: [],
};

// ---------------------------------------------------------------------------
// Catalog views
// ---------------------------------------------------------------------------

interface DeityRow extends CatalogSourceFields {
  id: string;
  slug: string;
  name: string;
  pantheonId?: string;
  alternateNames?: string[];
  description?: string;
  detailedBio?: string;
  crossPantheonParallels?: Array<{ pantheonId?: string; deityId?: string }>;
}
interface HeroRow extends CatalogSourceFields {
  id: string;
  slug: string;
  name: string;
  pantheonId?: string;
  alternateNames?: string[];
  description?: string;
  detailedBio?: string;
}
interface StoryRow extends CatalogSourceFields {
  id: string;
  slug: string;
  title: string;
  pantheonId?: string;
  summary?: string;
  fullNarrative?: string;
  featuredDeities?: string[];
  featuredHeroes?: string[];
}
interface NamedRow extends CatalogSourceFields {
  id: string;
  slug?: string;
  name: string;
  pantheonId?: string;
  description?: string;
  powers?: string[];
}
interface SourceRow {
  id: string;
  title: string;
  author?: string;
  description: string;
}

const deityRows = deities as DeityRow[];
const heroRows = heroes as HeroRow[];
const storyRows = stories as StoryRow[];
const creatureRows = creatures as NamedRow[];
const artifactRows = artifacts as NamedRow[];
const locationRows = locations as NamedRow[];
const sourceRows = sources as SourceRow[];

const knownSourceIds = new Set(sourceRows.map((s) => s.id));

const PANTHEON_LABELS: Record<string, string> = {
  "greek-pantheon": "Greek",
  "roman-pantheon": "Roman",
  "norse-pantheon": "Norse",
  "egyptian-pantheon": "Egyptian",
  "hindu-pantheon": "Hindu",
  "japanese-pantheon": "Japanese",
  "celtic-pantheon": "Celtic",
  "mesopotamian-pantheon": "Mesopotamian",
};

function pantheonLabel(pantheonId: string | undefined, kind: string): string {
  const name = pantheonId ? PANTHEON_LABELS[pantheonId] : undefined;
  return name ? `${name} ${kind}` : kind;
}

// ---------------------------------------------------------------------------
// Exact name / alias index
// ---------------------------------------------------------------------------

interface AliasEntry {
  result: SearchResult;
  /** Lower-cased alias as written in the catalog. */
  alias: string;
}

function toResult(
  type: SearchResult["type"],
  id: string,
  slug: string,
  title: string,
  subtitle: string,
): SearchResult {
  return { type, id, slug, title, subtitle, matchScore: 1000 };
}

function normalizeName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

let aliasIndex: Map<string, AliasEntry[]> | null = null;

function buildAliasIndex(): Map<string, AliasEntry[]> {
  const index = new Map<string, AliasEntry[]>();
  const add = (alias: string | undefined, result: SearchResult) => {
    if (!alias) return;
    const key = normalizeName(alias);
    if (key.length < 2) return;
    const list = index.get(key) ?? [];
    if (
      !list.some(
        (e) => e.result.type === result.type && e.result.slug === result.slug,
      )
    ) {
      list.push({ result, alias: key });
    }
    index.set(key, list);
  };

  for (const d of deityRows) {
    const r = toResult(
      "deity",
      d.id,
      d.slug,
      d.name,
      pantheonLabel(d.pantheonId, "Deity"),
    );
    add(d.name, r);
    for (const a of d.alternateNames ?? []) add(a, r);
  }
  for (const h of heroRows) {
    const r = toResult(
      "hero",
      h.id,
      h.slug,
      h.name,
      pantheonLabel(h.pantheonId, "Hero"),
    );
    add(h.name, r);
    for (const a of h.alternateNames ?? []) add(a, r);
  }
  for (const c of creatureRows) {
    add(
      c.name,
      toResult(
        "creature",
        c.id,
        c.slug ?? c.id,
        c.name,
        pantheonLabel(c.pantheonId, "Creature"),
      ),
    );
  }
  for (const a of artifactRows) {
    add(a.name, toResult("artifact", a.id, a.slug ?? a.id, a.name, "Artifact"));
  }
  for (const l of locationRows) {
    add(
      l.name,
      toResult(
        "location",
        l.id,
        l.slug ?? l.id,
        l.name,
        pantheonLabel(l.pantheonId, "Location"),
      ),
    );
  }
  for (const s of storyRows) {
    add(
      s.title,
      toResult(
        "story",
        s.id,
        s.slug,
        s.title,
        pantheonLabel(s.pantheonId, "Story"),
      ),
    );
  }
  for (const s of sourceRows) {
    add(
      s.title,
      toResult(
        "source",
        s.id,
        s.id,
        s.title,
        s.author ? `Source · ${s.author}` : "Source",
      ),
    );
  }
  return index;
}

function getAliasIndex(): Map<string, AliasEntry[]> {
  aliasIndex ??= buildAliasIndex();
  return aliasIndex;
}

/**
 * Entities whose name or alias appears verbatim in the question (1–4 word
 * n-grams). Very short names (Ra, Set, Nut, Sin…) collide with ordinary words,
 * so they only match when written capitalised in the question.
 */
export function exactNameMatches(query: string): SearchResult[] {
  const rawTokens = query.match(/[\p{L}\p{N}'-]+/gu) ?? [];
  const tokens = rawTokens.map((t) => normalizeName(t.replace(/'s$/i, "")));
  const index = getAliasIndex();
  const out: SearchResult[] = [];
  const seen = new Set<string>();

  // Longest n-grams first so "Golden Fleece" outranks "Fleece".
  for (let n = 4; n >= 1; n--) {
    for (let i = 0; i + n <= tokens.length; i++) {
      const phrase = tokens.slice(i, i + n).join(" ");
      const entries = index.get(phrase);
      if (!entries) continue;
      if (n === 1 && phrase.length <= 4) {
        const original = rawTokens[i] ?? "";
        if (!/^\p{Lu}/u.test(original)) continue;
      }
      for (const { result } of entries) {
        const key = `${result.type}:${result.slug}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(result);
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Cross-pantheon counterparts and story expansion
// ---------------------------------------------------------------------------

const COMPARISON_RE =
  /\b(equivalents?|counterparts?|parallels?|compare[sd]?|comparison|similar|similarit(?:y|ies)|same (?:god|goddess|deity)|roman|greek|norse|egyptian|hindu|celtic|japanese|mesopotamian|equivalente|équivalent|entsprechung|pendant)\b/i;

const PANTHEON_WORDS: Record<string, string> = {
  roman: "roman-pantheon",
  greek: "greek-pantheon",
  norse: "norse-pantheon",
  egyptian: "egyptian-pantheon",
  hindu: "hindu-pantheon",
  celtic: "celtic-pantheon",
  japanese: "japanese-pantheon",
  mesopotamian: "mesopotamian-pantheon",
};

function parallelDeities(
  query: string,
  matched: SearchResult[],
): SearchResult[] {
  if (!COMPARISON_RE.test(query)) return [];
  const lowered = query.toLowerCase();
  const wanted = new Set(
    Object.entries(PANTHEON_WORDS)
      .filter(([word]) => lowered.includes(word))
      .map(([, id]) => id),
  );

  const out: SearchResult[] = [];
  for (const hit of matched) {
    if (hit.type !== "deity") continue;
    const deity = deityRows.find((d) => d.slug === hit.slug);
    const parallels = (deity?.crossPantheonParallels ?? []).filter(
      (p) => !wanted.size || (p.pantheonId && wanted.has(p.pantheonId)),
    );
    for (const p of parallels.slice(0, MAX_PARALLELS_PER_DEITY)) {
      const other = deityRows.find((d) => d.id === p.deityId);
      if (!other) continue;
      out.push(
        toResult(
          "deity",
          other.id,
          other.slug,
          other.name,
          pantheonLabel(other.pantheonId, "Deity"),
        ),
      );
    }
  }
  return out;
}

function storiesFeaturing(matched: SearchResult[]): SearchResult[] {
  const deityIds = new Set(
    matched.filter((h) => h.type === "deity").map((h) => h.id),
  );
  const heroIds = new Set(
    matched.filter((h) => h.type === "hero").map((h) => h.id),
  );
  if (deityIds.size === 0 && heroIds.size === 0) return [];

  const out: SearchResult[] = [];
  for (const s of storyRows) {
    const features =
      (s.featuredHeroes ?? []).some((id) => heroIds.has(id)) ||
      (s.featuredDeities ?? []).some((id) => deityIds.has(id));
    if (!features) continue;
    out.push(
      toResult(
        "story",
        s.id,
        s.slug,
        s.title,
        pantheonLabel(s.pantheonId, "Story"),
      ),
    );
    if (out.length >= MAX_STORY_EXPANSIONS) break;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Lexical search
// ---------------------------------------------------------------------------

const CORE_STOPWORDS = [
  "the",
  "and",
  "for",
  "who",
  "what",
  "when",
  "where",
  "why",
  "how",
  "tell",
  "about",
  "from",
  "with",
  "that",
  "this",
  "are",
  "was",
  "were",
  "been",
  "have",
  "has",
  "does",
  "did",
  "most",
  "some",
  "any",
  "qui",
  "que",
  "qué",
  "cómo",
  "como",
  "pour",
  "avec",
  "dans",
  "est",
  "son",
  "und",
  "der",
  "die",
  "das",
  "ist",
  "wie",
  "aus",
  "bei",
  // Generic question and domain words that match most of the catalog.
  "can",
  "you",
  "write",
  "please",
  "which",
  "their",
  "they",
  "them",
  "his",
  "her",
  "its",
  "into",
  "would",
  "could",
  "should",
  "will",
  "name",
  "both",
  "associated",
  "according",
  "today",
  "myth",
  "myths",
  "mythology",
  "god",
  "gods",
  "goddess",
  "deity",
  "deities",
  "story",
  "stories",
  "legend",
];

/** Tokens (length ≥3) used when the full sentence does not match entity names */
function searchPhrasesFromUserMessage(
  message: string,
  locale: Locale,
): string[] {
  const words =
    message.match(/[\p{L}\p{N}]+/gu)?.filter((w) => w.length >= 3) ?? [];
  const lowered = [...new Set(words.map((w) => w.toLowerCase()))];
  const stop = new Set([...CORE_STOPWORDS, ...getLocaleStopwords(locale)]);
  const keywords = lowered.filter((w) => !stop.has(w));
  const phrases = [message.trim(), ...keywords].filter((p) => p.length >= 2);
  return [...new Set(phrases)];
}

/**
 * Lexical hits ranked across all keywords: an entity matching several of the
 * question's keywords ("Norse" + "death" -> Hel) outranks one that strongly
 * matches a single generic word.
 */
function collectLexicalHits(
  query: string,
  locale: Locale,
  limit: number,
): SearchResult[] {
  const phrases = searchPhrasesFromUserMessage(query, locale);
  const scored = new Map<
    string,
    { hit: SearchResult; keywords: number; total: number }
  >();

  for (const phrase of phrases) {
    for (const h of searchAll(phrase, LEXICAL_CANDIDATES_PER_PHRASE)) {
      // Drop bare substring hits in body text ("sort" inside "resort"): they
      // are the main source of irrelevant grounding for off-topic questions.
      if (h.matchScore < MIN_LEXICAL_SCORE) continue;
      const key = `${h.type}:${h.slug}`;
      const entry = scored.get(key) ?? { hit: h, keywords: 0, total: 0 };
      entry.keywords += 1;
      entry.total += h.matchScore;
      scored.set(key, entry);
    }
  }

  return [...scored.values()]
    .sort((a, b) => b.keywords - a.keywords || b.total - a.total)
    .slice(0, limit)
    .map((e) => e.hit);
}

function mergeHits(groups: SearchResult[][], max: number): SearchResult[] {
  const seen = new Set<string>();
  const out: SearchResult[] = [];
  for (const group of groups) {
    for (const h of group) {
      const key = `${h.type}:${h.slug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(h);
      if (out.length >= max) return out;
    }
  }
  return out;
}

async function collectHits(
  query: string,
  locale: Locale,
): Promise<SearchResult[]> {
  const direct = exactNameMatches(query);
  const parallels = parallelDeities(query, direct);
  const lexical = collectLexicalHits(query, locale, MAX_RESULTS);
  const featured = storiesFeaturing(direct);

  const keyword = mergeHits(
    [direct, parallels, lexical, featured],
    MAX_RESULTS,
  );
  const room = MAX_RESULTS - keyword.length;
  if (room <= 0 || !isSemanticGroundingAvailable()) return keyword;

  const semantic = await semanticSearchResults(query, room);
  return mergeHits([keyword, semantic], MAX_RESULTS);
}

// ---------------------------------------------------------------------------
// Snippets
// ---------------------------------------------------------------------------

function stripMarkdownish(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function formatRelationshipType(raw: string): string {
  return raw.replace(/_/g, " ");
}

function relationshipHintsForDeityHits(hits: SearchResult[]): string {
  const deityIds = hits.filter((h) => h.type === "deity").map((h) => h.id);
  if (deityIds.length === 0) return "";

  const idSet = new Set(deityIds);
  const nameById = new Map(deityRows.map((d) => [d.id, d.name]));

  const lines: string[] = [];
  const seenPair = new Set<string>();

  for (const rel of relationships as {
    fromDeityId: string;
    toDeityId: string;
    relationshipType: string;
  }[]) {
    if (lines.length >= MAX_RELATIONSHIP_LINES) break;

    const touches = idSet.has(rel.fromDeityId) || idSet.has(rel.toDeityId);
    if (!touches) continue;

    const a = rel.fromDeityId;
    const b = rel.toDeityId;
    const key = [a, b].sort().join("|") + rel.relationshipType;
    if (seenPair.has(key)) continue;
    seenPair.add(key);

    const nameA = nameById.get(a) ?? a;
    const nameB = nameById.get(b) ?? b;
    lines.push(
      `• ${nameA} — ${formatRelationshipType(rel.relationshipType)} — ${nameB}`,
    );
  }

  if (lines.length === 0) return "";

  return [
    "",
    "FAMILY / RELATIONSHIP EDGES (from the Mythos Atlas graph — use for ties between figures above):",
    ...lines,
  ].join("\n");
}

interface Snippet {
  body: string;
  primarySources: OraclePrimarySource[];
}

function recordFor(
  r: SearchResult,
): (CatalogSourceFields & Record<string, unknown>) | null {
  switch (r.type) {
    case "hero":
      return (heroRows.find((x) => x.slug === r.slug) as never) ?? null;
    case "deity":
      return (deityRows.find((x) => x.slug === r.slug) as never) ?? null;
    case "story":
      return (storyRows.find((x) => x.slug === r.slug) as never) ?? null;
    case "creature":
      return (
        (creatureRows.find((x) => (x.slug ?? x.id) === r.slug) as never) ?? null
      );
    case "artifact":
      return (
        (artifactRows.find((x) => (x.slug ?? x.id) === r.slug) as never) ?? null
      );
    case "location":
      return (
        (locationRows.find((x) => (x.slug ?? x.id) === r.slug) as never) ?? null
      );
    default:
      return null;
  }
}

function snippetForResult(r: SearchResult): Snippet | null {
  if (r.type === "source") {
    const source = sourceRows.find((item) => item.id === r.slug);
    if (!source) return null;
    return {
      body: truncate(
        `${source.title}${source.author ? ` — ${source.author}` : ""}: ${source.description}`,
        MAX_SNIPPET,
      ),
      primarySources: [
        {
          title: source.author
            ? `${source.author}, ${source.title}`
            : source.title,
          path: `/sources/${source.id}`,
        },
      ],
    };
  }

  const record = recordFor(r);
  if (!record) return null;

  let raw = "";
  if (r.type === "hero" || r.type === "deity") {
    const d = record as unknown as DeityRow;
    raw = d.detailedBio
      ? `${d.description ?? ""}\n${stripMarkdownish(d.detailedBio)}`
      : (d.description ?? "");
  } else if (r.type === "story") {
    const s = record as unknown as StoryRow;
    raw = s.fullNarrative
      ? `${s.summary ?? ""}\n${stripMarkdownish(s.fullNarrative)}`
      : (s.summary ?? "");
  } else if (r.type === "artifact") {
    const a = record as unknown as NamedRow;
    const extra = a.powers?.length ? ` Powers: ${a.powers.join(", ")}.` : "";
    raw = `${a.description ?? ""}${extra}`;
  } else {
    raw = (record as unknown as NamedRow).description ?? "";
  }

  const body = truncate(stripMarkdownish(raw), MAX_SNIPPET);
  if (!body) return null;

  return {
    body,
    primarySources: dedupePrimarySources(
      primarySourcesFromRecord(record, knownSourceIds),
      MAX_PRIMARY_SOURCES_PER_HIT,
    ),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Full grounding bundle: encyclopedia snippets, relationship graph lines,
 * entity citations and primary sources.
 */
export async function getOracleGrounding(
  query: string,
  options: { locale: Locale },
): Promise<OracleGroundingResult> {
  const q = query.trim();
  if (q.length < 2) return EMPTY_GROUNDING;

  const hits = await collectHits(q, options.locale);
  if (hits.length === 0) return EMPTY_GROUNDING;

  const usedHits: SearchResult[] = [];
  const blocks: string[] = [];
  const primary: OraclePrimarySource[] = [];

  for (const hit of hits) {
    const snippet = snippetForResult(hit);
    if (!snippet) continue;
    usedHits.push(hit);
    primary.push(...snippet.primarySources);

    blocks.push(
      [
        `• ${hit.title} (${hit.type})`,
        `  Path: ${getResultUrl(hit)}`,
        hit.subtitle ? `  Context: ${hit.subtitle}` : "",
        `  Summary: ${snippet.body}`,
        snippet.primarySources.length
          ? `  Primary sources: ${snippet.primarySources.map(formatPrimarySource).join("; ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  if (blocks.length === 0) return EMPTY_GROUNDING;

  const context = [
    "REFERENCE (from Mythos Atlas — the ONLY facts you may use; Path values are site routes you can link):",
    ...blocks,
    relationshipHintsForDeityHits(usedHits),
  ]
    .filter((line) => line !== "")
    .join("\n");

  return {
    context,
    hitCount: blocks.length,
    citations: citationsFromHits(usedHits),
    primarySources: dedupePrimarySources(primary),
  };
}

/**
 * Ground a conversation. When the latest user message names no catalog entity
 * (typically a follow-up such as "and his children?"), the previous user
 * message is prepended so the topic carries over; fuzzy matches on the
 * follow-up's own words alone would otherwise crowd the topic out.
 */
export async function getOracleGroundingForConversation(
  messages: ReadonlyArray<{ role: string; content: string }>,
  options: { locale: Locale },
): Promise<OracleGroundingResult> {
  const userTurns = messages.filter((m) => m.role === "user" && m.content);
  const latest = userTurns.at(-1)?.content ?? "";
  const previous = userTurns.at(-2)?.content;
  if (!previous || exactNameMatches(latest).length > 0) {
    return getOracleGrounding(latest, options);
  }
  return getOracleGrounding(`${previous}\n${latest}`, options);
}

export async function buildOracleGroundingContext(
  query: string,
  options: { locale: Locale },
): Promise<string> {
  return (await getOracleGrounding(query, options)).context;
}

export function lastUserMessageText(
  messages: Array<{ role: string; content: string }>,
): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "user" && messages[i].content) {
      return messages[i].content;
    }
  }
  return "";
}
