import type { Metadata } from "next";
import pantheons from "@/data/pantheons.json";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: `Pantheons of the World: ${pantheons.length} Mythologies`,
  description: `Compare ${pantheons.length} pantheons side by side, from Greek, Norse, Egyptian and Hindu to Haudenosaunee and Inuit: their gods, myths and sources in one reference.`,
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
  return children;
}
