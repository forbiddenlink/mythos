import "server-only";

import creatures from "@/data/creatures.json";
import sources from "@/data/sources.json";
import { getDeities, getStories } from "@/lib/data/catalog";
import type { JourneyDetail, JourneyStopContext } from "@/lib/journeys";

/** Resolve only catalog records in this tradition; unknown names stay plain text. */
export function getJourneyStopContexts(
  journey: JourneyDetail,
): Record<string, JourneyStopContext> {
  const deities = getDeities().filter(
    (deity) => deity.pantheonId === journey.pantheonId,
  );
  return Object.fromEntries(
    journey.waypoints.map((stop) => {
      const source = sources.find(
        (work) => work.id === stop.sourcePassage?.sourceId,
      );
      return [
        stop.id,
        {
          deities: (stop.deities ?? []).flatMap((name) => {
            const deity = deities.find((record) => record.name === name);
            return deity
              ? [{ label: name, href: `/deities/${deity.slug}` }]
              : [];
          }),
          creatures: creatures
            .filter(
              (creature) =>
                creature.pantheonId === journey.pantheonId &&
                (stop.creatureIds?.includes(creature.id) ||
                  stop.creatures?.includes(creature.name)),
            )
            .map((creature) => ({
              label: creature.name,
              href: `/creatures/${creature.slug}`,
            })),
          stories: getStories()
            .filter((story) => stop.storyIds?.includes(story.id))
            .map((story) => ({
              label: story.title,
              href: `/stories/${story.slug}`,
            })),
          ...(source && stop.sourcePassage
            ? {
                passage: {
                  label: `${source.title} · ${stop.sourcePassage.locator}`,
                  href:
                    stop.sourcePassage.book && source.id === "odyssey"
                      ? `${source.externalUrl}:book=${stop.sourcePassage.book}`
                      : `/sources/${source.id}`,
                },
              }
            : {}),
        },
      ];
    }),
  );
}
