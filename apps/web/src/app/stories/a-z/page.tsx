import type { Metadata } from "next";
import { AzIndex } from "@/components/layout/AzIndex";
import stories from "@/data/stories.json";
import { getPantheonShortNames } from "@/lib/data/catalog";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Myths and Stories A to Z",
  description:
    "Every myth and story in the atlas in alphabetical order, with the tradition each belongs to. Jump to a letter to find a story by name.",
  url: "/stories/a-z",
  keywords: [
    "myths A to Z",
    "list of myths",
    "mythology stories alphabetical",
    "mythology index",
  ],
});

export default function StoriesAzPage() {
  const traditions = getPantheonShortNames();

  return (
    <AzIndex
      title="Myths and Stories A to Z"
      lede={`${stories.length} myths and stories, listed by name.`}
      noun={{ one: "story", many: "stories" }}
      entries={stories.map((story) => ({
        name: story.title,
        href: `/stories/${story.slug}`,
        meta: traditions[story.pantheonId] ?? "",
      }))}
    />
  );
}
