import creaturesData from "@/data/creatures.json";
import deitiesData from "@/data/deities.json";
import pantheonsData from "@/data/pantheons.json";
import { shortTraditionName } from "@/lib/tradition-name";

/**
 * Per-tradition list pages ("Greek mythological creatures", "Greek goddesses"),
 * derived entirely from the catalog.
 *
 * A tradition gets a page only when it holds enough entries to be a real list:
 * MIN_CREATURES creatures, or MIN_GODDESSES deities whose `gender` is "female".
 * Nothing on the page is written for it, so a tradition with too little behind
 * it simply has no page (which keeps these from becoming thin doorway pages).
 */

export const MIN_CREATURES = 4;
export const MIN_GODDESSES = 5;

interface RawPantheon {
  id: string;
  slug: string;
  name: string;
  culture: string;
}

interface RawCreature {
  id: string;
  slug: string;
  name: string;
  pantheonId: string;
  description: string;
  habitat: string;
  dangerLevel: number;
  imageUrl?: string | null;
}

interface RawDeity {
  id: string;
  slug: string;
  name: string;
  pantheonId: string;
  gender?: string;
  domain?: string[];
  description?: string | null;
  importanceRank?: number | null;
  imageUrl?: string | null;
}

export interface HubTradition {
  id: string;
  slug: string;
  /** Full record name, e.g. "Greek Pantheon". */
  name: string;
  /** Short name for headings, e.g. "Greek". */
  shortName: string;
}

export interface CreatureHub {
  tradition: HubTradition;
  creatures: RawCreature[];
}

export interface GoddessHub {
  tradition: HubTradition;
  goddesses: RawDeity[];
}

const pantheons = pantheonsData as unknown as RawPantheon[];
const creatures = creaturesData as unknown as RawCreature[];
const deities = deitiesData as unknown as RawDeity[];

function traditionOf(pantheonId: string): HubTradition | null {
  const record = pantheons.find((p) => p.id === pantheonId);
  if (!record) return null;
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    shortName: shortTraditionName(record.name),
  };
}

function groupByPantheon<T extends { pantheonId: string }>(
  rows: readonly T[],
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    groups.set(row.pantheonId, [...(groups.get(row.pantheonId) ?? []), row]);
  }
  return groups;
}

let creatureCache: CreatureHub[] | null = null;
let goddessCache: GoddessHub[] | null = null;

/** Most dangerous first, then by name, so the order is stable. */
function byDanger(a: RawCreature, b: RawCreature): number {
  return b.dangerLevel - a.dangerLevel || a.name.localeCompare(b.name);
}

/** Most prominent first (importanceRank), then by name. */
function byImportance(a: RawDeity, b: RawDeity): number {
  return (
    (a.importanceRank ?? 99) - (b.importanceRank ?? 99) ||
    a.name.localeCompare(b.name)
  );
}

export function getCreatureHubs(): CreatureHub[] {
  if (creatureCache) return creatureCache;
  const hubs: CreatureHub[] = [];
  for (const [pantheonId, rows] of groupByPantheon(creatures)) {
    const tradition = traditionOf(pantheonId);
    if (!tradition || rows.length < MIN_CREATURES) continue;
    hubs.push({ tradition, creatures: [...rows].sort(byDanger) });
  }
  creatureCache = hubs.sort(
    (a, b) =>
      b.creatures.length - a.creatures.length ||
      a.tradition.slug.localeCompare(b.tradition.slug),
  );
  return creatureCache;
}

export function getGoddessHubs(): GoddessHub[] {
  if (goddessCache) return goddessCache;
  const hubs: GoddessHub[] = [];
  const female = deities.filter((d) => d.gender === "female");
  for (const [pantheonId, rows] of groupByPantheon(female)) {
    const tradition = traditionOf(pantheonId);
    if (!tradition || rows.length < MIN_GODDESSES) continue;
    hubs.push({ tradition, goddesses: [...rows].sort(byImportance) });
  }
  goddessCache = hubs.sort(
    (a, b) =>
      b.goddesses.length - a.goddesses.length ||
      a.tradition.slug.localeCompare(b.tradition.slug),
  );
  return goddessCache;
}

export function getCreatureHub(slug: string): CreatureHub | null {
  return getCreatureHubs().find((hub) => hub.tradition.slug === slug) ?? null;
}

export function getGoddessHub(slug: string): GoddessHub | null {
  return getGoddessHubs().find((hub) => hub.tradition.slug === slug) ?? null;
}
