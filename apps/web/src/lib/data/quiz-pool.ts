import "server-only";

import artifactsJson from "@/data/artifacts.json";
import creaturesJson from "@/data/creatures.json";
import locationsJson from "@/data/locations.json";
import type { MythologyQuizPool } from "@/components/quiz/MythologyQuiz";
import { getDeities, getRelationships } from "./catalog";
import { pick, project } from "./project";

type Sources = Array<{ source?: string; text?: string }> | undefined;

/** Keep only the first cited source title: all the quiz shows is one citation. */
export function firstSourceOnly(sources: Sources): Sources {
  const source = sources
    ?.map((entry) => entry.source?.trim())
    .find((value) => Boolean(value));
  return source ? [{ source }] : undefined;
}

interface PoolRow {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string | null;
  primarySources?: Sources;
  habitat?: string;
  type?: string;
}

/** Question material for the mythology quiz, without biographies or passages. */
export function getMythologyQuizPool(): MythologyQuizPool {
  const creatures = creaturesJson as unknown as PoolRow[];
  const artifacts = artifactsJson as unknown as PoolRow[];
  const locations = locationsJson as unknown as PoolRow[];

  return {
    deities: getDeities().map((d) => ({
      ...pick(d, [
        "id",
        "name",
        "slug",
        "domain",
        "symbols",
        "pantheonId",
        "imageUrl",
        "gender",
      ]),
      primarySources: firstSourceOnly(d.primarySources),
    })),
    relationships: project(getRelationships(), [
      "id",
      "fromDeityId",
      "toDeityId",
      "relationshipType",
    ]),
    creatures: creatures.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug ?? c.id,
      habitat: c.habitat ?? "",
      imageUrl: c.imageUrl ?? null,
      primarySources: firstSourceOnly(c.primarySources),
    })),
    artifacts: artifacts.map((a) => ({
      id: a.id,
      name: a.name,
      slug: a.slug ?? a.id,
      type: a.type ?? "",
      imageUrl: a.imageUrl ?? null,
      primarySources: firstSourceOnly(a.primarySources),
    })),
    locations: locations.map((l) => ({
      id: l.id,
      name: l.name,
      imageUrl: l.imageUrl ?? null,
      primarySources: firstSourceOnly(l.primarySources),
    })),
  };
}
