import type { Metadata } from "next";
import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythological Locations and Sacred Places",
  description:
    "Explore temples, sacred sites, cities, and mythical realms across ancient civilizations and world mythology.",
  url: "/locations",
  keywords: [
    "mythological locations",
    "sacred places",
    "mythology map",
    "ancient temples",
    "mythical realms",
  ],
});

export default function LocationsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <CollectionPageJsonLd
        name="Mythological Locations and Sacred Places"
        description="Explore sacred sites, temples, cities, and mythical realms from ancient civilizations."
        url="/locations"
      />
      {children}
    </>
  );
}
