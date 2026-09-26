import "server-only";

import { seededShuffle } from "@/lib/seeded";
import {
  getDeities,
  getPantheonById,
  getRelationships,
  getStories,
  getTraditions,
} from "./catalog";

/**
 * Printable classroom worksheets for a tradition, generated from the
 * catalog at build time: a who's-who matching exercise, family
 * relationships to fill in, short-answer questions and an answer key.
 */
export interface WorksheetMatch {
  name: string;
  /** Letter of the matching role in `roles`. */
  letter: string;
}

export interface WorksheetFamilyItem {
  /** Sentence with `____` where the answer goes. */
  sentence: string;
  answer: string;
}

export interface WorksheetShortAnswer {
  question: string;
  /** Guidance for the teacher, drawn from the catalog. */
  keyNote: string;
  href: string;
}

export interface Worksheet {
  pantheon: { id: string; name: string; slug: string; culture: string };
  matching: WorksheetMatch[];
  roles: Array<{ letter: string; role: string }>;
  family: WorksheetFamilyItem[];
  wordBank: string[];
  shortAnswers: WorksheetShortAnswer[];
}

const MATCH_COUNT = 8;
const MIN_MATCHES = 4;
const FAMILY_COUNT = 6;
const LETTERS = "ABCDEFGHIJ";

const FAMILY_PHRASES: Record<string, (a: string, b: string) => string> = {
  parent_of: (a, b) => `${a} is a parent of ${b}.`,
  spouse_of: (a, b) => `${a} is the spouse of ${b}.`,
  sibling_of: (a, b) => `${a} is a sibling of ${b}.`,
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (Math.imul(hash, 31) + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function roleOf(domain: readonly string[]): string {
  return domain.slice(0, 3).join(", ");
}

function traditionDeities(pantheonId: string) {
  return getDeities()
    .filter((d) => d.pantheonId === pantheonId && d.domain.length > 0)
    .toSorted(
      (a, b) =>
        (a.importanceRank || 999) - (b.importanceRank || 999) ||
        a.name.localeCompare(b.name),
    );
}

/** Pantheon slugs that have enough material for a worksheet. */
export function getWorksheetSlugs(): string[] {
  return getTraditions()
    .filter((p) => {
      const roles = new Set(
        traditionDeities(p.id).map((d) => roleOf(d.domain)),
      );
      return roles.size >= MIN_MATCHES;
    })
    .map((p) => p.slug);
}

export function hasWorksheet(slug: string): boolean {
  return getWorksheetSlugs().includes(slug);
}

export function buildWorksheet(slug: string): Worksheet | null {
  const pantheon = getTraditions().find((p) => p.slug === slug);
  if (!pantheon) return null;
  const seed = hashString(pantheon.id);

  // Who's who: the best-known figures whose roles read differently.
  const seenRoles = new Set<string>();
  const chosen = traditionDeities(pantheon.id).filter((d) => {
    const role = roleOf(d.domain);
    if (seenRoles.has(role)) return false;
    seenRoles.add(role);
    return true;
  });
  const figures = chosen.slice(0, MATCH_COUNT);
  if (figures.length < MIN_MATCHES) return null;

  const shuffled = seededShuffle(figures, seed);
  const roles = shuffled.map((d, i) => ({
    letter: LETTERS[i],
    role: roleOf(d.domain),
  }));
  const letterById = new Map(shuffled.map((d, i) => [d.id, LETTERS[i]]));
  const matching = figures.map((d) => ({
    name: d.name,
    letter: letterById.get(d.id)!,
  }));

  // Family: relationships inside the tradition, first figure blanked.
  const byId = new Map(traditionDeities(pantheon.id).map((d) => [d.id, d]));
  const inTradition = getRelationships().filter(
    (r) =>
      FAMILY_PHRASES[r.relationshipType] &&
      byId.has(r.fromDeityId) &&
      byId.has(r.toDeityId),
  );
  // How many figures could fill "____ is a <type> of X"? Only one keeps the
  // blank unambiguous (Athena has two parents, so that sentence is skipped).
  const answersFor = (type: string, target: string) => {
    const symmetric = type !== "parent_of";
    const names = new Set<string>();
    for (const r of inTradition) {
      if (r.relationshipType !== type) continue;
      if (r.toDeityId === target) names.add(r.fromDeityId);
      if (symmetric && r.fromDeityId === target) names.add(r.toDeityId);
    }
    return names.size;
  };
  const seenPairs = new Set<string>();
  const family: WorksheetFamilyItem[] = [];
  for (const rel of seededShuffle(inTradition, seed + 1)) {
    const phrase = FAMILY_PHRASES[rel.relationshipType];
    const from = byId.get(rel.fromDeityId);
    const to = byId.get(rel.toDeityId);
    if (!phrase || !from || !to || from.id === to.id) continue;
    if (answersFor(rel.relationshipType, to.id) !== 1) continue;
    const pair = [from.id, to.id].sort().join("|");
    if (seenPairs.has(pair)) continue;
    seenPairs.add(pair);
    family.push({ sentence: phrase("____", to.name), answer: from.name });
    if (family.length >= FAMILY_COUNT) break;
  }
  const wordBank = [...new Set(family.map((f) => f.answer))].sort();

  // Short answers: two figures and up to two stories.
  const shortAnswers: WorksheetShortAnswer[] = [];
  for (const deity of figures.slice(0, 2)) {
    const symbols = deity.symbols.slice(0, 3);
    shortAnswers.push({
      question: `What was ${deity.name} associated with, and which symbols help you recognise ${deity.name}?`,
      keyNote: `${roleOf(deity.domain)}${symbols.length ? `. Symbols: ${symbols.join(", ")}` : ""}.`,
      href: `/deities/${deity.slug}`,
    });
  }
  const stories = getStories()
    .filter((s) => s.pantheonId === pantheon.id)
    .slice(0, 2);
  for (const story of stories) {
    shortAnswers.push({
      question: `Retell “${story.title}” in two or three sentences. Who is involved, and what changes by the end?`,
      keyNote: story.summary,
      href: `/stories/${story.slug}`,
    });
  }

  const record = getPantheonById(pantheon.id)!;
  return {
    pantheon: {
      id: record.id,
      name: record.name,
      slug: record.slug,
      culture: record.culture,
    },
    matching,
    roles,
    family,
    wordBank,
    shortAnswers,
  };
}
