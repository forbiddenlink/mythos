/**
 * Corpus grounding for the Oracle: lexical + optional semantic retrieval,
 * locale-aware stopwords, and structured citations.
 */

import type { Locale } from "@/i18n/config";
import artifacts from "@/data/artifacts.json";
import creatures from "@/data/creatures.json";
import deities from "@/data/deities.json";
import locations from "@/data/locations.json";
import relationships from "@/data/relationships.json";
import stories from "@/data/stories.json";
import type { OracleCitation } from "@/lib/oracle/citations";
import { citationsFromHits } from "@/lib/oracle/citations";
import { getLocaleStopwords } from "@/lib/oracle/oracle-locale";
import { semanticSearchResults } from "@/lib/oracle/semantic";
import { getResultUrl, searchAll, type SearchResult } from "@/lib/search";

const MAX_RESULTS = 7;
const MAX_SNIPPET = 720;
const MAX_RELATIONSHIP_LINES = 12;

export interface OracleGroundingResult {
  context: string;
  hitCount: number;
  citations: OracleCitation[];
}

/** Tokens (length ≥3) used when the full sentence does not match entity names */
function searchPhrasesFromUserMessage(
  message: string,
  locale: Locale,
): string[] {
  const words =
    message.match(/[\p{L}\p{N}]+/gu)?.filter((w) => w.length >= 3) ?? [];
  const lowered = [...new Set(words.map((w) => w.toLowerCase()))];
  const stop = new Set([
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
    ...getLocaleStopwords(locale),
  ]);
  const keywords = lowered.filter((w) => !stop.has(w));
  const phrases = [message.trim(), ...keywords].filter((p) => p.length >= 2);
  return [...new Set(phrases)];
}

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
  const nameById = new Map(
    (deities as { id: string; name: string }[]).map((d) => [d.id, d.name]),
  );

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
    "FAMILY / RELATIONSHIP EDGES (from Mythos Atlas graph — use for ties between figures above):",
    ...lines,
  ].join("\n");
}

function snippetForResult(r: SearchResult): string | null {
  switch (r.type) {
    case "deity": {
      const d = (
        deities as {
          slug: string;
          description?: string;
          detailedBio?: string;
        }[]
      ).find((x) => x.slug === r.slug);
      if (!d) return null;
      const raw = d.detailedBio
        ? `${d.description ?? ""}\n${stripMarkdownish(d.detailedBio)}`
        : (d.description ?? "");
      return truncate(stripMarkdownish(raw), MAX_SNIPPET);
    }
    case "story": {
      const s = (
        stories as { slug: string; summary?: string; fullNarrative?: string }[]
      ).find((x) => x.slug === r.slug);
      if (!s) return null;
      const raw = s.fullNarrative
        ? `${s.summary ?? ""}\n${stripMarkdownish(s.fullNarrative)}`
        : (s.summary ?? "");
      return truncate(stripMarkdownish(raw), MAX_SNIPPET);
    }
    case "creature": {
      const c = (creatures as { slug: string; description?: string }[]).find(
        (x) => x.slug === r.slug,
      );
      return c?.description ? truncate(c.description, MAX_SNIPPET) : null;
    }
    case "artifact": {
      const a = (
        artifacts as { slug: string; description?: string; powers?: string[] }[]
      ).find((x) => x.slug === r.slug);
      if (!a) return null;
      const extra = a.powers?.length ? ` Powers: ${a.powers.join(", ")}.` : "";
      return truncate(`${a.description ?? ""}${extra}`, MAX_SNIPPET);
    }
    case "location": {
      const l = (
        locations as {
          id: string;
          slug?: string;
          name: string;
          description?: string;
        }[]
      ).find((x) => (x.slug ?? x.id) === r.slug);
      return l?.description ? truncate(l.description, MAX_SNIPPET) : null;
    }
    default:
      return null;
  }
}

function collectLexicalHits(query: string, locale: Locale): SearchResult[] {
  const q = query.trim();
  if (q.length < 2) return [];

  const phrases = searchPhrasesFromUserMessage(q, locale);
  const seen = new Set<string>();
  const hits: SearchResult[] = [];

  for (const phrase of phrases) {
    for (const h of searchAll(phrase, MAX_RESULTS)) {
      const key = `${h.type}:${h.slug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push(h);
      if (hits.length >= MAX_RESULTS) break;
    }
    if (hits.length >= MAX_RESULTS) break;
  }

  return hits;
}

function mergeHits(
  lexical: SearchResult[],
  semantic: SearchResult[],
  max: number,
): SearchResult[] {
  const seen = new Set<string>();
  const out: SearchResult[] = [];
  for (const h of [...lexical, ...semantic]) {
    const key = `${h.type}:${h.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(h);
    if (out.length >= max) break;
  }
  return out;
}

async function collectMergedHits(
  query: string,
  locale: Locale,
): Promise<SearchResult[]> {
  const lexical = collectLexicalHits(query, locale);
  const room = Math.max(0, MAX_RESULTS - lexical.length);
  const semantic = room > 0 ? await semanticSearchResults(query, room) : [];
  return mergeHits(lexical, semantic, MAX_RESULTS);
}

/**
 * Full grounding bundle: encyclopedia snippets, optional relationship graph lines, citations.
 */
export async function getOracleGrounding(
  query: string,
  options: { locale: Locale },
): Promise<OracleGroundingResult> {
  const q = query.trim();
  if (q.length < 2) {
    return { context: "", hitCount: 0, citations: [] };
  }

  const hits = await collectMergedHits(q, options.locale);
  if (hits.length === 0) {
    return { context: "", hitCount: 0, citations: [] };
  }

  const citations = citationsFromHits(hits);
  const blocks: string[] = [];

  for (const hit of hits) {
    const path = getResultUrl(hit);
    const pantheon = hit.subtitle;
    const body = snippetForResult(hit);
    if (!body) continue;

    blocks.push(
      [
        `• ${hit.title} (${hit.type})`,
        `  Path: ${path}`,
        pantheon ? `  Context: ${pantheon}` : "",
        `  Summary: ${body}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  if (blocks.length === 0) {
    return { context: "", hitCount: 0, citations: [] };
  }

  const relBlock = relationshipHintsForDeityHits(hits);

  const context = [
    "REFERENCE (from Mythos Atlas — prefer these facts when they apply; paths are site routes):",
    ...blocks,
    relBlock,
    "",
    "If the question is not covered here, draw on general mythological knowledge and stay concise.",
  ].join("\n");

  return {
    context,
    hitCount: blocks.length,
    citations,
  };
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
