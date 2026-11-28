import type { Metadata } from "next";
import { getTraditionCount } from "@/lib/data/catalog";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: `Pantheons of the World: ${getTraditionCount()} Traditions`,
  description: `Explore ${getTraditionCount()} mythological traditions, from Greek and Norse to Haudenosaunee and Inuit. Read their stories and find the sources.`,
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
