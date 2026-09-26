import "server-only";

import type { InteractiveStoryListItem } from "@/components/stories/InteractiveStoryCard";
import { getBranchingStories, getPantheonShortNames } from "./catalog";
import { pick } from "./project";
import { getPantheonColor } from "@/lib/pantheon-colors";

/** Interactive-story card fields, projected on the server (no story graph). */
export function interactiveStoryItems(): InteractiveStoryListItem[] {
  const names = getPantheonShortNames();
  return getBranchingStories().map((story) => {
    const { pantheonId } = story as { pantheonId?: string };
    return {
      ...pick(story, [
        "id",
        "slug",
        "title",
        "description",
        "protagonist",
        "estimatedTime",
        "totalEndings",
        "coverImage",
      ]),
      ...(pantheonId
        ? {
            tradition: names[pantheonId] ?? pantheonId,
            traditionColor: getPantheonColor(pantheonId),
          }
        : {}),
    };
  });
}
