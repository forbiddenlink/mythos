import locations from "@/data/locations.json";
import {
  getDeityRefs,
  getDeities,
  getPantheons,
  getStories,
  getStoryRefs,
} from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { ProgressPageClient } from "./ProgressPageClient";

export default function ProgressPage() {
  return (
    <ProgressPageClient
      totals={{
        deities: getDeities().length,
        stories: getStories().length,
        locations: locations.length,
        pantheons: getPantheons().length,
      }}
      catalog={{
        deities: getDeityRefs(),
        stories: getStoryRefs(),
        pantheons: project(getPantheons(), ["id", "name", "slug"]),
      }}
    />
  );
}
