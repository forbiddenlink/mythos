/**
 * Attestation helpers — derive honest, data-grounded scholarship signals from a
 * deity's primary sources. No dates are invented: everything comes from the
 * `date` strings already recorded on each source (e.g. "c. 700 BCE").
 */

export interface PrimarySource {
  text: string;
  source: string;
  date?: string;
}

/**
 * Parse a source date string into a signed year (BCE negative, CE positive).
 * Handles "c. 700 BCE", "750 BCE", "400 CE", and "8th century BCE".
 * Returns null when no year can be read.
 */
export function parseSourceYear(raw: string | undefined): number | null {
  if (!raw) return null;
  const s = raw.trim();
  // "BCE" / "BC" mean before-era; a bare "CE"/"AD" is positive.
  const bce = /\bB\.?C\.?E?\b/i.test(s);

  // "8th century BCE" -> midpoint of that century.
  const century = s.match(/(\d+)\s*(?:st|nd|rd|th)\s+century/i);
  if (century) {
    const c = Number.parseInt(century[1], 10);
    const mid = (c - 1) * 100 + 50; // 8th century -> 750
    return bce ? -mid : mid;
  }

  const yearMatch = s.match(/(\d{1,4})/);
  if (!yearMatch) return null;
  const year = Number.parseInt(yearMatch[1], 10);
  return bce ? -year : year;
}

/** Format a signed year back to a human label. */
export function formatYear(year: number): string {
  return year < 0 ? `c. ${Math.abs(year)} BCE` : `c. ${year} CE`;
}

export interface Attestation {
  /** Earliest attested year (signed), or null if no dated source. */
  earliestYear: number | null;
  /** The source that carries the earliest year. */
  earliestSource: PrimarySource | null;
  /** Count of primary sources. */
  count: number;
  /** Scholarly confidence tier derived from corroboration. */
  tier: "unattested" | "single" | "corroborated" | "well-attested";
  label: string;
}

/**
 * Corroboration = confidence: independent primary sources raise how firmly a
 * figure is attested. This is a defensible, data-derived signal — not a guess.
 */
export function attestationOf(
  sources: PrimarySource[] | undefined,
): Attestation {
  const list = Array.isArray(sources) ? sources : [];
  const count = list.length;

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
    label = "Unattested";
  } else if (count === 1) {
    tier = "single";
    label = "Single source";
  } else if (count === 2) {
    tier = "corroborated";
    label = "Corroborated";
  } else {
    tier = "well-attested";
    label = "Well attested";
  }

  return { earliestYear, earliestSource, count, tier, label };
}
