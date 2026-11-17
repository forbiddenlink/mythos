import locationsData from "@/data/locations.json";
import storiesData from "@/data/stories.json";

interface StoryPlaceSource {
  id: string;
  slug: string;
  title: string;
  category?: string;
  imageUrl?: string | null;
  pantheonId: string;
  summary: string;
  fullNarrative?: string | null;
  featuredLocations?: string[];
}

export interface StorySetAt {
  id: string;
  slug: string;
  title: string;
  category?: string;
  imageUrl?: string | null;
}

interface PlaceSource {
  id: string;
  name: string;
  pantheonId: string;
}

/** Most stories listed on one place page. */
const MAX_STORIES_PER_PLACE = 8;

const allStories = storiesData as unknown as StoryPlaceSource[];
const allPlaces = locationsData as unknown as PlaceSource[];

function nameAppears(text: string, name: string): boolean {
  return (
    name.length > 2 &&
    new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(
      text,
    )
  );
}

/**
 * Place ids a story is set at: curated `featuredLocations` first, otherwise up
 * to six same-tradition places the narrative names. The story page and the
 * place page both use this, so a place lists the stories that list it.
 */
export function placeIdsForStory(
  story: Pick<
    StoryPlaceSource,
    "pantheonId" | "summary" | "fullNarrative" | "featuredLocations"
  >,
): string[] {
  if (story.featuredLocations?.length) return story.featuredLocations;
  const text = `${story.summary} ${story.fullNarrative ?? ""}`;
  return allPlaces
    .filter(
      (l) => l.pantheonId === story.pantheonId && nameAppears(text, l.name),
    )
    .slice(0, 6)
    .map((l) => l.id);
}

let storiesByPlace: Map<string, StorySetAt[]> | undefined;

function buildIndex(): Map<string, StorySetAt[]> {
  const index = new Map<string, StorySetAt[]>();
  for (const story of allStories) {
    for (const placeId of placeIdsForStory(story)) {
      const list = index.get(placeId) ?? [];
      list.push({
        id: story.id,
        slug: story.slug,
        title: story.title,
        category: story.category,
        imageUrl: story.imageUrl,
      });
      index.set(placeId, list);
    }
  }
  return index;
}

/** Stories set at a place, in data order, capped for the aside block. */
export function storiesSetAt(locationId: string): StorySetAt[] {
  storiesByPlace ??= buildIndex();
  return (storiesByPlace.get(locationId) ?? []).slice(0, MAX_STORIES_PER_PLACE);
}
