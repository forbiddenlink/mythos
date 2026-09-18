import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import deities from "@/data/deities.json";
import heroes from "@/data/heroes.json";
import stories from "@/data/stories.json";
import creatures from "@/data/creatures.json";
import artifacts from "@/data/artifacts.json";
import locations from "@/data/locations.json";
import journeys from "@/data/journeys.json";

describe("catalog illustrations", () => {
  it.each(Object.entries({ deities, heroes, stories, creatures, artifacts, locations, journeys }))(
    "%s local image references resolve to published assets",
    (_name, entries) => {
      for (const entry of entries) {
        if (!entry.imageUrl?.startsWith("/")) continue;
        const asset = resolve(process.cwd(), "public", entry.imageUrl.slice(1));
        expect(existsSync(asset), `${entry.id}: ${entry.imageUrl}`).toBe(true);
      }
    },
  );
});
