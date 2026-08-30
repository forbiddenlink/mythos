import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Cross-pantheon parallels — comparative mythology",
  description:
    "Explore universal archetypes — storm sovereigns, psychopomps, tricksters — across 13 world traditions, plus curated editorial equivalences between individual mythological figures.",
  url: "/compare/parallels",
});

export default function ParallelsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
