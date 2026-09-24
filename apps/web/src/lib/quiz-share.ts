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

/**
 * Quizzes that may appear in a share slug. Closed set: the id is rendered on
 * the page, so accepting an arbitrary prefix would let the URL write copy.
 */
export const QUIZ_LABELS = {
  relationships: "Divine Relationships Quiz",
} as const;

export type QuizId = keyof typeof QUIZ_LABELS;

const DEFAULT_QUIZ_LABEL = "Mythology Quiz";

export function quizLabel(quizId: string | undefined): string {
  if (quizId && quizId in QUIZ_LABELS) {
    return QUIZ_LABELS[quizId as QuizId];
  }
  return DEFAULT_QUIZ_LABEL;
}

export interface QuizResult {
  score: number;
  total: number;
  quizId?: QuizId;
}

export function formatQuizResultSlug(
  score: number,
  total: number,
  quizId?: QuizId,
): string {
  const tail = `${score}-of-${total}`;
  return quizId ? `${quizId}-${tail}` : tail;
}

export function quizResultPath(
  score: number,
  total: number,
  quizId?: QuizId,
): string {
  return `/quiz/result/${formatQuizResultSlug(score, total, quizId)}`;
}

export function parseQuizResultSlug(slug: string): QuizResult | null {
  const match = /^(?:([a-z]+)-)?(\d+)-of-(\d+)$/.exec(slug);
  if (!match) return null;

  const [, rawQuizId, rawScore, rawTotal] = match;

  if (rawQuizId !== undefined && !(rawQuizId in QUIZ_LABELS)) return null;

  const score = Number.parseInt(rawScore, 10);
  const total = Number.parseInt(rawTotal, 10);

  if (!Number.isFinite(score) || !Number.isFinite(total)) return null;
  if (total < 1 || total > MAX_QUIZ_LENGTH) return null;
  if (score < 0 || score > total) return null;

  return rawQuizId
    ? { score, total, quizId: rawQuizId as QuizId }
    : { score, total };
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
