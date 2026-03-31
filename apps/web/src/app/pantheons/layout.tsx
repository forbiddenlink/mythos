import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";
import { CollectionPageJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = generateBaseMetadata({
  title: "Pantheons of Ancient Civilizations",
  description:
    "Compare Greek, Norse, Egyptian, Roman, Hindu, Japanese, Celtic, Aztec, Chinese, and other major mythological pantheons in one reference hub.",
  url: "/pantheons",
  keywords: [
    "pantheons",
    "Greek pantheon",
    "Norse pantheon",
    "Egyptian pantheon",
    "Roman pantheon",
    "Hindu pantheon",
    "mythological traditions",
  ],
});

export default function PantheonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CollectionPageJsonLd
        name="Pantheons - Mythological Traditions of Ancient Civilizations"
        description="Explore the divine hierarchies and mythological traditions of Greek, Norse, Egyptian, Roman, Hindu, Japanese, Celtic, Aztec, Chinese, and other ancient civilizations."
        url="/pantheons"
      />
      {children}
    </>
  );
}
