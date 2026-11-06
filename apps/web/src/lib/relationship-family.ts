/**
 * Groups relationship types for views that filter or style edges by kind.
 * `lover_of` counts as a partner, matching the relationship quiz, which
 * accepts lovers as spouse/consort answers. `ally_of`, `enemy_of` and
 * `aspect_of` are not family ties and fall under "other".
 */
export type RelationshipFamily = "lineage" | "partner" | "sibling" | "other";

const FAMILY_BY_TYPE: Record<string, RelationshipFamily> = {
  parent_of: "lineage",
  child_of: "lineage",
  spouse_of: "partner",
  lover_of: "partner",
  sibling_of: "sibling",
};

export function relationshipFamily(type: string): RelationshipFamily {
  return FAMILY_BY_TYPE[type.toLowerCase()] ?? "other";
}
