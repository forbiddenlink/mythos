"use client";

import { useContext, useEffect } from "react";
import { ProgressContext } from "@/providers/progress-provider";

/** Records the story (and its tradition) as read in local progress. */
export function StoryProgressTracker({
  storyId,
  pantheonId,
}: {
  storyId: string;
  pantheonId: string;
}) {
  const progress = useContext(ProgressContext);
  if (!progress) {
    throw new Error(
      "StoryProgressTracker must be used within ProgressProvider",
    );
  }
  const { trackStoryRead, trackPantheonExplore } = progress;

  useEffect(() => {
    if (storyId) trackStoryRead(storyId);
    if (pantheonId) trackPantheonExplore(pantheonId);
  }, [storyId, pantheonId, trackStoryRead, trackPantheonExplore]);

  return null;
}
