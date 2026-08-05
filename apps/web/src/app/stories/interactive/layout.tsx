import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Interactive Mythology Stories",
  description:
    "Play branching myths where your choices shape the ending. Explore interactive stories across Greek, Norse, Egyptian, and world pantheons.",
  url: "/stories/interactive",
  keywords: [
    "interactive mythology stories",
    "choose your own adventure myths",
    "branching mythology",
    "mythology games",
  ],
});

export default function InteractiveStoriesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
