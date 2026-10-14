/** Longest meta description we emit; search results clip past about this. */
export const META_DESCRIPTION_MAX = 160;

const SENTENCE_END = /[.!?]["')\]]?(?=\s|$)/g;

/**
 * Fit text into a meta description without cutting a word in half.
 *
 * Prefers the last complete sentence that fits (no ellipsis, since nothing
 * reads as cut). Failing that, cuts at the last word boundary and appends an
 * ellipsis. Text that already fits is returned unchanged apart from collapsed
 * whitespace. The result is never longer than `max` characters.
 */
export function truncateDescription(
  text: string,
  max: number = META_DESCRIPTION_MAX,
): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  // Last sentence end inside the window, if it keeps at least half the budget.
  let sentenceEnd = -1;
  for (const match of clean.slice(0, max).matchAll(SENTENCE_END)) {
    sentenceEnd = match.index + match[0].length;
  }
  if (sentenceEnd >= max / 2) return clean.slice(0, sentenceEnd);

  // Reserve one character for the ellipsis.
  const window = clean.slice(0, max - 1);
  const lastSpace = window.lastIndexOf(" ");
  const cut = lastSpace > 0 ? window.slice(0, lastSpace) : window;
  return `${cut.replace(/[\s,;:\-–—]+$/, "")}…`;
}
