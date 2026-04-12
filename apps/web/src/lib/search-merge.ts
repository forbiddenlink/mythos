import type { SearchResult } from "@/lib/search";

const keyOf = (r: SearchResult) => `${r.type}:${r.slug}`;

/**
 * Merge lexical (substring) and semantic (embedding) hits: dedupe by entity,
 * prefer higher matchScore. Semantic scores are on a different scale (cosine×1000)
 * so we offset lexical results to avoid drowning them when both exist.
 */
export function mergeLexicalAndSemantic(
  lexical: SearchResult[],
  semantic: SearchResult[],
  limit: number,
): SearchResult[] {
  const lexicalBoost = 5;
  const adjustedLexical = lexical.map((r) => ({
    ...r,
    matchScore: r.matchScore + lexicalBoost,
  }));

  const map = new Map<string, SearchResult>();

  for (const r of adjustedLexical) {
    map.set(keyOf(r), r);
  }

  for (const r of semantic) {
    const k = keyOf(r);
    const existing = map.get(k);
    if (!existing || r.matchScore > existing.matchScore) {
      map.set(k, r);
    }
  }

  return [...map.values()]
    .toSorted((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
