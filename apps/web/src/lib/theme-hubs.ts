import { getStories } from "@/lib/data/catalog";

/**
 * "Same story, many cultures" hubs. Every hub only gathers stories that
 * already exist in the catalog; the per-story text shown on the page is the
 * catalog's own summary. The `claim` is the only editorial text, and it is
 * limited to what those summaries say. It always says the traditions are
 * separate: the atlas does not argue that they share a source.
 */
export interface ThemeHub {
  slug: string;
  title: string;
  /** One-line description for cards and metadata. */
  description: string;
  /** Conservative statement of what the gathered stories have in common. */
  claim: string;
  /** Story slugs, in reading order. */
  stories: readonly string[];
}

export const THEME_HUBS: readonly ThemeHub[] = [
  {
    slug: "flood",
    title: "Flood Stories",
    description:
      "Two Mesopotamian flood accounts, an Inca llama story and the Diné emergence, side by side.",
    claim:
      "Four stories in this atlas include a flood. In both Mesopotamian accounts the god Ea warns one person to build a boat. In the Inca story a llama warns its owner, who climbs a mountain. In the Diné story a flood is the last disaster before beings emerge into the present world. These are separate traditions with different causes and outcomes, and this page does not claim they share a source.",
    stories: [
      "flood-utnapishtim",
      "atrahasis-flood",
      "the-llama-and-the-flood",
      "the-dine-emergence",
    ],
  },
  {
    slug: "separating-heaven-and-earth",
    title: "Heaven and Earth Set Apart",
    description:
      "Creation stories from China, Polynesia, Korea and Babylon in which the world takes shape by being divided or fashioned from a body.",
    claim:
      "In these four stories the world is shaped by dividing or building: Pangu separates Heaven and Earth, the children of Rangi and Papa push their parents apart, Mireuk separates heaven and earth, and Marduk fashions the universe from Tiamat's body. The details differ, and this page does not claim the traditions are related.",
    stories: [
      "pangu-creation",
      "separation-of-rangi-and-papa",
      "mireuk-and-seokga",
      "enuma-elish",
    ],
  },
  {
    slug: "land-from-the-waters",
    title: "Land from the Waters",
    description:
      "Egyptian, Finnish, Yoruba and Polynesian stories in which land or earth arises from sea or primeval water.",
    claim:
      "In these four stories earth or land appears out of water: a mound rises from Nun, earth and sky form from the pieces of eggs laid on the knee of an air-maiden drifting on the primeval sea, Obatala makes land from the primordial waters, and Maui pulls islands from the ocean floor. They are separate traditions, and this page does not claim a common origin.",
    stories: [
      "creation-heliopolis",
      "ilmatar-and-the-world-egg",
      "yoruba-creation",
      "maui-fishes-up-islands",
    ],
  },
  {
    slug: "trickster-tales",
    title: "Trickster Tales",
    description:
      "Eshu, Raven, Cuniraya, Anansi and Maui: six stories where cunning decides the outcome.",
    claim:
      "In these six stories a clever figure gets what they want by deceit or bargaining: Eshu in a lesson for two friends, Raven twice, Cuniraya, Anansi with the sky god, and Maui with a fire goddess. The tricksters are separate characters in separate traditions, and this page does not claim they are the same figure.",
    stories: [
      "eshu-two-friends",
      "raven-steals-the-light",
      "raven-and-petrel",
      "cuniraya-and-cavillaca",
      "anansi-bought-stories",
      "maui-steals-fire",
    ],
  },
  {
    slug: "stolen-gifts",
    title: "Stolen Gifts: Fire, Light, Water and Poetry",
    description:
      "Prometheus, Maui, Raven and Odin each take something valuable from its owner and change the world.",
    claim:
      "Five stories here turn on taking something from its keeper: fire in the Greek and Polynesian stories, light and fresh water in the Tlingit and Haida stories, and the mead of poetry in the Norse story. The outcomes differ, from punishment for the thief to a gift for the world, and this page does not claim the stories are connected.",
    stories: [
      "prometheus-fire",
      "maui-steals-fire",
      "raven-steals-the-light",
      "raven-and-petrel",
      "mead-of-poetry",
    ],
  },
  {
    slug: "the-sun-and-the-sky",
    title: "Taming the Sun",
    description:
      "Polynesian, Chinese and Korean stories in which a hero or god deals with a sun that is too fast or too many.",
    claim:
      "In these four stories the sun is a problem to be solved: Maui captures a sun that moves too fast, with his brothers in one telling, Hou Yi shoots down nine suns, and Mireuk turns an extra sun into stars. The traditions are separate, and this page does not claim they share a source.",
    stories: [
      "maui-slows-the-sun",
      "hina-maui-lengthened-day",
      "chang-e-moon",
      "mireuk-and-seokga",
    ],
  },
  {
    slug: "journey-to-the-underworld",
    title: "Journeys to the Underworld",
    description:
      "Inanna, Izanagi, Orpheus, Persephone, Quetzalcoatl and the Hero Twins go down; two stories follow the soul after death.",
    claim:
      "Eight stories in this atlas travel to a land of the dead. Six follow a figure who goes down or is taken down, sometimes returning and sometimes not; two follow the soul of the dead through trials. Each tradition tells its own version, and this page does not claim they descend from one story.",
    stories: [
      "inanna-descent",
      "izanagi-yomi",
      "orpheus-eurydice",
      "abduction-of-persephone",
      "quetzalcoatl-mictlan",
      "hero-twins-popol-vuh",
      "journey-to-mictlan",
      "book-of-dead-journey",
    ],
  },
  {
    slug: "worlds-that-end",
    title: "Worlds That End",
    description:
      "Ragnarok, the Five Suns, a Mesopotamian flood and Nuwa's repair of the sky.",
    claim:
      "These four stories describe a world ending or nearly ending: Ragnarok is prophesied, the Aztec account has four earlier worlds destroyed, Atrahasis's flood erases the old world, and Nuwa repairs a cracked sky. They differ in cause and in what follows, they are separate traditions, and this page does not claim a shared source.",
    stories: ["ragnarok", "five-suns", "atrahasis-flood", "nuwa-repairs-sky"],
  },
  {
    slug: "twins",
    title: "Twins in Myth",
    description:
      "The Hero Twins, Sapling and Flint, the sons of Changing Woman, Romulus and Remus, and Yoruba ibeji.",
    claim:
      "Five entries in this atlas center on twins: the Maya Hero Twins, the Haudenosaunee twins Sapling and Flint, the twin sons of Changing Woman, Romulus and Remus, and the Yoruba commemoration of twins. The twins play different roles in each, and this page does not claim the traditions are connected.",
    stories: [
      "hero-twins-popol-vuh",
      "the-twins-sapling-and-flint",
      "twins-journey-to-the-sun",
      "romulus-remus",
      "first-twins-ibeji",
    ],
  },
  {
    slug: "seeking-immortality",
    title: "The Search for Immortality",
    description:
      "Gilgamesh, Maui, Chang'e and the churning of the ocean: four ways immortality is sought or won.",
    claim:
      "In these four stories immortality is sought or obtained, with different results: Gilgamesh searches for it after Enkidu's death, Maui tries and fails, Chang'e drinks an elixir, and gods and demons churn the cosmic ocean for amrita. The traditions are separate, and this page does not claim they share a source.",
    stories: [
      "epic-of-gilgamesh",
      "maui-and-hina-death",
      "chang-e-moon",
      "churning-ocean",
    ],
  },
];

export function getThemeHub(slug: string): ThemeHub | undefined {
  return THEME_HUBS.find((h) => h.slug === slug);
}

/** The hub's catalog stories, in the hub's own order. Missing slugs are skipped. */
export function hubStories(hub: ThemeHub) {
  const all = new Map(getStories().map((s) => [s.slug, s]));
  return hub.stories
    .map((slug) => all.get(slug))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);
}
