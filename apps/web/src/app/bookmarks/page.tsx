import artifacts from "@/data/artifacts.json";
import creatures from "@/data/creatures.json";
import locations from "@/data/locations.json";
import {
  getDeities,
  getHeroes,
  getPantheonShortNames,
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
        "pantheonId",
        "domain",
        "description",
        "imageUrl",
      ])}
      storiesData={getStories().map((story) => ({
        ...pick(story, ["id", "title", "slug", "summary", "pantheonId"]),
        imageUrl: story.imageUrl ?? null,
        themes: (story as { themes?: string[] }).themes ?? [],
      }))}
      pantheonsData={getPantheons().map((pantheon) => ({
        ...pick(pantheon, ["id", "name", "slug", "description"]),
        imageUrl: pantheon.imageUrl ?? null,
      }))}
      heroesData={getHeroes().map((hero) => ({
        id: hero.id,
        name: hero.name,
        slug: hero.slug,
        pantheonId: hero.pantheonId ?? "",
        description: String(hero.description ?? ""),
        imageUrl: (hero.imageUrl as string | null | undefined) ?? null,
      }))}
      sourcesData={getSourceWorks()}
      creaturesData={project(creatures, [
        "id",
        "name",
        "slug",
        "pantheonId",
        "description",
        "imageUrl",
      ])}
      artifactsData={project(artifacts, [
        "id",
        "name",
        "slug",
        "pantheonId",
        "description",
        "imageUrl",
      ])}
      locationsData={locations.map((location) => ({
        id: location.id,
        name: location.name,
        pantheonId: location.pantheonId,
        description: location.description,
        imageUrl: location.imageUrl ?? null,
        locationType: location.locationType,
      }))}
      traditionNames={getPantheonShortNames()}
    />
  );
}
