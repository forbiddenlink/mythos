import {
  getDeities,
  getHeroes,
  getPantheons,
  getSourceWorks,
  getStories,
} from "@/lib/data/catalog";
import { pick, project } from "@/lib/data/project";
import { BookmarksPageClient } from "./BookmarksPageClient";

export default function Page() {
  return (
    <BookmarksPageClient
      deitiesData={project(getDeities(), [
        "id",
        "name",
        "slug",
        "domain",
        "description",
        "importanceRank",
      ])}
      storiesData={getStories().map((story) => ({
        ...pick(story, ["id", "title", "slug", "summary"]),
        themes: (story as { themes?: string[] }).themes ?? [],
      }))}
      pantheonsData={project(getPantheons(), [
        "id",
        "name",
        "slug",
        "description",
      ])}
      heroesData={getHeroes().map((hero) => ({
        id: hero.id,
        name: hero.name,
        slug: hero.slug,
        description: String(hero.description ?? ""),
      }))}
      sourcesData={getSourceWorks()}
    />
  );
}
