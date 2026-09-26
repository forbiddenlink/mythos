import { getDeities, getPantheons, getRelationships } from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { KnowledgeGraphPageClient } from "./KnowledgeGraphPageClient";

export default function Page() {
  return (
    <KnowledgeGraphPageClient
      deitiesData={project(getDeities(), [
        "id",
        "name",
        "slug",
        "pantheonId",
        "alternateNames",
        "domain",
        "gender",
        "importanceRank",
        "imageUrl",
        "crossPantheonParallels",
      ])}
      relationshipsData={project(getRelationships(), [
        "id",
        "fromDeityId",
        "toDeityId",
        "relationshipType",
        "description",
      ])}
      pantheonsData={project(getPantheons(), ["id", "name", "slug"])}
    />
  );
}
