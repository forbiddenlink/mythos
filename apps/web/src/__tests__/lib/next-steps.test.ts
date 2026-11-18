import { describe, expect, it } from "vitest";
import { getDeityComparison, getDeityComparisons } from "@/lib/comparisons";
import { getJourneys, getPantheons, getStories } from "@/lib/data/catalog";
import {
  getGodsOfDomain,
  getGodsOfDomains,
  godsOfLinksForDomains,
} from "@/lib/gods-of";
import {
  comparisonNextSteps,
  creatureHubNextSteps,
  goddessHubNextSteps,
  godsOfNextSteps,
  type NextStepLink,
  type NextStepSet,
} from "@/lib/next-steps";
import { getCreatureHubs, getGoddessHubs } from "@/lib/pantheon-hubs";

const stories = getStories();
const storyByHref = new Map(
  stories.map((story) => [`/stories/${story.slug}`, story]),
);

/** Every address the block may link to, built from the catalog itself. */
const knownHrefs = new Set([
  ...storyByHref.keys(),
  ...getGodsOfDomains().map((page) => `/gods-of/${page.slug}`),
  ...getPantheons().map((pantheon) => `/pantheons/${pantheon.slug}`),
  ...getJourneys().map((journey) => `/journeys/${journey.slug}`),
  ...getCreatureHubs().map(
    (hub) => `/pantheons/${hub.tradition.slug}/creatures`,
  ),
  ...getGoddessHubs().map(
    (hub) => `/pantheons/${hub.tradition.slug}/goddesses`,
  ),
]);

const isFeature = (link: NextStepLink) =>
  link.meta?.startsWith("Features ") ?? false;

/** The rules every page's block keeps, whatever the page is. */
function expectSound(steps: NextStepSet, page: string) {
  const links = [...steps.myths, ...steps.related];
  expect(steps.myths.length, page).toBeLessThanOrEqual(3);
  expect(steps.related.length, page).toBeLessThanOrEqual(2);
  expect(new Set(links.map((link) => link.href)).size, page).toBe(links.length);
  for (const link of links) {
    expect(knownHrefs.has(link.href), `${page} -> ${link.href}`).toBe(true);
    expect(link.label, page).not.toBe("");
    expect(link.meta, `${page} -> ${link.href}`).toMatch(/\S/);
    expect(link.meta, page).not.toMatch(/undefined|Same tradition/);
  }
  for (const myth of steps.myths) {
    expect(storyByHref.has(myth.href), `${page} -> ${myth.href}`).toBe(true);
  }
  // A myth that features a figure never follows one that only shares the
  // tradition.
  const firstFill = steps.myths.findIndex((link) => !isFeature(link));
  if (firstFill !== -1) {
    expect(steps.myths.slice(firstFill).some(isFeature), page).toBe(false);
  }
}

/**
 * A "Features X" line is a claim, so the story's own record must list a
 * figure of the page with that name.
 */
function expectFeatureClaimsHold(
  myths: readonly NextStepLink[],
  figures: readonly { id: string; name: string }[],
  page: string,
) {
  for (const myth of myths.filter(isFeature)) {
    const featured = storyByHref.get(myth.href)?.featuredDeities ?? [];
    const named = figures.filter(
      (figure) =>
        featured.includes(figure.id) && myth.meta?.includes(figure.name),
    );
    expect(named.length, `${page} -> ${myth.href}`).toBeGreaterThan(0);
  }
}

function expectFillsStayInTraditions(
  myths: readonly NextStepLink[],
  pantheonIds: readonly string[],
  page: string,
) {
  for (const myth of myths.filter((link) => !isFeature(link))) {
    const story = storyByHref.get(myth.href);
    expect(pantheonIds, `${page} -> ${myth.href}`).toContain(story?.pantheonId);
  }
}

describe("godsOfNextSteps", () => {
  const pages = getGodsOfDomains();

  it("links three myths on every list and repeats no link the page has", () => {
    expect(pages.length).toBeGreaterThan(0);
    for (const page of pages) {
      const steps = godsOfNextSteps(page);
      expectSound(steps, page.slug);
      expect(steps.myths, page.slug).toHaveLength(3);
      // The page lists its comparisons and related domains above the block.
      expect(steps.related, page.slug).toEqual([]);
    }
  });

  it("claims a myth features a deity only when the story records it", () => {
    for (const page of pages) {
      const figures = page.traditions.flatMap((tradition) => tradition.deities);
      const pantheonIds = page.traditions.map((t) => t.pantheonId);
      const { myths } = godsOfNextSteps(page);
      expectFeatureClaimsHold(myths, figures, page.slug);
      expectFillsStayInTraditions(myths, pantheonIds, page.slug);
    }
  });

  it("links one myth per deity before a second myth for any deity", () => {
    const war = getGodsOfDomain("war");
    if (!war) throw new Error("no war page");
    const { myths } = godsOfNextSteps(war);
    expect(myths.every(isFeature)).toBe(true);
    // Each of the three myths is there for a different first-named deity.
    const firstNames = myths.map(
      (myth) => myth.meta?.replace("Features ", "").split(" and ")[0],
    );
    expect(new Set(firstNames).size).toBe(3);
  });
});

describe("comparisonNextSteps", () => {
  const comparisons = getDeityComparisons();

  it("keeps the rules on every comparison", () => {
    for (const comparison of comparisons) {
      const steps = comparisonNextSteps(comparison);
      const { a, b } = comparison;
      expectSound(steps, comparison.slug);
      expectFeatureClaimsHold(steps.myths, [a, b], comparison.slug);
      expectFillsStayInTraditions(
        steps.myths,
        [a.pantheonId, b.pantheonId],
        comparison.slug,
      );
      expect(steps.myths.length, comparison.slug).toBeGreaterThan(0);
      expect(steps.related.length, comparison.slug).toBeGreaterThan(0);
    }
  });

  it("takes a myth of each figure in turn", () => {
    const steps = comparisonNextSteps(getDeityComparison("hera-vs-juno")!);
    expect(steps.myths).toEqual([
      {
        href: "/stories/trojan-war",
        label: "The Trojan War",
        meta: "Features Hera",
      },
      {
        href: "/stories/sabine-women",
        label: "The Rape of the Sabine Women",
        meta: "Features Juno",
      },
      {
        href: "/stories/judgment-of-paris",
        label: "The Judgment of Paris",
        meta: "Features Hera",
      },
    ]);
  });

  it("finds the myths of a figure that shares its name with another", () => {
    // Two deities are named Apollo; the stories list them by id.
    const apollos = comparisons.filter(
      (comparison) =>
        comparison.a.name === "Apollo" || comparison.b.name === "Apollo",
    );
    expect(apollos.length).toBeGreaterThan(0);
    const featured = apollos.filter((comparison) =>
      stories.some(
        (story) =>
          story.featuredDeities?.includes(comparison.a.id) ||
          story.featuredDeities?.includes(comparison.b.id),
      ),
    );
    expect(featured.length).toBeGreaterThan(0);
    for (const comparison of featured) {
      expect(
        comparisonNextSteps(comparison).myths.some(isFeature),
        comparison.slug,
      ).toBe(true);
    }
  });

  it("names both figures when one myth features both", () => {
    const pair = comparisons.find((comparison) =>
      stories.some(
        (story) =>
          story.featuredDeities?.includes(comparison.a.id) &&
          story.featuredDeities?.includes(comparison.b.id),
      ),
    );
    if (!pair) throw new Error("no pair shares a story");
    const { myths } = comparisonNextSteps(pair);
    expect(
      myths.some(
        (myth) =>
          myth.meta?.includes(pair.a.name) && myth.meta?.includes(pair.b.name),
      ),
    ).toBe(true);
  });

  it("leads the related pages with a list for a domain the two share", () => {
    for (const comparison of comparisons) {
      const [shared] = godsOfLinksForDomains(comparison.sharedDomains);
      if (!shared) continue;
      expect(
        comparisonNextSteps(comparison).related[0],
        comparison.slug,
      ).toMatchObject({
        href: `/gods-of/${shared.slug}`,
        meta: "List across traditions",
      });
    }
    const thunder = comparisonNextSteps(getDeityComparison("indra-vs-thor")!);
    expect(thunder.related[0]).toEqual({
      href: "/gods-of/thunder",
      label: "Gods of Thunder",
      meta: "List across traditions",
    });
  });

  it("fills with the tradition's stories and says so", () => {
    const steps = comparisonNextSteps(getDeityComparison("indra-vs-thor")!);
    expect(steps.myths.map(isFeature)).toEqual([true, true, false]);
    expect(steps.myths[2].meta).toBe("Hindu tradition");
  });

  it("links fewer myths when a tradition holds fewer than three", () => {
    const akan = comparisonNextSteps(getDeityComparison("anansi-vs-nyame")!);
    expect(akan.myths).toHaveLength(2);
  });
});

describe("goddessHubNextSteps", () => {
  it("links the goddesses' myths and the tradition's other list", () => {
    const hubs = getGoddessHubs();
    expect(hubs.length).toBeGreaterThan(0);
    for (const hub of hubs) {
      const steps = goddessHubNextSteps(hub);
      const { slug, id } = hub.tradition;
      expectSound(steps, slug);
      expectFeatureClaimsHold(steps.myths, hub.goddesses, slug);
      expectFillsStayInTraditions(steps.myths, [id], slug);
      const creatures = `/pantheons/${slug}/creatures`;
      if (knownHrefs.has(creatures)) {
        expect(steps.related[0]?.href, slug).toBe(creatures);
      }
      // The page already ends with a link back to the tradition.
      expect(
        steps.related.map((link) => link.href),
        slug,
      ).not.toContain(`/pantheons/${slug}`);
    }
  });
});

describe("creatureHubNextSteps", () => {
  const hubs = getCreatureHubs();

  it("links the tradition's myths and claims nothing about a creature", () => {
    expect(hubs.length).toBeGreaterThan(0);
    for (const hub of hubs) {
      const steps = creatureHubNextSteps(hub);
      const { slug, id } = hub.tradition;
      expectSound(steps, slug);
      expect(steps.myths.some(isFeature), slug).toBe(false);
      expectFillsStayInTraditions(steps.myths, [id], slug);
      expect(
        steps.related.map((link) => link.href),
        slug,
      ).not.toContain(`/pantheons/${slug}`);
    }
  });

  it("returns nothing for a tradition with no story and no sibling page", () => {
    const empty = hubs.filter((hub) => {
      const steps = creatureHubNextSteps(hub);
      return steps.myths.length === 0 && steps.related.length === 0;
    });
    for (const hub of empty) {
      expect(
        stories.some((story) => story.pantheonId === hub.tradition.id),
        hub.tradition.slug,
      ).toBe(false);
    }
  });
});
