import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";
import { WebApplicationJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = generateBaseMetadata({
  title: "Deity Family Trees and Genealogies",
  description:
    "Explore interactive deity family trees with divine relationships, genealogies, and lineages across Greek, Norse, and Egyptian mythology.",
  url: "/family-tree",
  keywords: [
    "family tree",
    "deity relationships",
    "genealogy",
    "god family tree",
    "divine lineage",
    "mythology visualization",
  ],
});

export default function FamilyTreeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WebApplicationJsonLd
        name="Mythology Family Tree Explorer"
        description="Interactive visualization of divine relationships and genealogies across ancient mythological pantheons."
        url="/family-tree"
      />
      {children}
    </>
  );
}
