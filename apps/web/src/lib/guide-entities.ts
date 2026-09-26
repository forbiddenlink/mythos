import "server-only";

import creaturesJson from "@/data/creatures.json";
import heroesJson from "@/data/heroes.json";
import locationsJson from "@/data/locations.json";
import { getDeityById } from "@/lib/data/catalog";
import type { GuideEntityKind } from "@/lib/guides";

/**
 * Resolve the catalog entries a guide names into link targets carrying the
 * entry's own one-line description. Guides never restate an entry's facts in
 * their own words where the entry already says it; they quote its summary and
 * link to it.
 */

export interface GuideEntity {
  kind: GuideEntityKind;
  id: string;
  name: string;
  href: string;
  description: string;
  imageUrl: string | null;
}

interface Row {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
}

const PATHS: Record<GuideEntityKind, string> = {
  deity: "deities",
  hero: "heroes",
  creature: "creatures",
  location: "locations",
  artifact: "artifacts",
};

function find(kind: GuideEntityKind, id: string): Row | undefined {
  switch (kind) {
    case "deity":
      return getDeityById(id);
    case "hero":
      return (heroesJson as unknown as Row[]).find((row) => row.id === id);
    case "creature":
      return (creaturesJson as unknown as Row[]).find((row) => row.id === id);
    case "location":
      return (locationsJson as unknown as Row[]).find((row) => row.id === id);
    default:
      return undefined;
  }
}

/** The entry, or a thrown error: a guide must never link to a missing page. */
export function guideEntity(kind: GuideEntityKind, id: string): GuideEntity {
  const row = find(kind, id);
  if (!row) {
    throw new Error(`Guide references a missing ${kind}: ${id}`);
  }
  // Locations are addressed by id; every other catalog by slug.
  const segment = kind === "location" ? row.id : (row.slug ?? row.id);
  return {
    kind,
    id: row.id,
    name: row.name,
    href: `/${PATHS[kind]}/${segment}`,
    description: row.description ?? "",
    imageUrl: row.imageUrl ?? null,
  };
}

/** Location rows with the geography fields the Odyssey route needs. */
export interface RouteStop extends GuideEntity {
  geography: "physical" | "identified" | "mythic";
  firstCitation: string | null;
}

export function routeStop(id: string): RouteStop {
  const base = guideEntity("location", id);
  const row = (
    locationsJson as unknown as Array<
      Row & {
        geography: RouteStop["geography"];
        primarySources?: Array<{ source: string }>;
      }
    >
  ).find((r) => r.id === id);
  return {
    ...base,
    geography: row?.geography ?? "mythic",
    firstCitation: row?.primarySources?.[0]?.source ?? null,
  };
}
