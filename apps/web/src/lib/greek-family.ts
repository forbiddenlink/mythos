import deitiesData from "@/data/deities.json";
import relationshipsData from "@/data/relationships.json";

/**
 * Kinship rows for the static Greek family-tree guide. Everything that the
 * atlas records (who is whose parent, the passage cited, whether the link is
 * disputed) is read from relationships.json, so the guide cannot drift from
 * the interactive /family-tree. Only what the atlas has no deity entry for
 * (the mothers Metis, Leto, Maia and Semele) is written out here.
 */

interface RawEvidence {
  sourceId?: string;
  locator?: string;
}

interface RawRelationship {
  id: string;
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
  confidenceLevel?: string | null;
  isDisputed?: boolean;
  description?: string | null;
  evidence?: RawEvidence[];
}

interface RawDeity {
  id: string;
  name: string;
  slug?: string;
  pantheonId: string;
  gender?: string | null;
  domain?: string[];
}

const deities = deitiesData as unknown as RawDeity[];
const relationships = relationshipsData as unknown as RawRelationship[];
const deityById = new Map(deities.map((d) => [d.id, d]));

/** The eleven seats nobody disputes, in the order the guide lists them. */
export const OLYMPIAN_IDS = [
  "zeus",
  "hera",
  "poseidon",
  "demeter",
  "athena",
  "apollo",
  "artemis",
  "ares",
  "aphrodite",
  "hephaestus",
  "hermes",
] as const;

/** The twelfth seat: sources and tellings give it to one or the other. */
export const TWELFTH_SEAT_IDS = ["hestia", "dionysus"] as const;

/**
 * Mothers the atlas has no deity entry for, with the Theogony lines that name
 * them. Keyed by the child. The line range is the same one the atlas cites
 * for the father (Theogony 886-900 and 924-926 for Athena, 918-920, 938-939,
 * 940-942), because Hesiod names both parents in those lines.
 */
export const MOTHERS_OUTSIDE_ATLAS: Record<string, string> = {
  athena: "Metis",
  apollo: "Leto",
  artemis: "Leto",
  hermes: "Maia",
  dionysus: "Semele",
};

export interface ParentLink {
  id: string;
  name: string;
  slug: string;
  gender: string | null;
  /** First passage the relationship record cites, e.g. "Theogony 453–491". */
  locator: string | null;
  disputed: boolean;
  /** The record's own note, present on the disputed links. */
  note: string | null;
}

function toLink(rel: RawRelationship, parent: RawDeity): ParentLink {
  return {
    id: parent.id,
    name: parent.name,
    slug: parent.slug ?? parent.id,
    gender: parent.gender ?? null,
    locator: rel.evidence?.[0]?.locator ?? null,
    disputed: rel.isDisputed === true,
    note: rel.description ?? null,
  };
}

/** Recorded parents of a deity, undisputed links first. */
export function parentsOf(childId: string): ParentLink[] {
  const links: ParentLink[] = [];
  for (const rel of relationships) {
    if (rel.relationshipType !== "parent_of" || rel.toDeityId !== childId) {
      continue;
    }
    const parent = deityById.get(rel.fromDeityId);
    if (parent) links.push(toLink(rel, parent));
  }
  return links.sort((a, b) => Number(a.disputed) - Number(b.disputed));
}

export interface ChildLink {
  id: string;
  name: string;
  slug: string;
  parentId: string;
  locator: string | null;
  disputed: boolean;
  note: string | null;
}

/** Recorded children of a deity. */
export function childrenOf(parentId: string): ChildLink[] {
  const children: ChildLink[] = [];
  for (const rel of relationships) {
    if (rel.relationshipType !== "parent_of" || rel.fromDeityId !== parentId) {
      continue;
    }
    const child = deityById.get(rel.toDeityId);
    if (!child) continue;
    children.push({
      id: child.id,
      name: child.name,
      slug: child.slug ?? child.id,
      parentId,
      locator: rel.evidence?.[0]?.locator ?? null,
      disputed: rel.isDisputed === true,
      note: rel.description ?? null,
    });
  }
  return children;
}

/** A relationship record by id, for variants the guide quotes in full. */
export function relationshipById(id: string): RawRelationship | undefined {
  return relationships.find((r) => r.id === id);
}

/** Domains of a deity as the atlas lists them. */
export function domainsOf(id: string): string[] {
  return deityById.get(id)?.domain ?? [];
}
