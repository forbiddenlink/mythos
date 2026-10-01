export interface PinGroup<T> {
  locations: T[];
  center: { lat: number; lng: number };
}

/**
 * Clusters and pins are at least 36px wide. Groups whose on-screen centres are
 * closer than this are merged, so every marker on the map stays a clear
 * 24x24 CSS px target (WCAG 2.5.8) instead of sitting half under a neighbour.
 */
export const MIN_MARKER_SPACING = 48;

/**
 * Repeatedly merges the two closest groups until none are within
 * `minDistance` pixels. The merged centre is the location-weighted mean.
 */
export function mergeCrowdedGroups<T>(
  groups: PinGroup<T>[],
  toPoint: (center: { lat: number; lng: number }) => { x: number; y: number },
  minDistance = MIN_MARKER_SPACING,
): PinGroup<T>[] {
  const work = groups.map((g) => ({ ...g, point: toPoint(g.center) }));
  for (;;) {
    let best: [number, number] | null = null;
    let bestDistance = minDistance;
    for (let i = 0; i < work.length; i++) {
      for (let j = i + 1; j < work.length; j++) {
        const d = Math.hypot(
          work[i].point.x - work[j].point.x,
          work[i].point.y - work[j].point.y,
        );
        if (d < bestDistance) {
          bestDistance = d;
          best = [i, j];
        }
      }
    }
    if (!best) break;
    const [a, b] = [work[best[0]], work[best[1]]];
    const total = a.locations.length + b.locations.length;
    const center = {
      lat:
        (a.center.lat * a.locations.length +
          b.center.lat * b.locations.length) /
        total,
      lng:
        (a.center.lng * a.locations.length +
          b.center.lng * b.locations.length) /
        total,
    };
    work[best[0]] = {
      locations: [...a.locations, ...b.locations],
      center,
      point: toPoint(center),
    };
    work.splice(best[1], 1);
  }
  return work.map(({ locations, center }) => ({ locations, center }));
}
