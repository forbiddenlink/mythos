/**
 * Citation strings for a page. No publication date is recorded for any page,
 * so every format uses "n.d." and the date the reader accessed it. Pages that
 * render the editorial byline pass its author; a page without one gets the
 * site name as corporate author in Chicago only. Never read the JSON-LD date
 * defaults: they are placeholders, not real dates.
 */

export interface AccessedDate {
  year: number;
  /** 1-12 */
  month: number;
  day: number;
}

export interface CitationAuthor {
  given: string;
  family: string;
}

export interface CitationInput {
  title: string;
  url: string;
  siteName: string;
  accessed: AccessedDate;
  /** Only when the page itself credits this person. */
  author?: CitationAuthor;
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
  author,
}: CitationInput): Citations {
  const { year, month, day } = accessed;
  const longDate = `${MONTHS[month - 1]} ${day}, ${year}`;
  const quotedTitle = `"${withPeriod(title)}"`;

  const mlaLead = author
    ? `${withPeriod(`${author.family}, ${author.given}`)} ${quotedTitle}`
    : quotedTitle;
  const apaLead = author
    ? `${author.family}, ${author.given.charAt(0)}. (n.d.). ${withPeriod(title)}`
    : `${withPeriod(title)} (n.d.).`;
  const chicagoLead = author
    ? `${withPeriod(`${author.family}, ${author.given}`)} ${quotedTitle} ${withPeriod(siteName)}`
    : `${withPeriod(siteName)} ${quotedTitle}`;

  return {
    mla: `${mlaLead} ${siteName}, n.d., ${url}. Accessed ${day} ${MLA_MONTHS[month - 1]} ${year}.`,
    apa: `${apaLead} ${siteName}. Retrieved ${longDate}, from ${url}`,
    chicago: `${chicagoLead} n.d. Accessed ${longDate}. ${url}.`,
  };
}

/** The person EditorialByline credits ("By Elizabeth Stein for Mythos Atlas"). */
export const EDITORIAL_AUTHOR: CitationAuthor = {
  given: "Elizabeth",
  family: "Stein",
};
