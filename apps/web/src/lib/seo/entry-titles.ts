import { domainLabel, normalizeDomain } from "@/lib/gods-of";

/**
 * Query-shaped page titles for catalog entries ("Zeus: Greek God of Sky,
 * Thunder and Lightning"), built only from the entry's own fields.
 *
 * The site appends " | Mythos Atlas", so the title itself stays within
 * TITLE_BUDGET characters. When a field is missing or the longest form does
 * not fit, the title falls back to a shorter one rather than inventing text.
 */
export const TITLE_BUDGET = 60;

function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

function firstFitting(candidates: readonly string[]): string {
  return (
    candidates.find((candidate) => candidate.length <= TITLE_BUDGET) ??
    candidates.at(-1) ??
    ""
  );
}

/** "God" for male, "Goddess" for female, "Deity" for anything else or unset. */
export function deityKind(gender: string | undefined): string {
  if (gender === "male") return "God";
  if (gender === "female") return "Goddess";
  return "Deity";
}

export function deityTitle(
  deity: { name: string; gender?: string; domain?: readonly string[] },
  tradition: string,
): string {
  const kind = deityKind(deity.gender);
  const base = `${deity.name}: ${tradition} ${kind}`;
  const domains: string[] = [];
  for (const raw of deity.domain ?? []) {
    const label = domainLabel(normalizeDomain(raw));
    if (label && !domains.includes(label)) domains.push(label);
  }
  const withDomains = [3, 2, 1]
    .filter((count) => domains.length >= count)
    .map((count) => `${base} of ${joinList(domains.slice(0, count))}`);
  return firstFitting([...withDomains, base]);
}

export function creatureTitle(
  creature: { name: string; habitat?: string },
  tradition: string,
): string {
  const base = `${creature.name}: ${tradition} Mythological Creature`;
  const habitat = creature.habitat?.trim();
  // A parenthetical or very long habitat reads badly in a title.
  if (!habitat || habitat.includes("(")) return base;
  return firstFitting([`${base} of ${habitat}`, base]);
}

export function heroTitle(hero: { name: string }, tradition: string): string {
  return `${hero.name}: ${tradition} Hero`;
}

/**
 * "Roman Mythology", "Persian Mythology": the phrase searchers type. Drops a
 * parenthetical ("Persian (Iranian) Tradition", "Finnish Tradition (Kalevala)")
 * and the terminal "Pantheon"/"Tradition" label. Plural "Traditions" names
 * ("African Traditions") already read as a whole phrase and stay as they are.
 */
export function mythologyName(pantheon: { name: string } | undefined): string {
  const base =
    pantheon?.name
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/\s+(?:Pantheon|Tradition)$/, "")
      .trim() || "Ancient";
  return /Traditions$/.test(base) ? base : `${base} Mythology`;
}

/** What kind of place it is, for the location types where the label adds information. */
const LOCATION_LABELS: Record<string, { label: string; inName: RegExp }> = {
  mountain: {
    label: "Mountain",
    inName: /\b(?:Mount|Mountain|Mountains|Peak|Hill)\b/i,
  },
  realm: { label: "Realm", inName: /\b(?:Realm|Land|Kingdom)\b/i },
  mythical_realm: { label: "Realm", inName: /\b(?:Realm|Land|Kingdom)\b/i },
  sacred_site: {
    label: "Sacred Site",
    inName: /\b(?:Sanctuary|Shrine|Temple|Oracle)\b/i,
  },
  underworld: { label: "Underworld", inName: /\b(?:Underworld|Hades|Hell)\b/i },
  island: { label: "Island", inName: /\b(?:Island|Isle)\b/i },
  city: { label: "City", inName: /\bCity\b/i },
  temple: { label: "Temple", inName: /\bTemple\b/i },
  tomb: { label: "Tomb", inName: /\bTomb\b/i },
  cave: { label: "Cave", inName: /\bCave\b/i },
  palace: { label: "Palace", inName: /\bPalace\b/i },
};

/** "Pohjola: Realm in Finnish Mythology"; "Lake Avernus in Roman Mythology". */
export function locationTitle(
  location: { name: string; locationType?: string },
  pantheon: { name: string } | undefined,
): string {
  const plain = `${location.name} in ${mythologyName(pantheon)}`;
  const typed = location.locationType
    ? LOCATION_LABELS[location.locationType]
    : undefined;
  if (!typed || typed.inName.test(location.name)) return plain;
  return firstFitting([
    `${location.name}: ${typed.label} in ${mythologyName(pantheon)}`,
    plain,
  ]);
}

/** "Gods of Wisdom in World Mythology: 19 Deities", shortened to fit the budget. */
export function godsOfPageTitle(
  label: string,
  deityCount: number,
  traditionCount: number,
): string {
  const deities = `${deityCount} ${deityCount === 1 ? "Deity" : "Deities"}`;
  return firstFitting([
    `${label} in World Mythology: ${deities}`,
    `${label}: ${deities} in ${traditionCount} Traditions`,
    `${label} in World Mythology`,
  ]);
}
