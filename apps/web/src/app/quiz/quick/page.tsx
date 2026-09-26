import { getDeities } from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { QuickQuizPageClient } from "./QuickQuizPageClient";

export default function Page() {
  return (
    <QuickQuizPageClient
      deitiesData={project(getDeities(), [
        "id",
        "name",
        "domain",
        "pantheonId",
      ])}
    />
  );
}
