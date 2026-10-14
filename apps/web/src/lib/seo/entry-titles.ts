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
