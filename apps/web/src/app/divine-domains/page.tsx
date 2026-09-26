import { getDeities, getPantheonShortNames } from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { DivineDomainsPageClient } from "./DivineDomainsPageClient";

export default function DivineDomainsPage() {
  return (
    <DivineDomainsPageClient
      deities={project(getDeities(), [
        "id",
        "name",
        "slug",
        "pantheonId",
        "domain",
        "description",
        "imageUrl",
        "alternateNames",
        "importanceRank",
        "crossPantheonParallels",
      ])}
      pantheonNames={getPantheonShortNames()}
    />
  );
}
