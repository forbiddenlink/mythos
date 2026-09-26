/**
 * Journey shapes shared by the journeys pages. Types and pure helpers only:
 * the data is read on the server (`getJourneys` in `@/lib/data/catalog`).
 *
 * Most journeys trace an earthly route and draw on a map. An "otherworld"
 * journey (the Nine Realms, the Duat) crosses realms with no coordinates, so
 * it is shown as an ordered route instead of pins on a map.
 */
export type JourneySetting = "earthly" | "otherworld";

export interface JourneyWaypoint {
  id: string;
  name: string;
  order: number;
  description: string;
  /** [lat, lng]; absent for otherworld stops. */
  coordinates?: [number, number];
  /** Catalog location for this stop, when there is one. */
  locationId?: string;
  events?: string[];
  creatures?: string[];
  deities?: string[];
  duration?: string;
}

export interface JourneyDetail {
  id: string;
  heroId: string;
  heroKind: "hero" | "deity";
  heroName: string;
  title: string;
  slug: string;
  description: string;
  pantheonId: string;
  duration: string;
  imageUrl?: string;
  source: string;
  sourceId?: string;
  setting?: JourneySetting;
  waypoints: JourneyWaypoint[];
}

export function isOtherworldJourney(
  journey: Pick<JourneyDetail, "setting">,
): boolean {
  return journey.setting === "otherworld";
}

export function sortWaypoints<T extends { order: number }>(
  waypoints: readonly T[],
): T[] {
  return waypoints.toSorted((a, b) => a.order - b.order);
}

/** Waypoints with coordinates, in route order. */
export function mappedWaypoints<
  T extends { order: number; coordinates?: [number, number] },
>(waypoints: readonly T[]): Array<T & { coordinates: [number, number] }> {
  return sortWaypoints(
    waypoints.filter((w): w is T & { coordinates: [number, number] } =>
      Array.isArray(w.coordinates),
    ),
  );
}
