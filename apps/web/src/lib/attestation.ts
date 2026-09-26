/**
 * Source-record helpers — summarize the dated works recorded in the catalog for
 * a deity. These are catalog signals, not claims about independent
 * corroboration or the first surviving mention of a figure.
 */

export interface PrimarySource {
  text: string;
  source: string;
  date?: string;
}

/**
 * Parse a source date string into a signed year (BCE negative, CE positive).
 * Handles "c. 700 BCE", "750 BCE", "400 CE", "8th century BCE",
 * and "2nd millennium BCE".
 * Returns null when no year can be read.
 */
export function parseSourceYear(raw: string | undefined): number | null {
  if (!raw) return null;
  const s = raw.trim();
  // "BCE" / "BC" mean before-era; a bare "CE"/"AD" is positive.
  const bce = /\bB\.?C\.?E?\b/i.test(s);

  // "2nd millennium BCE" -> midpoint of that millennium.
  const millennium = s.match(/(\d+)\s*(?:st|nd|rd|th)\s+millennium/i);
  if (millennium) {
    const m = Number.parseInt(millennium[1], 10);
    const mid = (m - 1) * 1000 + 500; // 2nd millennium -> 1500
    return bce ? -mid : mid;
  }

  // "8th century BCE" -> midpoint of that century.
  const century = s.match(/(\d+)\s*(?:st|nd|rd|th)\s+century/i);
  if (century) {
    const c = Number.parseInt(century[1], 10);
    const mid = (c - 1) * 100 + 50; // 8th century -> 750
    return bce ? -mid : mid;
  }

  const yearMatch = s.match(/(\d{1,4})/);
  if (yearMatch) {
    const year = Number.parseInt(yearMatch[1], 10);
    return bce ? -year : year;
  }

  // Historical epoch fallback midpoints (standard archaeological dating)
  if (/Early Dynastic/i.test(s)) return -2900;
  if (/Old Kingdom/i.test(s)) return -2500;
  if (/Ur III/i.test(s)) return -2100;
  if (/Middle Kingdom/i.test(s)) return -1900;
  if (/New Kingdom/i.test(s)) return -1300;
  if (/Ptolemaic/i.test(s)) return -250;
  if (/Vedic/i.test(s)) return -1200;
  if (/Shang/i.test(s)) return -1200;
  if (/Zhou/i.test(s)) return -800;
  if (/Han dynasty/i.test(s)) return -100;
  if (/Tang dynasty/i.test(s)) return 750;
  if (/Song dynasty/i.test(s)) return 1100;
  if (/Ming dynasty/i.test(s)) return 1500;
  if (/medieval/i.test(s)) return 1100;
  if (/colonial/i.test(s)) return 1600;

  return null;
}

/** Format a signed year back to a human label. */
export function formatYear(year: number): string {
  return year < 0 ? `c. ${Math.abs(year)} BCE` : `c. ${year} CE`;
}

export interface Attestation {
  /** Oldest normalized date among the works recorded in this catalog. */
  earliestYear: number | null;
  /** The catalogued work carrying the oldest normalized date. */
  earliestSource: PrimarySource | null;
  /** Count of distinct source labels recorded in the catalog. */
  count: number;
  /** Display tier based solely on catalog coverage. */
  tier: "unattested" | "single" | "corroborated" | "well-attested";
  label: string;
}

/**
 * The result describes catalog coverage only. Source labels are normalized to
 * avoid counting repeated excerpts from one recorded work more than once.
 */
export function attestationOf(
  sources: PrimarySource[] | undefined,
): Attestation {
  const list = Array.isArray(sources) ? sources : [];
  const count = new Set(
    list.map((entry) => entry.source.trim().replace(/\s+/g, " ").toLowerCase()),
  ).size;

  let earliestYear: number | null = null;
  let earliestSource: PrimarySource | null = null;
  for (const src of list) {
    const y = parseSourceYear(src.date);
    if (y === null) continue;
    if (earliestYear === null || y < earliestYear) {
      earliestYear = y;
      earliestSource = src;
    }
  }

  let tier: Attestation["tier"];
  let label: string;
  if (count === 0) {
    tier = "unattested";
    label = "No catalogued sources";
  } else if (count === 1) {
    tier = "single";
    label = "One catalogued work";
  } else if (count === 2) {
    tier = "corroborated";
    label = "Two catalogued works";
  } else {
    tier = "well-attested";
    label = "Three or more catalogued works";
  }

  return { earliestYear, earliestSource, count, tier, label };
}

export interface AttestationPoint {
  slug: string;
  name: string;
  pantheonId: string;
  year: number;
  source: string;
}

/** One point per figure with a dated source record, at its oldest date. */
export function attestationPoints(
  figures: readonly {
    slug: string;
    name: string;
    pantheonId: string;
    primarySources?: PrimarySource[];
  }[],
): AttestationPoint[] {
  const points: AttestationPoint[] = [];
  for (const figure of figures) {
    const att = attestationOf(figure.primarySources);
    if (att.earliestYear === null || !att.earliestSource) continue;
    points.push({
      slug: figure.slug,
      name: figure.name,
      pantheonId: figure.pantheonId,
      year: att.earliestYear,
      source: att.earliestSource.source,
    });
  }
  return points;
}
