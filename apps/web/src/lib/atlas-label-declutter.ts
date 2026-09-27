/**
 * Screen-space label declutter for the Aether Map (/atlas).
 *
 * The 3D star map places one tradition label per pantheon cluster; clusters
 * sit on a fixed-radius ring, so at some camera angles two clusters project
 * close enough in screen space that their labels overlap and become
 * unreadable. Rather than reshaping the 3D layout (which several other
 * tests and the reduced-motion fallback depend on), this hides the
 * lower-priority label in each colliding pair. The hidden tradition is still
 * reachable: hovering any of its stars shows its name, and every tradition is
 * listed in AtlasTraditionGrid below the map.
 *
 * Pure and side-effect free so it can be unit-tested without a WebGL canvas;
 * the caller (AetherMap) supplies already-measured screen-space boxes.
 */

export interface LabelBox {
  id: string;
  /** Screen-space centre, in CSS pixels. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Higher wins a collision. Ties break by `id` for determinism. */
  priority: number;
}

/**
 * Greedy highest-priority-first placement: keeps a label unless its padded
 * bounding box overlaps a higher-priority label already kept. Returns the
 * set of ids that should be hidden.
 */
export function declutterLabels(
  boxes: readonly LabelBox[],
  padding = 4,
): ReadonlySet<string> {
  const ordered = [...boxes].sort(
    (a, b) => b.priority - a.priority || a.id.localeCompare(b.id),
  );
  const kept: LabelBox[] = [];
  const hidden = new Set<string>();

  for (const box of ordered) {
    const collidesWithKept = kept.some((k) => boxesOverlap(box, k, padding));
    if (collidesWithKept) {
      hidden.add(box.id);
    } else {
      kept.push(box);
    }
  }

  return hidden;
}

function boxesOverlap(a: LabelBox, b: LabelBox, padding: number): boolean {
  const aLeft = a.x - a.width / 2 - padding;
  const aRight = a.x + a.width / 2 + padding;
  const aTop = a.y - a.height / 2 - padding;
  const aBottom = a.y + a.height / 2 + padding;
  const bLeft = b.x - b.width / 2 - padding;
  const bRight = b.x + b.width / 2 + padding;
  const bTop = b.y - b.height / 2 - padding;
  const bBottom = b.y + b.height / 2 + padding;
  return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
}

/**
 * `true` when the hidden-id set actually changed, so callers can skip a
 * state update (and the resulting re-render) when nothing moved enough to
 * change the outcome.
 */
export function hiddenSetsDiffer(
  a: ReadonlySet<string>,
  b: ReadonlySet<string>,
): boolean {
  if (a.size !== b.size) return true;
  for (const id of a) {
    if (!b.has(id)) return true;
  }
  return false;
}
