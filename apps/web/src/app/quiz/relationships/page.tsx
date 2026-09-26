import { getDeities, getRelationships } from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { RelationshipQuizPageClient } from "./RelationshipQuizPageClient";

export default function Page() {
  return (
    <RelationshipQuizPageClient
      deitiesData={project(getDeities(), [
        "id",
        "name",
        "slug",
        "pantheonId",
        "domain",
        "imageUrl",
      ])}
      relationshipsData={project(getRelationships(), [
        "id",
        "fromDeityId",
        "toDeityId",
        "relationshipType",
      ])}
    />
  );
}
