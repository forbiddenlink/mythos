import artifactsData from "@/data/artifacts.json";
import creaturesData from "@/data/creatures.json";
import deitiesData from "@/data/deities.json";
import heroesData from "@/data/heroes.json";
import locationsData from "@/data/locations.json";
import pantheonsData from "@/data/pantheons.json";
import { shortPantheonName } from "@/lib/metadata";

/**
 * "Mentioned in this entry": catalog entries whose exact name appears in an
 * entry's own prose, found at build time.
 *
 * Matching is deliberately conservative so a link is never a guess: names are
 * compared case-sensitively on word boundaries, very short names are ignored,
 * a name shared by more than one catalog entry is ignored (we cannot tell
 * which one the text means), a name that is also an ordinary word in the same
 * text ("Set" beside "set") is ignored, and an entry never links to itself. The result is
 * ordered by first appearance in the text and capped.
 */

export type MentionTargetKind =
  "deity" | "hero" | "creature" | "artifact" | "location";

export interface MentionTarget {
  kind: MentionTargetKind;
  id: string;
  name: string;
  href: string;
  /** Short caption, e.g. "Hero · Greek". */
  meta: string;
}

export interface EntryMention {
  kind: MentionTargetKind;
  id: string;
  name: string;
  href: string;
  meta: string;
}

export const MIN_MENTION_NAME_LENGTH = 3;
export const DEFAULT_MENTION_LIMIT = 8;

const KIND_LABEL: Record<MentionTargetKind, string> = {
  deity: "Deity",
  hero: "Hero",
  creature: "Creature",
  artifact: "Artifact",
  location: "Place",
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True when the lower-case form of `name` appears as a whole word in `text`. */
function hasLowercaseWord(text: string, name: string): boolean {
  const lower = name.toLowerCase();
  if (lower === name) return false;
  return new RegExp(
    `(?<![\\p{L}\\p{N}])${escapeRegExp(lower)}(?![\\p{L}\\p{N}])`,
    "u",
  ).test(text);
}

interface Matcher {
  regex: RegExp;
  byName: Map<string, MentionTarget>;
}

const matcherCache = new WeakMap<readonly MentionTarget[], Matcher | null>();

function buildMatcher(targets: readonly MentionTarget[]): Matcher | null {
  const cached = matcherCache.get(targets);
  if (cached !== undefined) return cached;

  const byName = new Map<string, MentionTarget[]>();
  for (const target of targets) {
    const name = target.name.trim();
    if (name.length < MIN_MENTION_NAME_LENGTH) continue;
    byName.set(name, [...(byName.get(name) ?? []), target]);
  }

  const unique = new Map<string, MentionTarget>();
  for (const [name, owners] of byName) {
    // Two entries share this name: the text could mean either, so skip it.
    if (owners.length === 1 && owners[0]) unique.set(name, owners[0]);
  }

  let matcher: Matcher | null = null;
  if (unique.size > 0) {
    // Longest names first so "Mount Olympus" wins over "Olympus".
    const alternation = [...unique.keys()]
      .sort((a, b) => b.length - a.length || a.localeCompare(b))
      .map(escapeRegExp)
      .join("|");
    matcher = {
      regex: new RegExp(
        `(?<![\\p{L}\\p{N}])(?:${alternation})(?![\\p{L}\\p{N}])`,
        "gu",
      ),
      byName: unique,
    };
  }
  matcherCache.set(targets, matcher);
  return matcher;
}

/** Pure matcher: which of `targets` are named in `texts`, in order of first appearance. */
export function findEntryMentions(
  texts: ReadonlyArray<string | null | undefined>,
  targets: readonly MentionTarget[],
  options: {
    self?: { kind: MentionTargetKind | "story"; id: string; name?: string };
    limit?: number;
  } = {},
): EntryMention[] {
  const matcher = buildMatcher(targets);
  if (!matcher) return [];
  const { self, limit = DEFAULT_MENTION_LIMIT } = options;

  const found: EntryMention[] = [];
  const seen = new Set<string>();
  // Headings are excluded: a title like "The Sin of Athens" capitalises an
  // ordinary word, which would otherwise link a same-named figure.
  const haystack = texts
    .filter(Boolean)
    .join("\n")
    .replace(/^ {0,3}#{1,6}[ \t].*$/gm, "");
  const isOrdinaryWord = new Map<string, boolean>();
  for (const match of haystack.matchAll(matcher.regex)) {
    const target = matcher.byName.get(match[0]);
    if (!target) continue;
    let ordinary = isOrdinaryWord.get(target.name);
    if (ordinary === undefined) {
      ordinary = hasLowercaseWord(haystack, target.name);
      isOrdinaryWord.set(target.name, ordinary);
    }
    if (ordinary) continue;
    const key = `${target.kind}:${target.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (self && self.kind === target.kind && self.id === target.id) continue;
    if (self?.name && self.name === target.name) continue;
    found.push({
      kind: target.kind,
      id: target.id,
      name: target.name,
      href: target.href,
      meta: target.meta,
    });
    if (found.length >= limit) break;
  }
  return found;
}

interface NamedRow {
  id: string;
  name: string;
  pantheonId: string;
  slug?: string;
}

const traditionOf = new Map(
  (pantheonsData as Array<{ id: string; name: string }>).map((p) => [
    p.id,
    shortPantheonName(p),
  ]),
);

function toTargets(
  rows: readonly NamedRow[],
  kind: MentionTargetKind,
  hrefBase: string,
  routeKey: "slug" | "id",
): MentionTarget[] {
  return rows.map((row) => ({
    kind,
    id: row.id,
    name: row.name,
    href: `${hrefBase}/${routeKey === "slug" ? row.slug : row.id}`,
    meta: `${KIND_LABEL[kind]} · ${traditionOf.get(row.pantheonId) ?? "Ancient"}`,
  }));
}

let catalogTargets: MentionTarget[] | null = null;

function getCatalogTargets(): MentionTarget[] {
  catalogTargets ??= [
    ...toTargets(deitiesData as NamedRow[], "deity", "/deities", "slug"),
    ...toTargets(heroesData as NamedRow[], "hero", "/heroes", "slug"),
    ...toTargets(creaturesData as NamedRow[], "creature", "/creatures", "slug"),
    ...toTargets(artifactsData as NamedRow[], "artifact", "/artifacts", "slug"),
    ...toTargets(locationsData as NamedRow[], "location", "/locations", "id"),
  ];
  return catalogTargets;
}

/** Catalog entries named in `texts`, excluding the entry the texts belong to. */
export function getEntryMentions(
  self: { kind: MentionTargetKind | "story"; id: string; name: string },
  texts: ReadonlyArray<string | null | undefined>,
  limit = DEFAULT_MENTION_LIMIT,
): EntryMention[] {
  return findEntryMentions(texts, getCatalogTargets(), { self, limit });
}
