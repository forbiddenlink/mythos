import { describe, expect, it } from "vitest";
import deities from "@/data/deities.json";
import stories from "@/data/stories.json";
import { DeitiesArraySchema, StoriesArraySchema } from "@/lib/schemas";

type Excerpt = {
  sourceUrl: string;
  edition: string;
  quoteStatus: "direct-quotation" | "editorial-paraphrase" | "unverified";
  verification: "verified" | "source-and-locator-verified" | "not-verified";
};

function excerptsFrom(records: unknown[]): Excerpt[] {
  return records.flatMap((record) => {
    const excerpts = (record as { primarySourceExcerpts?: Excerpt[] })
      .primarySourceExcerpts;
    return excerpts ?? [];
  });
}

describe("structured primary-source excerpts", () => {
  it("has an explicit, valid web citation and editorial status for every record", () => {
    const excerpts = [...excerptsFrom(deities), ...excerptsFrom(stories)];

    expect(excerpts).toHaveLength(40);
    for (const excerpt of excerpts) {
      expect(excerpt.edition.trim()).not.toBe("");
      expect([
        "direct-quotation",
        "editorial-paraphrase",
        "unverified",
      ]).toContain(excerpt.quoteStatus);
      expect([
        "verified",
        "source-and-locator-verified",
        "not-verified",
      ]).toContain(excerpt.verification);
      const url = new URL(excerpt.sourceUrl);
      expect(["http:", "https:"]).toContain(url.protocol);
    }
  });

  it("passes the shared data contract", () => {
    expect(DeitiesArraySchema.safeParse(deities).success).toBe(true);
    expect(StoriesArraySchema.safeParse(stories).success).toBe(true);
  });
});
