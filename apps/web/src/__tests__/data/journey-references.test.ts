import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import journeysData from "@/data/journeys.json";
import creatures from "@/data/creatures.json";
import stories from "@/data/stories.json";
import sources from "@/data/sources.json";
import recordings from "@/data/story-audio.json";
import { getJourneyStopContexts } from "@/lib/journey-references";
import type { JourneyDetail } from "@/lib/journeys";

const journeys = journeysData as JourneyDetail[];

describe("journey reading links", () => {
  it("resolves Odyssey places, a creature profile and source books without inventing missing deities", () => {
    const odyssey = journeys.find((journey) => journey.slug === "odyssey")!;
    const contexts = getJourneyStopContexts(odyssey);
    expect(contexts.cyclops.creatures).toContainEqual({
      label: "Cyclops",
      href: "/creatures/cyclops",
    });
    expect(contexts.cyclops.deities).toContainEqual({
      label: "Poseidon",
      href: "/deities/poseidon",
    });
    expect(contexts.aeaea.deities).toEqual([
      { label: "Hermes", href: "/deities/hermes" },
    ]);
    expect(contexts.troy.stories).toEqual([
      { label: "The Trojan War", href: "/stories/trojan-war" },
    ]);
    expect(contexts.cyclops.passage?.label).toBe("Odyssey · Book 9");
    expect(contexts.cyclops.passage?.href).toContain(":book=9");
    expect(
      odyssey.waypoints.every(
        (stop) => stop.locationId && contexts[stop.id].passage,
      ),
    ).toBe(true);
  });

  it("uses valid source, creature and story ids across every journey", () => {
    expect(journeys).toHaveLength(8);
    for (const journey of journeys) {
      expect(Object.keys(getJourneyStopContexts(journey))).toHaveLength(
        journey.waypoints.length,
      );
      for (const stop of journey.waypoints) {
        for (const id of stop.storyIds ?? [])
          expect(stories.some((story) => story.id === id)).toBe(true);
        for (const id of stop.creatureIds ?? [])
          expect(creatures.some((creature) => creature.id === id)).toBe(true);
        if (stop.sourcePassage)
          expect(
            sources.some(
              (source) => source.id === stop.sourcePassage?.sourceId,
            ),
          ).toBe(true);
      }
      if (journey.storyId) {
        expect(stories.some((story) => story.id === journey.storyId)).toBe(
          true,
        );
        expect(Object.hasOwn(recordings, journey.storyId)).toBe(true);
        expect(
          existsSync(
            join(
              process.cwd(),
              "public/audio/stories",
              `${journey.storyId}.mp3`,
            ),
          ),
        ).toBe(true);
      }
    }
  });
});
