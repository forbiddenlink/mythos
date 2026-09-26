import { describe, expect, it } from "vitest";
import journeysData from "@/data/journeys.json";
import locations from "@/data/locations.json";
import {
  isOtherworldJourney,
  mappedWaypoints,
  sortWaypoints,
  type JourneyDetail,
} from "@/lib/journeys";

const journeys = journeysData as unknown as JourneyDetail[];
const locationIds = new Set(locations.map((l) => l.id));

describe("journeys", () => {
  it("have unique ids and slugs", () => {
    expect(new Set(journeys.map((j) => j.id)).size).toBe(journeys.length);
    expect(new Set(journeys.map((j) => j.slug)).size).toBe(journeys.length);
  });

  it("map every earthly waypoint", () => {
    for (const journey of journeys.filter((j) => !isOtherworldJourney(j))) {
      expect(mappedWaypoints(journey.waypoints), journey.id).toHaveLength(
        journey.waypoints.length,
      );
    }
  });

  it("number waypoints 1..n in order", () => {
    for (const journey of journeys) {
      expect(
        sortWaypoints(journey.waypoints).map((w) => w.order),
        journey.id,
      ).toEqual(journey.waypoints.map((_, i) => i + 1));
    }
  });

  it("link waypoints only to catalog locations that exist", () => {
    for (const journey of journeys) {
      for (const waypoint of journey.waypoints) {
        if (waypoint.locationId) {
          expect(
            locationIds.has(waypoint.locationId),
            `${journey.id}/${waypoint.id}`,
          ).toBe(true);
        }
      }
    }
  });

  it("keep the routes ported from the retired /tours page", () => {
    const otherworld = journeys.filter(isOtherworldJourney).map((j) => j.slug);
    expect(otherworld).toEqual(
      expect.arrayContaining(["nine-realms", "duat-night-journey"]),
    );
    for (const slug of ["nine-realms", "duat-night-journey"]) {
      const journey = journeys.find((j) => j.slug === slug)!;
      expect(journey.waypoints.every((w) => w.locationId)).toBe(true);
    }
  });
});
