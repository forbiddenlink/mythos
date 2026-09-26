import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";
import { getPantheons, getStories } from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { StoryTimelinePageClient } from "./StoryTimelinePageClient";

export const metadata: Metadata = generateBaseMetadata({
  title: "Story Timeline of World Mythology",
  description:
    "Explore mythological stories by cosmic era, from primordial chaos and creation through heroic ages and the twilight of divine powers.",
  url: "/story-timeline",
});

export default function StoryTimelinePage() {
  return (
    <StoryTimelinePageClient
      pantheons={project(getPantheons(), ["id", "name", "slug"])}
      stories={project(getStories(), [
        "id",
        "pantheonId",
        "title",
        "slug",
        "summary",
        "category",
      ])}
    />
  );
}
