import locationsData from "@/data/locations.json";

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

interface PlaceSource {
  id: string;
  name: string;
  pantheonId: string;
}

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
 * to six same-tradition places the narrative names.
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
