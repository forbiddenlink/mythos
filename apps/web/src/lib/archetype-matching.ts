/**
 * Scoring for cross-pantheon archetype matching.
 *
 * Naive substring matching over deity prose produced false scholarship: "lightning"
 * matched the solar archetype via "light", "offspring" matched the spring/fertility
 * archetype, and the storm archetype pulled 58 of 190 deities including Hades. This
 * module fixes both halves of that problem:
 *
 *  - keywords must match whole words, not substrings;
 *  - where a keyword lands decides how much it counts. The curated `domain` taxonomy
 *    is authoritative, `symbols` are suggestive, and free-text description is only
 *    ever corroborating evidence that cannot by itself qualify a deity.
 */

/** A curated `domain` term is authoritative. */
export const DOMAIN_WEIGHT = 4;
/** A symbol is suggestive but not decisive. */
export const SYMBOL_WEIGHT = 2;
/** Free-text prose contributes at most this much, so it can never qualify alone. */
export const MAX_PROSE_CREDIT = 2;
/** Requires at least one domain hit, or a symbol corroborated by prose. */
export const MATCH_THRESHOLD = 4;

export interface ArchetypeCandidate {
  domain?: string[] | null;
  symbols?: string[] | null;
  description?: string | null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Compile keywords once per archetype rather than per deity. */
export function compileKeywordPatterns(keywords: readonly string[]): RegExp[] {
  return keywords.map(
    (keyword) => new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i"),
  );
}

/**
 * Score one deity against pre-compiled archetype keyword patterns.
 * Returns 0 when nothing matches; compare against MATCH_THRESHOLD to qualify.
 */
export function scoreArchetypeMatch(
  candidate: ArchetypeCandidate,
  patterns: readonly RegExp[],
): number {
  let score = 0;
  let proseHits = 0;

  for (const pattern of patterns) {
    if ((candidate.domain ?? []).some((value) => pattern.test(value))) {
      score += DOMAIN_WEIGHT;
    } else if ((candidate.symbols ?? []).some((value) => pattern.test(value))) {
      score += SYMBOL_WEIGHT;
    } else if (pattern.test(candidate.description ?? "")) {
      proseHits += 1;
    }
  }

  return score + Math.min(proseHits, MAX_PROSE_CREDIT);
}

/** Whether a score is strong enough to list the deity under the archetype. */
export function qualifies(score: number): boolean {
  return score >= MATCH_THRESHOLD;
}
