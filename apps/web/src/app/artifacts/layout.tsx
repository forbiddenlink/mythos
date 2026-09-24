import type { Metadata } from "next";
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
  return children;
}
