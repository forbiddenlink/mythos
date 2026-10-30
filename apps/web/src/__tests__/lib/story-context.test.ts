import { describe, expect, it } from "vitest";
import { pickStoryContext, storyHrefIn } from "@/lib/story-context";
import { getStoryContexts } from "@/lib/story-contexts";

describe("storyHrefIn", () => {
  it("keeps the reader's list in the query string", () => {
    expect(storyHrefIn("titanomachy", "collection", "sky-fathers")).toBe(
      "/stories/titanomachy?in=collection/sky-fathers",
    );
    expect(storyHrefIn("titanomachy", "pantheon", "greek")).toBe(
      "/stories/titanomachy?in=pantheon/greek",
    );
  });
});

describe("getStoryContexts", () => {
  it("lists the pantheon and every collection the story belongs to", () => {
    const keys = getStoryContexts("titanomachy").map((c) => c.key);
    expect(keys).toContain("pantheon/greek");
    expect(keys).toContain("collection/sky-fathers");
    expect(keys).toContain("collection/war-gods");
  });

  it("numbers the story inside the pantheon in catalog order", () => {
    const greek = getStoryContexts("prometheus-fire").find(
      (c) => c.key === "pantheon/greek",
    );
    expect(greek).toMatchObject({
      position: 2,
      total: 11,
      listName: "Greek Pantheon",
      listHref: "/pantheons/greek",
    });
    expect(greek?.prev?.href).toBe("/stories/titanomachy?in=pantheon/greek");
    expect(greek?.next?.href).toBe("/stories/perseus-medusa?in=pantheon/greek");
  });

  it("has no previous link on the first story and no next on the last", () => {
    const first = getStoryContexts("titanomachy").find(
      (c) => c.key === "collection/sky-fathers",
    );
    expect(first?.position).toBe(1);
    expect(first?.prev).toBeNull();
    expect(first?.next?.title).toBeTruthy();

    const last = getStoryContexts("abduction-of-persephone").find(
      (c) => c.key === "pantheon/greek",
    );
    expect(last?.position).toBe(last?.total);
    expect(last?.next).toBeNull();
  });

  it("returns nothing for a story that is in no list", () => {
    expect(getStoryContexts("no-such-story")).toEqual([]);
  });
});

describe("pickStoryContext", () => {
  const contexts = getStoryContexts("titanomachy");

  it("returns null with no parameter, keeping current behaviour", () => {
    expect(pickStoryContext(contexts, null)).toBeNull();
    expect(pickStoryContext(contexts, "")).toBeNull();
  });

  it("returns the matching list", () => {
    expect(pickStoryContext(contexts, "pantheon/greek")?.key).toBe(
      "pantheon/greek",
    );
  });

  it("falls back to null for unknown or malformed values", () => {
    for (const bad of [
      "pantheon/atlantis",
      "collection/does-not-exist",
      "planet/greek",
      "greek",
      "pantheon/",
      "pantheon/greek/extra",
      "<script>alert(1)</script>",
      "../../etc/passwd",
    ]) {
      expect(pickStoryContext(contexts, bad)).toBeNull();
    }
  });

  it("falls back to null when the story is not in the named list", () => {
    // Real list, wrong story: the Norse pantheon does not contain titanomachy.
    expect(pickStoryContext(contexts, "pantheon/norse")).toBeNull();
  });
});
