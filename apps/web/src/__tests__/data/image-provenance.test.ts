import { describe, expect, it } from "vitest";
import artifacts from "@/data/artifacts.json";
import creatures from "@/data/creatures.json";
import deities from "@/data/deities.json";
import heroes from "@/data/heroes.json";
import provenance from "@/data/image-provenance.json";
import journeys from "@/data/journeys.json";
import locations from "@/data/locations.json";
import pantheons from "@/data/pantheons.json";
import stories from "@/data/stories.json";
import {
  getImageProvenance,
  isIllustrativeImage,
} from "@/lib/image-provenance";
import {
  IMAGE_ENTITY_TYPES,
  type ImageEntityType,
  ImageProvenanceFileSchema,
} from "@/lib/schemas";

const catalogs: Record<
  ImageEntityType,
  Array<{ id: string; imageUrl?: string | null }>
> = {
  deity: deities,
  hero: heroes,
  creature: creatures,
  artifact: artifacts,
  location: locations,
  story: stories,
  pantheon: pantheons,
  journey: journeys,
};

describe("image provenance", () => {
  it("matches its schema", () => {
    const result = ImageProvenanceFileSchema.safeParse(provenance);
    expect(result.success ? [] : result.error.issues).toEqual([]);
  });

  it.each(IMAGE_ENTITY_TYPES)(
    "records provenance for every %s with a local image",
    (entityType) => {
      const missing = catalogs[entityType]
        .filter((entity) => entity.imageUrl?.startsWith("/"))
        .filter((entity) => !getImageProvenance(entityType, entity.id))
        .map((entity) => entity.id);
      expect(missing).toEqual([]);
    },
  );

  it.each(IMAGE_ENTITY_TYPES)(
    "has no provenance rows for %s ids that no longer exist",
    (entityType) => {
      const ids = new Set(catalogs[entityType].map((entity) => entity.id));
      const rows = Object.keys(
        (provenance.entities as Record<string, Record<string, string>>)[
          entityType
        ] ?? {},
      );
      expect(rows.filter((id) => !ids.has(id))).toEqual([]);
    },
  );

  it("points every row at a defined generator", () => {
    const generators = new Set(Object.keys(provenance.generators));
    for (const rows of Object.values(provenance.entities)) {
      for (const [id, generator] of Object.entries(rows)) {
        expect(generators.has(generator), id).toBe(true);
      }
    }
  });

  it("resolves a procedural plate and an AI illustration", () => {
    const plate = getImageProvenance("deity", "helios");
    expect(plate?.kind).toBe("illustration-procedural");
    expect(plate?.scripts).toContain("scripts/generate_deity_plates.py");

    const ai = getImageProvenance("deity", "zeus");
    expect(ai?.kind).toBe("illustration-ai");
    expect(ai?.label).toMatch(/AI-generated/);
    expect(isIllustrativeImage(ai)).toBe(true);
  });

  it("returns undefined for unknown entities", () => {
    expect(getImageProvenance("deity", "not-a-deity")).toBeUndefined();
    expect(isIllustrativeImage(undefined)).toBe(false);
  });
});
