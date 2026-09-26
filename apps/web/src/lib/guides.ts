/**
 * Editorial guides: hub pages that gather catalog entries around a subject
 * readers are searching for (a novel, an epic, a game). Pure data with no
 * catalog imports, so the registry is safe to read from any component.
 *
 * `featured` lists the catalog entries a guide discusses; each of those
 * entries links back to the guide from its own page ("Featured in").
 */

export type GuideEntityKind =
  "deity" | "hero" | "creature" | "location" | "artifact";

export interface GuideSummary {
  slug: string;
  /** Page title (h1). */
  title: string;
  /** Short label for strips and "Featured in" boxes. */
  shortTitle: string;
  /** One sentence for cards, metadata and llms.txt. */
  description: string;
  featured: Partial<Record<GuideEntityKind, readonly string[]>>;
}

export const GUIDES: readonly GuideSummary[] = [
  {
    slug: "percy-jackson-titans-curse",
    title: "The Myths Behind Percy Jackson: The Titan's Curse",
    shortTitle: "Percy Jackson: The Titan's Curse",
    description:
      "Artemis and her Hunters, Atlas, the Nemean Lion, Ladon, the Hesperides, Mount Othrys and Kronos: what Rick Riordan took from ancient myth, and what he invented.",
    featured: {
      deity: ["artemis", "apollo", "atlas", "cronus", "zeus", "dionysus"],
      hero: ["heracles"],
      creature: ["nemean-lion", "ladon"],
      location: ["garden-of-hesperides", "mount-othrys", "mount-olympus"],
    },
  },
  {
    slug: "odyssey",
    title: "The Odyssey: A Guide to Homer's Epic",
    shortTitle: "Homer's Odyssey",
    description:
      "Odysseus's route from Troy to Ithaca, a book-by-book summary of Homer's poem, and the gods, monsters and mortals he meets, linked to their entries.",
    featured: {
      hero: ["odysseus", "penelope", "achilles", "helen"],
      deity: ["athena", "poseidon", "hermes", "helios", "zeus", "atlas"],
      creature: ["cyclops"],
      location: [
        "troy",
        "cicones-coast",
        "lotus-eaters-island",
        "cyclops-cave",
        "aeolus-island",
        "laestrygonians-harbor",
        "circe-island",
        "underworld",
        "sirens-strait",
        "scylla-charybdis",
        "thrinacia",
        "calypso-island",
        "phaeacia",
        "ithaca",
      ],
    },
  },
  {
    slug: "hades-ii",
    title: "Who's Who in Hades II: The Mythology Behind the Game",
    shortTitle: "Hades II mythology",
    description:
      "Melinoë, Hecate, Chronos and Cronus, Nemesis, Moros, Thanatos and Nyx: which Hades II characters come from ancient sources, and what the game invents.",
    featured: {
      deity: [
        "melinoe",
        "hecate",
        "cronus",
        "nemesis",
        "thanatos",
        "nyx",
        "hades",
        "persephone",
        "selene",
      ],
      hero: ["odysseus"],
      creature: ["cerberus"],
      location: ["underworld", "tartarus", "river-styx"],
    },
  },
];

export function getGuide(slug: string): GuideSummary | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

/** Guides that discuss a given catalog entry, for its "Featured in" box. */
export function guidesFeaturing(
  kind: GuideEntityKind,
  id: string,
): GuideSummary[] {
  return GUIDES.filter((guide) => guide.featured[kind]?.includes(id));
}
