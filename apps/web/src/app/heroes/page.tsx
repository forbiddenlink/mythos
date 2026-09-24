import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { HeroesPageClient } from "./HeroesPageClient";

import type { CatalogQuery } from "@/lib/catalog-query";

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
      <HeroesPageClient key={JSON.stringify(query)} initialQuery={query} />
    </>
  );
}
