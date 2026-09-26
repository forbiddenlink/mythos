import {
  getPantheonShortNames,
  getStories,
  getTraditionCount,
} from "@/lib/data/catalog";
import { interactiveStoryItems } from "@/lib/data/interactive-stories";
import { pick } from "@/lib/data/project";
import { StoriesPageClient, type StoryListItem } from "./StoriesPageClient";

/**
 * Story index. The catalog is read here on the server; the client component
 * receives card and filter fields only (no narratives or story graphs).
 */
export default function StoriesPage() {
  const stories: StoryListItem[] = getStories().map((story) => {
    const { themes } = story as { themes?: string[] };
    return {
      ...pick(story, ["id", "pantheonId", "title", "slug", "summary"]),
      imageUrl: story.imageUrl ?? null,
      themes: themes ?? [],
    };
  });

  return (
    <StoriesPageClient
      stories={stories}
      interactiveStories={interactiveStoryItems()}
      traditionCount={getTraditionCount()}
      traditionNames={getPantheonShortNames()}
    />
  );
}
