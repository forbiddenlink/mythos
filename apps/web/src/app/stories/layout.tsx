import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";

const baseMetadata = generateBaseMetadata({
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

// Lets feed readers and browsers discover the stories feed from /stories.
export const metadata: Metadata = {
  ...baseMetadata,
  alternates: {
    ...baseMetadata.alternates,
    types: { "application/rss+xml": "/stories/feed.xml" },
  },
};

export default function StoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
