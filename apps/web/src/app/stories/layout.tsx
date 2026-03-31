import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";
import { CollectionPageJsonLd } from "@/components/seo/JsonLd";

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
  return (
    <>
      <CollectionPageJsonLd
        name="Mythological Stories - Epic Tales and Legends"
        description="Read epic myths and legends from ancient civilizations including Greek, Norse, Egyptian, and other world mythologies."
        url="/stories"
      />
      {children}
    </>
  );
}
