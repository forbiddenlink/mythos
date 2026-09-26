/**
 * Pure derivations for the deity detail page. The server page feeds these the
 * catalog; the results are the only deity data that reach the browser.
 */
import {
  normalizeDeityReference,
  type DeityLookup,
  type DeityLookupEntry,
} from "@/lib/deity-reference";
import { readableParallelNote } from "@/lib/parallel-notes";
import { getPantheonColor } from "@/lib/pantheon-colors";

export function formatSlugAsTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** "greek-pantheon" → "Greek" */
export function formatPantheonLabel(pantheonId: string): string {
  return formatSlugAsTitle(pantheonId.replace(/-pantheon$/, ""));
}

interface ParallelInput {
  pantheonId: string;
  deityId: string;
  note: string;
}

export interface FigureRef {
  id: string;
  name: string;
  slug: string;
}

export interface ResolvedParallel {
  deityId: string;
  note: string;
  pantheonId: string;
  pantheonLabel: string;
  pantheonColor: string;
  /** Display name: the linked figure's name, or the reference made readable. */
  name: string;
  /** Link to the deity or hero page; null when the reference is dangling. */
  href: string | null;
  slug: string | null;
}

/**
 * Resolve cross-pantheon parallels to deity pages first, then hero pages. A
 * parallel that only resolves back to the deity itself (its own alias) is not
 * linked to another deity page.
 */
export function resolveParallels(
  deityId: string,
  parallels: readonly ParallelInput[] | undefined,
  lookup: Pick<DeityLookup<DeityLookupEntry>, "find">,
  heroes: readonly FigureRef[],
): ResolvedParallel[] {
  return (parallels ?? []).map((parallel) => {
    const matched = lookup.find(parallel.deityId);
    const relatedDeity =
      matched && matched.id !== deityId ? matched : undefined;
    const relatedHero = relatedDeity
      ? undefined
      : heroes.find((hero) => hero.id === parallel.deityId);
    const figure = relatedDeity ?? relatedHero;
    return {
      deityId: parallel.deityId,
      note: readableParallelNote(parallel.note),
      pantheonId: parallel.pantheonId,
      pantheonLabel: formatPantheonLabel(parallel.pantheonId),
      pantheonColor: getPantheonColor(parallel.pantheonId),
      name: figure
        ? figure.name
        : formatSlugAsTitle(normalizeDeityReference(parallel.deityId)),
      href: figure
        ? `/${relatedDeity ? "deities" : "heroes"}/${figure.slug}`
        : null,
      slug: figure ? figure.slug : null,
    };
  });
}

interface RelationshipInput {
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
}

/** Relationships in which the deity takes part, in catalog order. */
export function relationshipsFor<T extends RelationshipInput>(
  deityId: string,
  relationships: readonly T[],
): T[] {
  return relationships.filter(
    (r) => r.fromDeityId === deityId || r.toDeityId === deityId,
  );
}

/** The deities a set of relationships touches, in catalog order. */
export function deitiesInRelationships<T extends { id: string }>(
  relationships: readonly RelationshipInput[],
  deities: readonly T[],
): T[] {
  const ids = new Set<string>();
  for (const r of relationships) {
    ids.add(r.fromDeityId);
    ids.add(r.toDeityId);
  }
  return deities.filter((d) => ids.has(d.id));
}

export interface Kin {
  key: string;
  name: string;
  slug: string | null;
  color: string;
}

export interface Bloodline {
  parents: Kin[];
  children: Kin[];
  consorts: Kin[];
  siblings: Kin[];
  rivals: Kin[];
}

interface KinDeity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
}

function toKin(id: string, byId: ReadonlyMap<string, KinDeity>): Kin {
  const d = byId.get(id);
  if (d) {
    return {
      key: id,
      name: d.name,
      slug: d.slug,
      color: getPantheonColor(d.pantheonId),
    };
  }
  // dangling reference — show a readable name, no link
  return {
    key: id,
    name: id
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    slug: null,
    color: "#6b7280",
  };
}

/** Group a deity's genealogy into the tiers of the bloodline plate. */
export function buildBloodline(
  deityId: string,
  relationships: readonly RelationshipInput[],
  deities: readonly KinDeity[],
): Bloodline {
  const byId = new Map(deities.map((d) => [d.id, d]));
  const groups: Bloodline = {
    parents: [],
    children: [],
    consorts: [],
    siblings: [],
    rivals: [],
  };
  const seen = new Set<string>();
  const push = (arr: Kin[], id: string) => {
    const tag =
      arr === groups.consorts ? "c" : arr === groups.rivals ? "r" : "";
    const dedup = `${tag}:${id}`;
    if (seen.has(dedup)) return;
    seen.add(dedup);
    arr.push(toKin(id, byId));
  };

  for (const r of relationships) {
    const involvesFrom = r.fromDeityId === deityId;
    const involvesTo = r.toDeityId === deityId;
    if (!involvesFrom && !involvesTo) continue;
    const other = involvesFrom ? r.toDeityId : r.fromDeityId;
    switch (r.relationshipType) {
      case "parent_of":
        if (involvesTo) push(groups.parents, other);
        else push(groups.children, other);
        break;
      case "spouse_of":
      case "lover_of":
        push(groups.consorts, other);
        break;
      case "sibling_of":
        push(groups.siblings, other);
        break;
      case "enemy_of":
        push(groups.rivals, other);
        break;
      default:
        break; // ally_of / aspect_of are not part of the bloodline plate
    }
  }
  return groups;
}

export function hasLineage(bloodline: Bloodline): boolean {
  return (
    bloodline.parents.length +
      bloodline.children.length +
      bloodline.consorts.length >
    0
  );
}

export interface RelatedDeityCard {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  label: string;
}

interface RelatedInput {
  deityId: string;
  label: string;
}

interface RelatedDeityInput {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  imageUrl?: string | null;
}

/**
 * Related-deity cards: the strongest relationships first, then (when fewer
 * than four resolve) same-pantheon deities to fill the grid.
 */
export function selectRelatedDeities(
  deityId: string,
  pantheonId: string,
  related: readonly RelatedInput[],
  deities: readonly RelatedDeityInput[],
): RelatedDeityCard[] {
  if (related.length === 0) return [];
  const byId = new Map(deities.map((d) => [d.id, d]));
  const toCard = (d: RelatedDeityInput, label: string): RelatedDeityCard => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    imageUrl: d.imageUrl ?? null,
    label,
  });

  const cards: RelatedDeityCard[] = [];
  for (const rel of related) {
    const d = byId.get(rel.deityId);
    if (d) cards.push(toCard(d, rel.label));
  }

  if (cards.length < 4) {
    const existing = new Set(cards.map((c) => c.id));
    existing.add(deityId);
    const fill = deities
      .filter((d) => d.pantheonId === pantheonId && !existing.has(d.id))
      .slice(0, 4 - cards.length)
      .map((d) => toCard(d, "Same Pantheon"));
    cards.push(...fill);
  }
  return cards;
}

interface BranchingStoryInput {
  id: string;
  slug: string;
  title: string;
  description: string;
  protagonist: string;
  estimatedTime: string;
  totalEndings: number;
  nodes: Record<string, { content: string }>;
}

export interface InteractiveStoryCard {
  id: string;
  slug: string;
  title: string;
  description: string;
  estimatedTime: string;
  totalEndings: number;
}

/** Interactive stories whose protagonist, description or any node mentions the deity. */
export function interactiveStoriesFeaturing(
  deityId: string,
  stories: readonly BranchingStoryInput[],
): InteractiveStoryCard[] {
  const needle = deityId.toLowerCase();
  return stories
    .filter(
      (story) =>
        story.protagonist.toLowerCase().includes(needle) ||
        story.description.toLowerCase().includes(needle) ||
        Object.values(story.nodes).some((node) =>
          node.content.toLowerCase().includes(needle),
        ),
    )
    .map(({ id, slug, title, description, estimatedTime, totalEndings }) => ({
      id,
      slug,
      title,
      description,
      estimatedTime,
      totalEndings,
    }));
}
