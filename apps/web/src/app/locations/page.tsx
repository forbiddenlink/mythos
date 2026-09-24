import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import type { CatalogQuery } from "@/lib/catalog-query";
import locations from "@/data/locations.json";
import pantheons from "@/data/pantheons.json";
import deities from "@/data/deities.json";
import stories from "@/data/stories.json";
import { LocationsPageClient } from "./LocationsPageClient";

// Browse cards and map popups do not need full biographies or story texts.
const locationCards = locations.map(
  ({
    id,
    name,
    locationType,
    pantheonId,
    description,
    latitude,
    longitude,
    imageUrl,
  }) => ({
    id,
    name,
    locationType,
    pantheonId,
    description,
    latitude,
    longitude,
    imageUrl,
  }),
);
const traditionLabels = pantheons.map(({ id, name, slug, culture }) => ({
  id,
  name,
  slug,
  culture,
}));
const deityLinks = deities.map(
  ({ id, pantheonId, name, slug, domain, imageUrl }) => ({
    id,
    pantheonId,
    name,
    slug,
    domain,
    imageUrl,
  }),
);
const storyLinks = stories.map(({ id, pantheonId, title, slug }) => ({
  id,
  pantheonId,
  title,
  slug,
}));

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
      <LocationsPageClient
        key={JSON.stringify(query)}
        initialQuery={query}
        locations={locationCards}
        pantheons={traditionLabels}
        deities={deityLinks}
        stories={storyLinks}
      />
    </>
  );
}
