import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Compare Mythology Figures and Traditions",
  description:
    "Compare gods, attributes, symbols, stories, and ritual roles across mythological traditions to spot parallels, contrasts, and recurring archetypes.",
  url: "/compare",
});

export default function CompareLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
