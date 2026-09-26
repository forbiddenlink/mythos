import { getPantheons, getStories } from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { CompareMythsPageClient } from "./CompareMythsPageClient";

export default function Page() {
  return (
    <CompareMythsPageClient
      pantheonsData={project(getPantheons(), ["id", "name", "slug"])}
      storiesData={project(getStories(), [
        "id",
        "pantheonId",
        "title",
        "slug",
        "summary",
        "keyExcerpts",
        "category",
        "moralThemes",
        "culturalSignificance",
        "imageUrl",
        "citationSources",
      ])}
    />
  );
}
