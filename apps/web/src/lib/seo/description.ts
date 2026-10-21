/** Longest meta description we emit; search results clip past about this. */
export const META_DESCRIPTION_MAX = 160;

const SENTENCE_END = /[.!?]["')\]]?(?=\s|$)/g;
const DANGLING = new Set([
  "and",
  "or",
  "but",
  "the",
  "of",
  "a",
  "an",
  "to",
  "in",
  "on",
  "at",
  "by",
  "for",
  "with",
  "from",
  "as",
  "that",
  "which",
  "who",
  "whose",
  "into",
  "than",
]);

function endWithPeriod(text: string): string {
  const trimmed = text.replace(/[\s,;:\u2013\u2014\-.]+$/, "");
  return `${trimmed}.`;
}

/**
 * Fit text into a meta description. Never emits an ellipsis: a snippet that
 * trails off reads as a bug.
 *
 * Cuts, in order, at the last complete sentence, then at the last clause
 * boundary (; , : or a dash, which becomes a period), then at the last word
 * boundary, dropping a dangling word ("and", "the", "of"...) and ending with a
 * period. A boundary must keep at least half the budget. Text that already
 * fits is returned unchanged apart from collapsed whitespace. The result is
 * never longer than `max` characters.
 */
export function truncateDescription(
  text: string,
  max: number = META_DESCRIPTION_MAX,
): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const window = clean.slice(0, max);

  let sentenceEnd = -1;
  for (const match of window.matchAll(SENTENCE_END)) {
    sentenceEnd = match.index + match[0].length;
  }
  if (sentenceEnd >= max / 2) return clean.slice(0, sentenceEnd);

  // Prefer a strong break (; : dash) that keeps most of the budget, then a
  // comma that keeps half. The period replacing the break takes its place.
  const lastMatch = (re: RegExp): number => {
    let at = -1;
    for (const match of window.matchAll(re)) at = match.index;
    return at;
  };
  const strong = lastMatch(/[;:\u2013\u2014]/g);
  if (strong >= max * 0.6) return endWithPeriod(clean.slice(0, strong));
  const comma = lastMatch(/,/g);
  if (comma >= max / 2) return endWithPeriod(clean.slice(0, comma));

  // Leave one character for the closing period.
  const room = clean.slice(0, max - 1);
  const space = room.lastIndexOf(" ");
  const base =
    clean[max - 1] === " " || space <= 0 ? room : room.slice(0, space);
  const words = base.replace(/[\s,;:\u2013\u2014\-]+$/, "").split(" ");
  while (words.length > 1 && DANGLING.has(words.at(-1)!.toLowerCase())) {
    words.pop();
  }
  return endWithPeriod(words.join(" "));
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
  // The counts are their own sentence, so the text before them must be whole.
  return suffix
    ? `${/[.!?]$/.test(head) ? head : endWithPeriod(head)} ${suffix}`
    : head;
}
