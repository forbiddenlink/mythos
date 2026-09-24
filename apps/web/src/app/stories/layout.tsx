import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythological Stories and Legends",
  description:
    "Read creation stories, heroic quests, divine conflicts, and foundational legends from Greek, Norse, Egyptian, and other ancient mythologies.",
  url: "/stories",
  keywords: [
    "mythology stories",
    "myths",
    "legends",
    "epic tales",
    "creation myths",
    "Ragnarok",
    "Titanomachy",
    "Osiris myth",
  ],
});

export default function StoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
