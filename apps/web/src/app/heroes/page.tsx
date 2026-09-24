import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { HeroesPageClient } from "./HeroesPageClient";

import heroes from "@/data/heroes.json";
import pantheons from "@/data/pantheons.json";

import type { CatalogQuery } from "@/lib/catalog-query";

const heroCards = heroes.map(
  ({
    id,
    pantheonId,
    name,
    slug,
    description,
    alternateNames,
    imageUrl,
    keyDeeds,
  }) => ({
    id,
    pantheonId,
    name,
    slug,
    description,
    alternateNames,
    imageUrl,
    keyDeeds,
  }),
);
const traditionLabels = pantheons.map(({ id, name }) => ({ id, name }));

export default async function HeroesPage({
  searchParams,
}: {
  searchParams: Promise<CatalogQuery>;
}) {
  const query = await searchParams;
  return (
    <>
      <CollectionPageJsonLd
        name="Heroes - Legendary Figures of World Mythology"
        description="Browse legendary heroes from Greek, Roman, Norse, Celtic, and Hindu mythology."
        url="/heroes"
      />
      <HeroesPageClient
        key={JSON.stringify(query)}
        initialQuery={query}
        allHeroes={heroCards}
        pantheons={traditionLabels}
      />
    </>
  );
}
