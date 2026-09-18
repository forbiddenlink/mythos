import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";
import { StoryTimelinePageClient } from "./StoryTimelinePageClient";

export const metadata: Metadata = generateBaseMetadata({
  title: "Story Timeline of World Mythology",
  description:
    "Explore mythological stories by cosmic era, from primordial chaos and creation through heroic ages and the twilight of divine powers.",
  url: "/story-timeline",
});

export default function StoryTimelinePage() {
  return <StoryTimelinePageClient />;
}
