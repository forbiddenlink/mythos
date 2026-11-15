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

    expect(excerpts).toHaveLength(42);
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

  it("backs the Prometheus story with the two Hesiod passages it cites", () => {
    const story = (
      stories as Array<{
        slug: string;
        primarySourceExcerpts?: Array<Record<string, string>>;
      }>
    ).find((s) => s.slug === "prometheus-fire");
    const byLocator = new Map(
      (story?.primarySourceExcerpts ?? []).map((e) => [e.lineNumbers, e]),
    );

    expect([...byLocator.keys()].sort()).toEqual(["47-52", "565-569"]);

    const theogony = byLocator.get("565-569");
    expect(theogony?.sourceId).toBe("theogony");
    expect(theogony?.text).toContain("ἐν κοΐλῳ νάρθηκι");
    expect(theogony?.translation).toContain("hollow fennel stalk");

    const worksAndDays = byLocator.get("47-52");
    expect(worksAndDays?.sourceId).toBe("works-and-days");
    expect(worksAndDays?.text).toContain("ἐν κοΐλῳ νάρθηκι");
    expect(worksAndDays?.translation).toContain("hollow fennel-stalk");

    for (const excerpt of byLocator.values()) {
      expect(excerpt.translator).toBe("Hugh G. Evelyn-White");
      expect(excerpt.quoteStatus).toBe("direct-quotation");
      expect(excerpt.verification).toBe("verified");
    }
  });
});
