import { CollectionsShowcase } from "@/components/home/CollectionsShowcase";
import { DidYouKnow } from "@/components/home/DidYouKnow";
import { GuidesStrip } from "@/components/home/GuidesStrip";
import {
  AtlasOpensHero,
  type HeroFigure,
} from "@/components/home/AtlasOpensHero";
import { InteractiveStoriesBanner } from "@/components/home/InteractiveStoriesBanner";
import {
  PantheonShowcase,
  type FeaturedTradition,
} from "@/components/home/PantheonShowcase";
import { TodaysMyth } from "@/components/home/TodaysMyth";
import { SyncretismStrip } from "@/components/mythology/SyncretismStrip";
import { generateBaseMetadata } from "@/lib/metadata";
import {
  getBranchingStories,
  getDeities,
  getPantheons,
  getTraditionCount,
} from "@/lib/data/catalog";
import storiesData from "@/data/stories.json";
import creaturesData from "@/data/creatures.json";
import artifactsData from "@/data/artifacts.json";
import locationsData from "@/data/locations.json";

// Computed on the server (this is a Server Component). Reading the catalog
// here keeps it OUT of the client bundle: only the small derived values below
// reach the client components as props.
const deities = getDeities();

const HERO_COUNTS = {
  pantheons: getTraditionCount(),
  deities: deities.length,
  stories: (storiesData as unknown[]).length,
  creatures: (creaturesData as unknown[]).length,
  artifacts: (artifactsData as unknown[]).length,
  locations: (locationsData as unknown[]).length,
} as const;

// Slim id/slug -> {name, slug} lookup for DidYouKnow's related-deity chips, so the
// full deities.json never ships to the browser. Keyed by BOTH id and slug because
// fact.relatedDeities entries can be either.
const DEITY_LOOKUP: Record<string, { name: string; slug: string }> = {};
for (const d of deities) {
  const entry = { name: d.name, slug: d.slug };
  DEITY_LOOKUP[d.id] = entry;
  DEITY_LOOKUP[d.slug] = entry;
}

const pantheonShortName = (pantheonId: string) =>
  getPantheons()
    .find((p) => p.id === pantheonId)
    ?.name.replace(/ Pantheon$/, "") ?? pantheonId.replace(/-pantheon$/, "");

// Portraits for the hero mosaic: well-known figures from six traditions.
const HERO_FIGURES: HeroFigure[] = [
  "zeus",
  "isis",
  "odin",
  "shiva",
  "quetzalcoatl",
  "amaterasu",
].flatMap((slug) => {
  const deity = deities.find((d) => d.slug === slug);
  return deity?.imageUrl
    ? [
        {
          name: deity.name,
          slug: deity.slug,
          imageUrl: deity.imageUrl,
          tradition: pantheonShortName(deity.pantheonId),
        },
      ]
    : [];
});

// Featured traditions, each with a curated one-line pitch and a local image
// (a landscape cover, or a representative portrait where the cover is a plate).
const FEATURED_TRADITIONS: Array<{
  slug: string;
  image: string;
  description: string;
}> = [
  {
    slug: "greek",
    image: "/deities/athena.jpg",
    description:
      "The Olympian gods who ruled from Mount Olympus, shaping the fate of mortals and heroes alike.",
  },
  {
    slug: "norse",
    image: "/pantheons/norse.jpg",
    description:
      "The Æsir and Vanir of Asgard, warriors and seers across the Nine Worlds.",
  },
  {
    slug: "egyptian",
    image: "/pantheons/egyptian.jpg",
    description:
      "The divine rulers of the Nile Valley, guardians of life, death and rebirth.",
  },
  {
    slug: "hindu",
    image: "/pantheons/hindu.jpg",
    description:
      "A vast family of gods centered on the Trimurti, governing dharma and karma.",
  },
  {
    slug: "japanese",
    image: "/pantheons/japanese.jpg",
    description:
      "The kami of nature and ancestors, inhabiting the islands and shrines of Japan.",
  },
];

const TRADITIONS: FeaturedTradition[] = FEATURED_TRADITIONS.flatMap(
  (featured) => {
    const pantheon = getPantheons().find((p) => p.slug === featured.slug);
    if (!pantheon) return [];
    return [
      {
        name: pantheon.name,
        slug: pantheon.slug,
        culture: pantheon.culture,
        description: featured.description,
        imageUrl: featured.image,
        figureCount: deities.filter((d) => d.pantheonId === pantheon.id).length,
        figuresLabel: "deities",
      },
    ];
  },
);

const INTERACTIVE_STORIES = getBranchingStories().map(
  ({ id, slug, title, description, coverImage, totalEndings }) => ({
    id,
    slug,
    title,
    description,
    coverImage,
    totalEndings,
  }),
);

export const metadata = generateBaseMetadata({
  title: "Mythos Atlas - Explore World Mythology",
  description: `Explore gods, myths, and legendary worlds from ${getTraditionCount()} traditions with family trees, quizzes, stories, and interactive mythology tools.`,
  url: "/",
  keywords: [
    "mythology",
    "Greek gods",
    "Norse mythology",
    "Egyptian deities",
    "pantheons",
    "family tree",
    "comparative mythology",
    "Elizabeth Stein",
  ],
});

export default function Home() {
  return (
    <div className="min-h-screen">
      <AtlasOpensHero counts={HERO_COUNTS} figures={HERO_FIGURES} />
      <PantheonShowcase
        traditions={TRADITIONS}
        totalTraditions={HERO_COUNTS.pantheons}
      />
      <TodaysMyth />
      <CollectionsShowcase />
      <SyncretismStrip />
      <InteractiveStoriesBanner stories={INTERACTIVE_STORIES} />
      <GuidesStrip />
      <DidYouKnow deityLookup={DEITY_LOOKUP} />
    </div>
  );
}
