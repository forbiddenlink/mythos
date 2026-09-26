/**
 * Display helpers for tradition (pantheon) records. Pure string functions, so
 * they are safe in client and server code alike.
 */

/**
 * "Canaanite Pantheon (Ugarit)" → "Canaanite", "Finnish Tradition (Kalevala)"
 * → "Finnish", "Greek Pantheon" → "Greek". Chips, filters and group headings
 * use this so every tradition reads the same way.
 */
export function shortTraditionName(name: string): string {
  return name
    .replaceAll(/\s*\([^)]*\)/g, "")
    .replace(/\s+(?:Pantheon|Tradition|Traditions)$/, "")
    .trim();
}

/**
 * One-line region label for cards: drops parenthetical glosses, so
 * "Mesopotamia (modern Iraq)" → "Mesopotamia".
 */
export function shortRegionName(region: string): string {
  return region.replaceAll(/\s*\([^)]*\)/g, "").trim();
}
