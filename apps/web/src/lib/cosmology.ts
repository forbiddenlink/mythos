import cosmologiesData from "@/data/cosmologies.json";
import deitiesData from "@/data/deities.json";
import creaturesData from "@/data/creatures.json";
import locationsData from "@/data/locations.json";

export type CosmologyBand =
  "beyond" | "sky" | "earth" | "water" | "under" | "abyss";

interface RawRealm {
  name: string;
  originalName?: string;
  description: string;
  deities?: string[];
  creatures?: string[];
  locationId?: string;
}

interface RawTier {
  id: string;
  label: string;
  band: CosmologyBand;
  realms: RawRealm[];
}

export interface RawCosmology {
  pantheonId: string;
  title: string;
  summary: string;
  axis: { name: string; kind: string; note: string } | null;
  variantNote: string;
  sources: string[];
  tiers: RawTier[];
}

export interface CosmologyFigure {
  name: string;
  href: string;
  imageUrl: string | null;
}

export interface CosmologyRealm {
  name: string;
  originalName?: string;
  description: string;
  figures: CosmologyFigure[];
  place: { name: string; href: string } | null;
}

export interface CosmologyTier {
  id: string;
  label: string;
  band: CosmologyBand;
  realms: CosmologyRealm[];
}

export interface Cosmology extends Omit<RawCosmology, "tiers"> {
  tiers: CosmologyTier[];
}

interface Named {
  name: string;
  slug?: string;
  id?: string;
  imageUrl?: string | null;
}

const bySlug = <T extends Named>(items: T[]) =>
  new Map(items.map((item) => [item.slug ?? item.id ?? "", item]));

/**
 * Resolve a pantheon's cosmology into render-ready tiers. Unknown deity,
 * creature, or location references are dropped rather than rendered as broken
 * links (the data test guards against them ever shipping).
 */
export function resolveCosmology(
  pantheonId: string,
  source: RawCosmology[] = cosmologiesData as RawCosmology[],
): Cosmology | null {
  const raw = source.find((c) => c.pantheonId === pantheonId);
  if (!raw) return null;

  const deities = bySlug(deitiesData as Named[]);
  const creatures = bySlug(creaturesData as Named[]);
  const locations = bySlug(locationsData as Named[]);

  const figure = (
    map: Map<string, Named>,
    slug: string,
    base: string,
  ): CosmologyFigure | null => {
    const hit = map.get(slug);
    return hit
      ? {
          name: hit.name,
          href: `${base}/${slug}`,
          imageUrl: hit.imageUrl ?? null,
        }
      : null;
  };

  return {
    ...raw,
    tiers: raw.tiers.map((tier) => ({
      ...tier,
      realms: tier.realms.map((realm) => {
        const place = realm.locationId
          ? locations.get(realm.locationId)
          : undefined;
        return {
          name: realm.name,
          originalName: realm.originalName,
          description: realm.description,
          figures: [
            ...(realm.deities ?? []).map((s) => figure(deities, s, "/deities")),
            ...(realm.creatures ?? []).map((s) =>
              figure(creatures, s, "/creatures"),
            ),
          ].filter((f): f is CosmologyFigure => f !== null),
          place: place
            ? { name: place.name, href: `/locations/${realm.locationId}` }
            : null,
        };
      }),
    })),
  };
}

export function getAllCosmologies(): Cosmology[] {
  return (cosmologiesData as RawCosmology[])
    .map((c) => resolveCosmology(c.pantheonId))
    .filter((c): c is Cosmology => c !== null);
}
