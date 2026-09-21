import museumObjects from "../../data/museum-objects.json";
import deities from "../../data/deities.json";
import creatures from "../../data/creatures.json";
import stories from "../../data/stories.json";

const { describe, it, expect } = await import("vitest");

type MuseumObject = {
  id: string;
  storyIds: string[];
  deityIds?: string[];
  creatureIds?: string[];
  title: string;
  institution: string;
  accessionNumber: string;
  date: string;
  culture: string;
  creator?: string;
  medium: string;
  context: string;
  description: string;
  url: string;
  imageRights: string;
  checkedAt: string;
  imageUrl?: string;
  imageAlt?: string;
};

const objects = museumObjects as MuseumObject[];

const deitySlugs = new Set((deities as { slug: string }[]).map((d) => d.slug));
const creatureSlugs = new Set(
  (creatures as { slug: string }[]).map((c) => c.slug),
);
const storyIds = new Set((stories as { id: string }[]).map((s) => s.id));

const ALLOWED_CONTEXTS = new Set([
  "Ancient object",
  "Later European depiction",
  "Later depiction",
]);

// Hostnames this data file is known to reference. Keep in sync with
// next.config.ts remotePatterns (updated separately, not by this test).
const ALLOWED_IMAGE_HOSTS = new Set([
  "collectionapi.metmuseum.org",
  "images.metmuseum.org",
  "www.artic.edu",
]);

describe("museum-objects.json data integrity", () => {
  it("should have at least one object", () => {
    expect(objects.length).toBeGreaterThan(0);
  });

  it("every object should have a unique id", () => {
    const ids = objects.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every object should have required fields", () => {
    for (const obj of objects) {
      expect(obj.id).toBeTruthy();
      expect(Array.isArray(obj.storyIds)).toBe(true);
      expect(obj.title).toBeTruthy();
      expect(obj.institution).toBeTruthy();
      expect(obj.accessionNumber).toBeTruthy();
      expect(obj.date).toBeTruthy();
      expect(obj.culture).toBeTruthy();
      expect(obj.medium).toBeTruthy();
      expect(obj.context).toBeTruthy();
      expect(obj.description).toBeTruthy();
      expect(obj.url).toBeTruthy();
      expect(obj.imageRights).toBeTruthy();
      expect(obj.checkedAt).toBeTruthy();
    }
  });

  it("every storyId should reference a real story", () => {
    for (const obj of objects) {
      for (const sid of obj.storyIds) {
        expect(storyIds.has(sid), `${obj.id}: unknown storyId "${sid}"`).toBe(
          true,
        );
      }
    }
  });

  it("every deityId should reference a real deity slug", () => {
    for (const obj of objects) {
      for (const did of obj.deityIds ?? []) {
        expect(deitySlugs.has(did), `${obj.id}: unknown deityId "${did}"`).toBe(
          true,
        );
      }
    }
  });

  it("every creatureId should reference a real creature slug", () => {
    for (const obj of objects) {
      for (const cid of obj.creatureIds ?? []) {
        expect(
          creatureSlugs.has(cid),
          `${obj.id}: unknown creatureId "${cid}"`,
        ).toBe(true);
      }
    }
  });

  it("imageRights should mention Public Domain or CC0", () => {
    for (const obj of objects) {
      const ir = obj.imageRights;
      const ok =
        /public domain/i.test(ir) ||
        /CC0/.test(ir) ||
        /reuse not established/i.test(ir);
      expect(ok, `${obj.id}: unexpected imageRights "${ir}"`).toBe(true);
    }
  });

  it("imageUrl, when present, should be https on an allowed hostname", () => {
    for (const obj of objects) {
      if (!obj.imageUrl) continue;
      const url = new URL(obj.imageUrl);
      expect(url.protocol, `${obj.id}: imageUrl not https`).toBe("https:");
      expect(
        ALLOWED_IMAGE_HOSTS.has(url.hostname),
        `${obj.id}: unexpected image hostname "${url.hostname}"`,
      ).toBe(true);
    }
  });

  it("context should be one of the allowed values", () => {
    for (const obj of objects) {
      expect(
        ALLOWED_CONTEXTS.has(obj.context),
        `${obj.id}: unexpected context "${obj.context}"`,
      ).toBe(true);
    }
  });
});
