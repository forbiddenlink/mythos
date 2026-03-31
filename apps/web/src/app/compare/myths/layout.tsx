import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Compare Myths Across Cultures",
  description:
    "Compare creation stories, heroic journeys, flood myths, divine conflicts, and recurring narrative patterns across mythological traditions from around the world.",
  url: "/compare/myths",
});

export default function CompareMythsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
