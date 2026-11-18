import "server-only";

import type { DeityComparison } from "@/lib/comparisons";
import {
  getJourneys,
  getPantheonById,
  getPantheonShortNames,
  getStories,
} from "@/lib/data/catalog";
import { joinNames } from "@/lib/deity-faq";
import {
  getGodsOfDomain,
  godsOfLinksForDomains,
  godsOfTitle,
  type GodsOfDomain,
} from "@/lib/gods-of";
import { findJourneyForPantheon } from "@/lib/journeys";
import {
  getCreatureHub,
  getGoddessHub,
  type CreatureHub,
  type GoddessHub,
} from "@/lib/pantheon-hubs";

/**
 * Where a reader can go after a list or comparison page: myths that feature
 * the figures on the page, then pages of a related kind. Every link comes from
 * a catalog record (the deities a story's record features, a deity's domains,
 * a tradition's own hubs), so the block makes no claim the catalog does not.
 */

export interface NextStepLink {
  href: string;
  label: string;
  /** One short line under the label: why this link is here, or what it is. */
  meta?: string;
}

export interface NextStepSet {
  myths: NextStepLink[];
  related: NextStepLink[];
}

const MYTH_LINKS = 3;
const RELATED_LINKS = 2;
/** A myth names at most this many of the page's figures in its meta line. */
const NAMED_FIGURES = 2;

interface Figure {
  id: string;
  name: string;
}

function unique<T>(items: readonly T[]): T[] {
  return [...new Set(items)];
}

/**
 * Takes one item from each queue in turn until `limit` distinct keys are
 * held. A page with many figures then links one myth per figure before it
 * links a second myth for any of them.
 */
function takeInTurn<T>(
  queues: readonly (readonly T[])[],
  key: (item: T) => string,
  limit: number,
  taken: Map<string, T>,
): void {
  const longest = Math.max(0, ...queues.map((queue) => queue.length));
  for (let round = 0; round < longest; round++) {
    for (const queue of queues) {
      if (taken.size >= limit) return;
      const item = queue[round];
      if (item && !taken.has(key(item))) taken.set(key(item), item);
    }
  }
}

/**
 * Stories whose own record lists the figure. Read from the story records by
 * id, not through the linked-mentions lookup: that lookup resolves a deity by
 * name, and two deities are named Apollo.
 */
function storiesFeaturing(figure: Figure): NextStepLink[] {
  return getStories()
    .filter((story) => story.featuredDeities?.includes(figure.id))
    .map((story) => ({ href: `/stories/${story.slug}`, label: story.title }));
}

/**
 * Up to three stories to read next. Stories that feature a figure on the page
 * come first, in the order the page lists its figures. When the catalog
 * records fewer than three, stories from the page's traditions fill the rest
 * and say only which tradition they come from.
 */
function mythLinks(
  figures: readonly Figure[],
  pantheonIds: readonly string[],
): NextStepLink[] {
  const featuring = figures.map(storiesFeaturing);
  const namesByStory = new Map<string, string[]>();
  featuring.forEach((links, index) => {
    for (const link of links) {
      const names = namesByStory.get(link.href) ?? [];
      namesByStory.set(link.href, unique([...names, figures[index].name]));
    }
  });

  const taken = new Map<string, NextStepLink>();
  takeInTurn(featuring, (link) => link.href, MYTH_LINKS, taken);
  for (const [href, link] of taken) {
    const names = namesByStory.get(href) ?? [];
    taken.set(href, {
      ...link,
      meta: `Features ${joinNames(names.slice(0, NAMED_FIGURES))}`,
    });
  }

  const stories = getStories();
  const shortNames = getPantheonShortNames();
  const fromTradition = unique(pantheonIds).map((pantheonId) =>
    stories
      .filter((story) => story.pantheonId === pantheonId)
      .map((story) => ({
        href: `/stories/${story.slug}`,
        label: story.title,
        meta: `${shortNames[pantheonId] ?? "Same"} tradition`,
      })),
  );
  takeInTurn(fromTradition, (link) => link.href, MYTH_LINKS, taken);

  return [...taken.values()];
}

function traditionLinks(pantheonIds: readonly string[]): NextStepLink[] {
  return unique(pantheonIds).flatMap((pantheonId) => {
    const pantheon = getPantheonById(pantheonId);
    return pantheon
      ? [
          {
            href: `/pantheons/${pantheon.slug}`,
            label: pantheon.name,
            meta: "Tradition",
          },
        ]
      : [];
  });
}

function godsOfLinks(domains: readonly string[]): NextStepLink[] {
  return godsOfLinksForDomains(domains).flatMap((link) => {
    const page = getGodsOfDomain(link.slug);
    return page
      ? [
          {
            href: `/gods-of/${page.slug}`,
            label: godsOfTitle(page),
            meta: "List across traditions",
          },
        ]
      : [];
  });
}

/** A page's first deity of each tradition, then every other deity it lists. */
function leadsFirst(page: GodsOfDomain): Figure[] {
  return [
    ...page.traditions.flatMap((tradition) => tradition.deities.slice(0, 1)),
    ...page.traditions.flatMap((tradition) => tradition.deities.slice(1)),
  ];
}

/**
 * After a "gods of X" list: myths of its deities. The page already lists its
 * comparisons and its related domains above the block, so the block does not
 * repeat them.
 */
export function godsOfNextSteps(page: GodsOfDomain): NextStepSet {
  const pantheonIds = page.traditions.map((tradition) => tradition.pantheonId);
  return { myths: mythLinks(leadsFirst(page), pantheonIds), related: [] };
}

/** After a comparison: myths of the two figures, then lists they appear in. */
export function comparisonNextSteps(comparison: DeityComparison): NextStepSet {
  const { a, b, sharedDomains } = comparison;
  const pantheonIds = [a.pantheonId, b.pantheonId];
  const ownDomains = a.domain.flatMap((domain, index) =>
    b.domain[index] === undefined ? [domain] : [domain, b.domain[index]],
  );
  const domains = [
    ...sharedDomains,
    ...ownDomains,
    ...b.domain.slice(a.domain.length),
  ];
  return {
    myths: mythLinks([a, b], pantheonIds),
    related: [...godsOfLinks(domains), ...traditionLinks(pantheonIds)].slice(
      0,
      RELATED_LINKS,
    ),
  };
}

/** After a tradition's goddess list: their myths, then the sibling pages. */
export function goddessHubNextSteps(hub: GoddessHub): NextStepSet {
  const { tradition, goddesses } = hub;
  const creatureHub = getCreatureHub(tradition.slug);
  return {
    myths: mythLinks(goddesses, [tradition.id]),
    related: [
      ...(creatureHub
        ? [
            {
              href: `/pantheons/${tradition.slug}/creatures`,
              label: `${tradition.shortName} Mythological Creatures`,
              meta: "List in this tradition",
            },
          ]
        : []),
      ...godsOfLinks(goddesses.flatMap((goddess) => goddess.domain ?? [])),
    ].slice(0, RELATED_LINKS),
  };
}

/**
 * After a tradition's creature list: its myths, then the sibling pages. The
 * catalog does not record which stories a creature appears in, so the myths
 * are the tradition's own and make no claim about any creature.
 */
export function creatureHubNextSteps(hub: CreatureHub): NextStepSet {
  const { tradition } = hub;
  const goddessHub = getGoddessHub(tradition.slug);
  const journey = findJourneyForPantheon(getJourneys(), tradition.id);
  return {
    myths: mythLinks([], [tradition.id]),
    related: [
      ...(goddessHub
        ? [
            {
              href: `/pantheons/${tradition.slug}/goddesses`,
              label: `${tradition.shortName} Goddesses`,
              meta: "List in this tradition",
            },
          ]
        : []),
      ...(journey
        ? [
            {
              href: `/journeys/${journey.slug}`,
              label: journey.title,
              meta: "Journey on the map",
            },
          ]
        : []),
    ].slice(0, RELATED_LINKS),
  };
}
