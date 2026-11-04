"use client";

import { ReadEndNudge } from "@/components/support/ReadEndNudge";

/**
 * Marks the end of a story. Once the reader scrolls the closing mark into view,
 * the story counts as finished (a support value moment) and the nudge gets its
 * chance to appear. Each story counts once, however often it is read.
 */
export function StoryEndNudge({ storySlug }: { storySlug: string }) {
  return (
    <ReadEndNudge
      moment="story_finished"
      momentKey={storySlug}
      placement="story_read_end"
      className="mt-10 w-full max-w-reading"
    />
  );
}
