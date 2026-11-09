import { describe, expect, it } from "vitest";
import type { ZodType } from "zod";
import pantheons from "@/data/pantheons.json";
import deities from "@/data/deities.json";
import stories from "@/data/stories.json";
import creatures from "@/data/creatures.json";
import artifacts from "@/data/artifacts.json";
import locations from "@/data/locations.json";
import relationships from "@/data/relationships.json";
import journeys from "@/data/journeys.json";
import heroes from "@/data/heroes.json";
import {
  PantheonsArraySchema,
  DeitiesArraySchema,
  StoriesArraySchema,
  CreaturesArraySchema,
  ArtifactsArraySchema,
  LocationsArraySchema,
  RelationshipsArraySchema,
  JourneysArraySchema,
} from "@/lib/schemas";

const catalogs: Array<{ name: string; schema: ZodType; data: unknown }> = [
  { name: "pantheons", schema: PantheonsArraySchema, data: pantheons },
  { name: "deities", schema: DeitiesArraySchema, data: deities },
  { name: "stories", schema: StoriesArraySchema, data: stories },
  { name: "creatures", schema: CreaturesArraySchema, data: creatures },
  { name: "artifacts", schema: ArtifactsArraySchema, data: artifacts },
  { name: "locations", schema: LocationsArraySchema, data: locations },
  {
    name: "relationships",
    schema: RelationshipsArraySchema,
    data: relationships,
  },
  { name: "journeys", schema: JourneysArraySchema, data: journeys },
];

function catalogStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(catalogStrings);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(catalogStrings);
  }
  return [];
}

describe("principal catalog datasets", () => {
  it.each(catalogs)(
    "$name satisfies its runtime schema",
    ({ schema, data }) => {
      const result = schema.safeParse(data);
      expect(result.success ? [] : result.error.issues).toEqual([]);
    },
  );

  it.each(catalogs)(
    "$name contains no invention instructions in published text",
    ({ data }) => {
      for (const text of catalogStrings(data)) {
        expect(text).not.toMatch(/(?:^|[.!?;:\n])\s*do not invent\b/i);
      }
    },
  );
});

describe("pronunciation data", () => {
  // A slash-wrapped IPA string such as "/ˈkupe/" lands in the RSC payload,
  // and Googlebot crawls it as a relative URL that 404s. The component adds
  // the slashes at render time instead.
  it.each([
    { name: "deities", data: deities as unknown[] },
    { name: "heroes", data: heroes as unknown[] },
  ])("$name stores IPA without surrounding slashes", ({ data }) => {
    const wrapped = data
      .map(
        (entry) =>
          (entry as { pronunciation?: { ipa?: string } }).pronunciation?.ipa,
      )
      .filter(
        (ipa): ipa is string => typeof ipa === "string" && /^\/|\/$/.test(ipa),
      );
    expect(wrapped).toEqual([]);
  });
});
