import { describe, expect, it } from "vitest";
import type { ZodType } from "zod";
import pantheons from "@/data/pantheons.json";
import deities from "@/data/deities.json";
import stories from "@/data/stories.json";
import creatures from "@/data/creatures.json";
import artifacts from "@/data/artifacts.json";
import locations from "@/data/locations.json";
import relationships from "@/data/relationships.json";
import {
  PantheonsArraySchema,
  DeitiesArraySchema,
  StoriesArraySchema,
  CreaturesArraySchema,
  ArtifactsArraySchema,
  LocationsArraySchema,
  RelationshipsArraySchema,
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
];

function catalogStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(catalogStrings);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(catalogStrings);
  }
  return [];
}

describe("catalogs served by the GraphQL route", () => {
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
