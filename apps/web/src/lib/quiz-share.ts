/**
 * Shareable quiz results.
 *
 * A score lives in the URL path rather than a query string because Next's
 * `opengraph-image` convention receives route params only — a social crawler
 * never sends the query string, so a query-based score silently renders the
 * default card and the share loop carries no score at all.
 */

/** Longest quiz the route will describe; keeps the segment from being abused. */
export const MAX_QUIZ_LENGTH = 100;

export interface QuizResult {
  score: number;
  total: number;
}

export function formatQuizResultSlug(score: number, total: number): string {
  return `${score}-of-${total}`;
}

export function quizResultPath(score: number, total: number): string {
  return `/quiz/result/${formatQuizResultSlug(score, total)}`;
}

export function parseQuizResultSlug(slug: string): QuizResult | null {
  const match = /^(\d+)-of-(\d+)$/.exec(slug);
  if (!match) return null;

  const score = Number.parseInt(match[1], 10);
  const total = Number.parseInt(match[2], 10);

  if (!Number.isFinite(score) || !Number.isFinite(total)) return null;
  if (total < 1 || total > MAX_QUIZ_LENGTH) return null;
  if (score < 0 || score > total) return null;

  return { score, total };
}

export interface QuizVerdict {
  title: string;
  blurb: string;
}

/**
 * Verdicts are keyed off the percentage so a ten-question quiz and a
 * twenty-question quiz read consistently.
 */
export function quizResultVerdict(score: number, total: number): QuizVerdict {
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  if (percent === 100) {
    return {
      title: "Oracle of Delphi",
      blurb: "A perfect reading. Nothing in the myths escaped you.",
    };
  }
  if (percent >= 80) {
    return {
      title: "Keeper of the Sagas",
      blurb: "You know these stories the way the poets meant them to be known.",
    };
  }
  if (percent >= 60) {
    return {
      title: "Wandering Scholar",
      blurb: "A solid grounding, with a few corners of the map still dark.",
    };
  }
  if (percent >= 40) {
    return {
      title: "Curious Initiate",
      blurb: "The outline is there. The detail is where the myths get good.",
    };
  }
  return {
    title: "Mortal Among Gods",
    blurb: "Everyone starts here. The stories are worth the second attempt.",
  };
}
