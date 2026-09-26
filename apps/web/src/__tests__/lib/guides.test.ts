import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import branchingStories from "@/data/branching-stories.json";
import { familyFaq, joinNames } from "@/lib/deity-faq";
import { buildBloodline } from "@/lib/deity-page";
import deities from "@/data/deities.json";
import relationships from "@/data/relationships.json";
import { guideEntity, routeStop } from "@/lib/guide-entities";
import { GUIDES, getGuide, guidesFeaturing } from "@/lib/guides";
import { citedWork, citedWorksFor } from "@/lib/seo/cited-works";
import { generateBaseMetadata } from "@/lib/metadata";

describe("guides registry", () => {
  it("resolves every featured entry to a catalog page", () => {
    for (const guide of GUIDES) {
      for (const [kind, ids] of Object.entries(guide.featured)) {
        for (const id of ids ?? []) {
          const entity = guideEntity(
            kind as Parameters<typeof guideEntity>[0],
            id,
          );
          expect(entity.href, `${guide.slug}: ${kind}/${id}`).toMatch(
            /^\/(deities|heroes|creatures|locations|artifacts)\/[a-z0-9-]+$/,
          );
          expect(entity.description.length, id).toBeGreaterThan(0);
        }
      }
    }
  });

  it("refuses to link a missing entry", () => {
    expect(() => guideEntity("deity", "not-a-deity")).toThrow(/missing deity/);
  });

  it("finds the guides that feature an entry", () => {
    expect(guidesFeaturing("deity", "artemis").map((g) => g.slug)).toEqual([
      "percy-jackson-titans-curse",
    ]);
    expect(
      guidesFeaturing("hero", "odysseus")
        .map((g) => g.slug)
        .sort(),
    ).toEqual(["hades-ii", "odyssey"]);
    expect(guidesFeaturing("deity", "melinoe").map((g) => g.slug)).toEqual([
      "hades-ii",
    ]);
    expect(getGuide("nope")).toBeUndefined();
  });

  it("classifies every Odyssey stop's geography", () => {
    const odyssey = getGuide("odyssey")!;
    for (const id of odyssey.featured.location ?? []) {
      expect(["physical", "identified", "mythic"]).toContain(
        routeStop(id).geography,
      );
    }
    expect(routeStop("ithaca").geography).toBe("physical");
  });
});

describe("sitemap coverage", () => {
  const urls = new Set(sitemap().map((entry) => entry.url));
  const base = "https://mythosatlas.com";

  it("lists the previously missing static routes", () => {
    for (const path of ["/atlas", "/compare/parallels", "/accessibility"]) {
      expect(urls.has(`${base}${path}`), path).toBe(true);
    }
    for (const story of branchingStories) {
      expect(urls.has(`${base}/stories/interactive/${story.slug}`)).toBe(true);
    }
  });

  it("lists the guides and the domain pages", () => {
    expect(urls.has(`${base}/guides`)).toBe(true);
    for (const guide of GUIDES) {
      expect(urls.has(`${base}/guides/${guide.slug}`), guide.slug).toBe(true);
    }
    expect(urls.has(`${base}/gods-of/war`)).toBe(true);
  });

  it("never lists a URL twice or a non-canonical reading page", () => {
    const all = sitemap().map((entry) => entry.url);
    expect(new Set(all).size).toBe(all.length);
    expect(all.some((url) => /\/stories\/[^/]+\/read$/.test(url))).toBe(false);
  });
});

describe("deity family answers", () => {
  it("answers from the kinship records and hedges parentage", () => {
    const bloodline = buildBloodline("zeus", relationships, deities);
    const answers = familyFaq("Zeus", bloodline);
    const parents = answers.find(
      (a) => a.question === "Who are Zeus's parents?",
    );
    expect(parents?.answer).toContain("Cronus");
    expect(parents?.answer).toMatch(/do not always agree/);
    const children = answers.find(
      (a) => a.question === "Who are Zeus's children?",
    );
    expect(children?.kin.map((k) => k.name)).toContain("Athena");
  });

  it("asks nothing when no kin is recorded", () => {
    expect(
      familyFaq("Nobody", {
        parents: [],
        children: [],
        consorts: [],
        siblings: [],
        rivals: [],
      }),
    ).toEqual([]);
  });

  it("joins names as prose", () => {
    expect(joinNames(["A"])).toBe("A");
    expect(joinNames(["A", "B"])).toBe("A and B");
    expect(joinNames(["A", "B", "C"])).toBe("A, B, and C");
  });

  it("records Melinoë's single-source parentage", () => {
    const answers = familyFaq(
      "Melinoë",
      buildBloodline("melinoe", relationships, deities),
    );
    expect(answers[0].kin.map((k) => k.name).sort()).toEqual([
      "Persephone",
      "Zeus",
    ]);
  });
});

describe("cited works", () => {
  it("resolves source ids once each and drops unknown ids", () => {
    const works = citedWorksFor({
      primarySources: [
        { sourceId: "theogony" },
        { sourceId: "theogony" },
        { text: "no id" },
      ],
      furtherReading: [{ sourceId: "odyssey" }, { sourceId: "not-a-work" }],
    });
    expect(works.map((w) => w.url)).toEqual([
      "/sources/theogony",
      "/sources/odyssey",
    ]);
    expect(citedWork("orphic-hymns")?.title).toBe("Orphic Hymns");
    expect(citedWork("nope")).toBeUndefined();
  });
});

describe("share images", () => {
  it("leaves og:image to the route's generated card when image is null", () => {
    const metadata = generateBaseMetadata({
      title: "Gods of War",
      url: "/gods-of/war",
      image: null,
    });
    expect(metadata.openGraph).not.toHaveProperty("images");
    expect(metadata.twitter).not.toHaveProperty("images");
  });

  it("keeps an explicit image when one is given", () => {
    const metadata = generateBaseMetadata({ title: "About", image: "/x.png" });
    expect(metadata.twitter).toHaveProperty("images", ["/x.png"]);
  });
});
