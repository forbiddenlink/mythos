/** Slim, serializable records shared by the server projection and path explorer. */
export interface ConnectionFigure {
  id: string;
  name: string;
  slug: string;
}

export interface ConnectionEvidence {
  sourceId: string;
  sourceTitle?: string;
  locator: string;
  sourceUrl: string;
  edition: string;
}

export interface ConnectionRelationship {
  id: string;
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
  description?: string | null;
  confidenceLevel?: string;
  isDisputed?: boolean;
  evidence?: readonly ConnectionEvidence[];
}

export interface ConnectionStep {
  fromId: string;
  toId: string;
  relationship: ConnectionRelationship;
  reversed: boolean;
}

export type ConnectionPath =
  | { status: "found"; steps: ConnectionStep[] }
  | { status: "unknown-figure" | "disconnected"; steps: [] };

/**
 * Breadth-first traversal finds the fewest recorded edges, in either direction.
 * Sorted adjacency makes ties stable regardless of input ordering. For duplicate
 * edges between the same pair, an attached passage wins, then relationship ID.
 * This does not imply that all edges are kinship or that a passage proves a claim.
 */
export function shortestRelationshipPath(
  figures: readonly ConnectionFigure[],
  relationships: readonly ConnectionRelationship[],
  startId: string,
  endId: string,
): ConnectionPath {
  const ids = new Set(figures.map((figure) => figure.id));
  if (!ids.has(startId) || !ids.has(endId)) {
    return { status: "unknown-figure", steps: [] };
  }
  if (startId === endId) return { status: "found", steps: [] };

  const adjacency = new Map<string, ConnectionStep[]>();
  for (const relationship of relationships) {
    const { fromDeityId, toDeityId } = relationship;
    if (!ids.has(fromDeityId) || !ids.has(toDeityId)) continue;
    for (const reversed of [false, true]) {
      const fromId = reversed ? toDeityId : fromDeityId;
      const toId = reversed ? fromDeityId : toDeityId;
      const edges = adjacency.get(fromId) ?? [];
      edges.push({ fromId, toId, relationship, reversed });
      adjacency.set(fromId, edges);
    }
  }
  for (const edges of adjacency.values()) {
    edges.sort(
      (a, b) =>
        a.toId.localeCompare(b.toId) ||
        Number(Boolean(b.relationship.evidence?.length)) -
          Number(Boolean(a.relationship.evidence?.length)) ||
        a.relationship.id.localeCompare(b.relationship.id),
    );
  }

  const visited = new Set([startId]);
  const queue = [startId];
  const previous = new Map<string, ConnectionStep>();
  for (let index = 0; index < queue.length; index++) {
    for (const step of adjacency.get(queue[index]) ?? []) {
      if (visited.has(step.toId)) continue;
      visited.add(step.toId);
      previous.set(step.toId, step);
      if (step.toId === endId) {
        const steps: ConnectionStep[] = [];
        let cursor = endId;
        while (cursor !== startId) {
          const edge = previous.get(cursor)!;
          steps.unshift(edge);
          cursor = edge.fromId;
        }
        return { status: "found", steps };
      }
      queue.push(step.toId);
    }
  }
  return { status: "disconnected", steps: [] };
}

/** Read as "from figure [label] to figure", following the displayed path. */
export function connectionStepLabel(step: ConnectionStep): string {
  switch (step.relationship.relationshipType) {
    case "parent_of":
      return step.reversed ? "is child of" : "is parent of";
    case "child_of":
      return step.reversed ? "is parent of" : "is child of";
    case "sibling_of":
      return "is sibling of";
    case "spouse_of":
      return "is spouse of";
    case "lover_of":
      return "is lover of";
    case "ally_of":
      return "is ally of";
    case "enemy_of":
      return "is enemy of";
    case "aspect_of":
      return step.reversed ? "has a recorded aspect in" : "is aspect of";
    default:
      return "has a recorded connection to";
  }
}
