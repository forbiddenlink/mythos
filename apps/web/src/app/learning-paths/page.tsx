import { getDeities, getStories } from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { LearningPathsPageClient } from "./LearningPathsPageClient";

export default function LearningPathsPage() {
  return (
    <LearningPathsPageClient
      allDeities={project(getDeities(), [
        "id",
        "name",
        "slug",
        "pantheonId",
        "domain",
        "importanceRank",
      ])}
      allStories={project(getStories(), [
        "id",
        "title",
        "slug",
        "pantheonId",
        "category",
        "moralThemes",
      ])}
    />
  );
}
