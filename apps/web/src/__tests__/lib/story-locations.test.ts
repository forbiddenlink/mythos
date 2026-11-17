import { describe, it, expect } from "vitest";
import storiesData from "@/data/stories.json";
import { placeIdsForStory, storiesSetAt } from "@/lib/story-locations";

type Story = Parameters<typeof placeIdsForStory>[0] & { id: string };
const stories = storiesData as unknown as Story[];

describe("storiesSetAt", () => {
  it("lists a story on every place the story page lists, unless the place is full", () => {
    for (const story of stories) {
      for (const placeId of placeIdsForStory(story)) {
        const listed = storiesSetAt(placeId);
        if (listed.length < 8) {
          expect(listed.map((s) => s.id)).toContain(story.id);
        }
      }
    }
  });

  it("returns nothing for an unknown place", () => {
    expect(storiesSetAt("no-such-place")).toEqual([]);
  });
});
