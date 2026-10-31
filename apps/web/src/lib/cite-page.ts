/**
 * Citation strings for a page. No author and no publication date are recorded
 * for any page, so every format uses "n.d." and the date the reader accessed
 * it. The site name stands in as the corporate author only where a format
 * needs an author slot (Chicago). Never read the JSON-LD date defaults: they
 * are placeholders, not real dates.
 */

export interface AccessedDate {
  year: number;
  /** 1-12 */
  month: number;
  day: number;
}

export interface CitationInput {
  title: string;
  url: string;
  siteName: string;
  accessed: AccessedDate;
}

export interface Citations {
  mla: string;
  apa: string;
  chicago: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MLA_MONTHS = [
  "Jan.",
  "Feb.",
  "Mar.",
  "Apr.",
  "May",
  "June",
  "July",
  "Aug.",
  "Sept.",
  "Oct.",
  "Nov.",
  "Dec.",
];

/** Ends a title with a period unless it already ends in terminal punctuation. */
function withPeriod(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

export function formatCitations({
  title,
  url,
  siteName,
  accessed,
}: CitationInput): Citations {
  const { year, month, day } = accessed;
  const longDate = `${MONTHS[month - 1]} ${day}, ${year}`;
  const quotedTitle = `"${withPeriod(title)}"`;

  return {
    mla: `${quotedTitle} ${siteName}, n.d., ${url}. Accessed ${day} ${MLA_MONTHS[month - 1]} ${year}.`,
    apa: `${withPeriod(title)} (n.d.). ${siteName}. Retrieved ${longDate}, from ${url}`,
    chicago: `${withPeriod(siteName)} ${quotedTitle} n.d. Accessed ${longDate}. ${url}.`,
  };
}
