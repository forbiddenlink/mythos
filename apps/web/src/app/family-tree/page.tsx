import { getDeities, getPantheons, getRelationships } from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { FamilyTreePageClient } from "./FamilyTreePageClient";

export default function Page() {
  return (
    <FamilyTreePageClient
      pantheonsData={project(getPantheons(), ["id", "name"])}
      deitiesData={project(getDeities(), [
        "id",
        "name",
        "slug",
        "domain",
        "gender",
        "pantheonId",
      ])}
      relationshipsData={getRelationships().map((r) => ({
        id: r.id,
        fromDeityId: r.fromDeityId,
        toDeityId: r.toDeityId,
        relationshipType: r.relationshipType,
        description: r.description ?? null,
      }))}
    />
  );
}
