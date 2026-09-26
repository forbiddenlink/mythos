/**
 * Cross-tradition parallel notes were written as catalog bookkeeping as well
 * as reader copy: "Zeus already lists Odin; both are ...", "(Ares already
 * lists Mars)". Readers should only see the comparison itself.
 */

// "Zeus already lists Odin; " / "The Kitchen God's entry already lists Hestia; "
const LEADING_CROSS_REFERENCE = /^[^;.()]{1,80}?\balready lists\b[^;.()]*;\s*/i;
// " (Ares already lists Mars)" / " (the Greek Apollo entry already lists this one)"
const PARENTHETICAL_CROSS_REFERENCE =
  /\s*\((?:[^()]*\balready list(?:s|ed)\b[^()]*)\)/gi;
// ", already listed as an alternate name"
const TRAILING_ALREADY_LISTED = /,\s*already listed as [^;.]*/gi;

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** A parallel note with editorial cross-reference wording removed. */
export function readableParallelNote(note: string): string {
  const cleaned = note
    .replace(LEADING_CROSS_REFERENCE, "")
    .replace(PARENTHETICAL_CROSS_REFERENCE, "")
    .replace(TRAILING_ALREADY_LISTED, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return capitalizeFirst(cleaned || note.trim());
}
