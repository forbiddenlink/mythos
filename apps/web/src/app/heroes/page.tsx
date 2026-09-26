import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { getHeroes, getPantheonShortNames } from "@/lib/data/catalog";
import type { CatalogQuery } from "@/lib/catalog-query";
import { HeroesPageClient, type HeroListItem } from "./HeroesPageClient";

// Card fields only; biographies, deeds and sources stay on the server.
const heroCards: HeroListItem[] = getHeroes().map((hero) => ({
  id: hero.id,
  pantheonId: hero.pantheonId ?? "",
  name: hero.name,
  slug: hero.slug,
  description: String(hero.description ?? ""),
  alternateNames: (hero.alternateNames as string[] | undefined) ?? [],
  imageUrl: (hero.imageUrl as string | null | undefined) ?? null,
  keyDeedCount: Array.isArray(hero.keyDeeds) ? hero.keyDeeds.length : 0,
}));

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
        traditionNames={getPantheonShortNames()}
      />
    </>
  );
}
