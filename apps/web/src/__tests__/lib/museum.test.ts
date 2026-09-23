import { describe, expect, it } from "vitest";
import {
  getMuseumObjectsFor,
  getMuseumPortrait,
  type MuseumObject,
} from "@/lib/museum";

const base = {
  institution: "Museum",
  description: "d",
  url: "https://example.org",
  imageRights: "Public Domain",
  imageUrl: "https://example.org/i.jpg",
};

it("requires an explicit hero association, not just a story connection", () => {
  const objects: MuseumObject[] = [
    {
      ...base,
      id: "portrait",
      title: "Hero",
      context: "Ancient object",
      heroIds: ["heracles"],
    },
    {
      ...base,
      id: "story-only",
      title: "Story",
      context: "Ancient object",
      storyIds: ["labors-of-hercules"],
    },
  ];
  expect(
    getMuseumObjectsFor({ hero: "heracles" }, objects).map((o) => o.id),
  ).toEqual(["portrait"]);
  expect(getMuseumObjectsFor({ hero: "perseus" }, objects)).toEqual([]);
});

const fixture: MuseumObject[] = [
  {
    ...base,
    id: "later",
    title: "Painting",
    context: "Later European depiction",
    deityIds: ["zeus"],
  },
  {
    ...base,
    id: "ancient",
    title: "Vase",
    context: "Ancient object",
    deityIds: ["zeus"],
  },
  {
    ...base,
    id: "noimg",
    title: "Lost",
    context: "Ancient object",
    deityIds: ["zeus"],
    imageUrl: undefined,
  },
  {
    ...base,
    id: "beast",
    title: "Gorgon",
    context: "Ancient object",
    creatureIds: ["medusa"],
  },
];

describe("getMuseumObjectsFor", () => {
  it("returns objects for the figure with ancient objects first", () => {
    expect(
      getMuseumObjectsFor({ deity: "zeus" }, fixture).map((o) => o.id),
    ).toEqual(["ancient", "later"]);
  });

  it("skips objects without an image", () => {
    const ids = getMuseumObjectsFor({ deity: "zeus" }, fixture).map(
      (o) => o.id,
    );
    expect(ids).not.toContain("noimg");
  });

  it("matches creatures separately from deities", () => {
    expect(
      getMuseumObjectsFor({ creature: "medusa" }, fixture).map((o) => o.id),
    ).toEqual(["beast"]);
    expect(getMuseumObjectsFor({ deity: "medusa" }, fixture)).toEqual([]);
  });
});

describe("getMuseumPortrait", () => {
  it("picks an ancient object, never a later European depiction", () => {
    expect(
      getMuseumPortrait(getMuseumObjectsFor({ deity: "zeus" }, fixture))?.id,
    ).toBe("ancient");
    expect(getMuseumPortrait([fixture[0]])).toBeNull();
  });

  it("falls back to a later in-tradition work", () => {
    const folio = { ...fixture[0], id: "folio", context: "Later depiction" };
    expect(getMuseumPortrait([fixture[0], folio])?.id).toBe("folio");
  });
});
