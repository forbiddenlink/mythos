import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import type { CatalogQuery } from "@/lib/catalog-query";
import locations from "@/data/locations.json";
import { LocationsPageClient } from "./LocationsPageClient";

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<CatalogQuery>;
}) {
  const query = await searchParams;
  return (
    <>
      <CollectionPageJsonLd
        name="Mythological Locations and Sacred Places"
        description="Explore sacred sites, temples, cities, rivers, mountains, and mythical realms from ancient civilizations."
        url="/locations"
        numberOfItems={locations.length}
      />
      <LocationsPageClient key={JSON.stringify(query)} initialQuery={query} />
    </>
  );
}
