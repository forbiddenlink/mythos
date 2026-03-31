import type { Metadata } from "next";
import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Legendary Artifacts of Mythology",
  description:
    "Discover legendary weapons, relics, shields, and sacred objects wielded by gods and heroes across the world’s mythological traditions.",
  url: "/artifacts",
  keywords: [
    "legendary artifacts",
    "mythology artifacts",
    "mythic weapons",
    "divine relics",
    "magical objects",
  ],
});

export default function ArtifactsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <CollectionPageJsonLd
        name="Legendary Artifacts of Mythology"
        description="Explore divine relics, mythic weapons, shields, and sacred objects from ancient civilizations."
        url="/artifacts"
      />
      {children}
    </>
  );
}
