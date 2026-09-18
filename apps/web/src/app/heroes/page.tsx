import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { HeroesPageClient } from "./HeroesPageClient";

export default function HeroesPage() {
  return (
    <>
      <CollectionPageJsonLd
        name="Heroes - Legendary Figures of World Mythology"
        description="Browse legendary heroes from Greek, Roman, Norse, Celtic, and Hindu mythology."
        url="/heroes"
      />
      <HeroesPageClient />
    </>
  );
}
