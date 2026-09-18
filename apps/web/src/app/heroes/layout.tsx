import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Heroes of World Mythology",
  description:
    "Browse legendary heroes from Greek, Roman, Norse, Celtic, and Hindu mythology, their divine parentage, key deeds, and fates.",
  url: "/heroes",
  keywords: [
    "heroes",
    "mythological heroes",
    "Achilles",
    "Odysseus",
    "Heracles",
    "Cu Chulainn",
    "Arjuna",
    "mythology directory",
  ],
});

export default function HeroesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
