/** Longest meta description we emit; search results clip past about this. */
export const META_DESCRIPTION_MAX = 160;

const SENTENCE_END = /[.!?]["')\]]?(?=\s|$)/g;

/**
 * Fit text into a meta description without cutting a word in half.
 *
 * Prefers the last complete sentence that fits (no ellipsis, since nothing
 * reads as cut), then the last complete clause before a semicolon. Failing that, cuts at the last word boundary and appends an
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

  // A semicolon joins two complete clauses, so cutting there stays grammatical
  // and needs no ellipsis ("...entrance to the underworld;" -> "...underworld.").
  const semicolon = clean.slice(0, max).lastIndexOf(";");
  if (semicolon >= max * 0.6) return `${clean.slice(0, semicolon)}.`;

  // Reserve one character for the ellipsis.
  const window = clean.slice(0, max - 1);
  const lastSpace = window.lastIndexOf(" ");
  const cut = lastSpace > 0 ? window.slice(0, lastSpace) : window;
  return `${cut.replace(/[\s,;:\-–—]+$/, "")}…`;
}

/**
 * Snippet-ready description: names the entry first, then the entry's own text.
 *
 * Catalog descriptions are noun phrases ("The crater lake near Cumae..."), so a
 * result that matched the query "lake avernus" showed a snippet that never
 * said it. When the text opens with an article and does not already mention
 * `lead` near the start, the result reads "Lake Avernus: the crater lake...".
 * Text that opens any other way (a proper noun, an adjective) is left as is,
 * because lowercasing it could be wrong. `suffix` is reserved from the budget
 * so a trailing call to action is never the part that gets cut. `mentions`
 * is the shorter string that counts as already naming the entry (a hub whose
 * text says "Haudenosaunee" needs no "Haudenosaunee Mythology:" prefix).
 */
export function entryDescription(
  lead: string,
  text: string,
  {
    max = META_DESCRIPTION_MAX,
    suffix = "",
    mentions = lead,
  }: { max?: number; suffix?: string; mentions?: string } = {},
): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const mentionsLead = clean
    .slice(0, 60)
    .toLowerCase()
    .includes(mentions.toLowerCase());
  const article = /^(The|A|An) /.exec(clean);
  const body =
    !mentionsLead && article
      ? `${lead}: ${article[1].toLowerCase()}${clean.slice(article[1].length)}`
      : clean;
  const room = suffix ? max - suffix.length - 1 : max;
  const head = truncateDescription(body, room);
  return suffix ? `${head} ${suffix}` : head;
}
