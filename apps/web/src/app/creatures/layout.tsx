import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythological Creatures and Monsters",
  description:
    "Explore legendary beasts, dragons, monsters, and supernatural creatures from Greek, Norse, Egyptian, and world mythology.",
  url: "/creatures",
  keywords: [
    "mythological creatures",
    "mythology monsters",
    "legendary beasts",
    "ancient creatures",
    "monster encyclopedia",
  ],
});

export default function CreaturesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
