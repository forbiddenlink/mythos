interface RelationshipEnds {
  fromDeityId: string;
  toDeityId: string;
}

/** Counts unique deity pairs, the same de-duplication the graph edges use. */
export function countUniqueRelationships(
  relationships: RelationshipEnds[],
  deityIds: Set<string>,
): number {
  const seen = new Set<string>();
  for (const rel of relationships) {
    if (!deityIds.has(rel.fromDeityId) || !deityIds.has(rel.toDeityId))
      continue;
    seen.add([rel.fromDeityId, rel.toDeityId].sort().join("-"));
  }
  return seen.size;
}
