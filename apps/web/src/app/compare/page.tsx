import { Suspense } from "react";
import { RouteFallback } from "@/components/layout/route-fallback";
import {
  DEITY_LIST_FIELDS,
  getDeities,
  getPantheons,
  resolveParallelRefs,
} from "@/lib/data/catalog";
import { pick, project } from "@/lib/data/project";
import { ComparePageClient } from "./ComparePageClient";

export default function Page() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <ComparePageClient
        deitiesData={getDeities().map((deity) => ({
          ...pick(deity, DEITY_LIST_FIELDS),
          crossPantheonParallels: resolveParallelRefs(deity),
        }))}
        pantheonsData={project(getPantheons(), ["id", "name", "slug"])}
      />
    </Suspense>
  );
}
