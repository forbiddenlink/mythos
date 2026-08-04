import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageHero } from "@/components/layout/page-hero";
import { generateBaseMetadata } from "@/lib/metadata";
import deitiesData from "@/data/deities.json";
import storiesData from "@/data/stories.json";

type StudyGuide = {
  slug: string;
  title: string;
  description: string;
  pantheonId?: string;
  keywords: string[];
  steps: Array<{ title: string; body: string; href: string }>;
};

const GUIDES: StudyGuide[] = [
  {
    slug: "greek-gods",
    title: "Greek Gods Study Guide",
    description:
      "A short study loop for undergrads and self-taught learners: orient on Olympus, learn the core Olympians, then pressure-test with the family tree and quiz.",
    pantheonId: "greek-pantheon",
    keywords: [
      "Greek gods study guide",
      "Olympian gods",
      "learn Greek mythology",
      "Zeus Athena Poseidon",
    ],
    steps: [
      {
        title: "Orient on the pantheon",
        body: "Read the Greek pantheon overview so succession, Olympus, and the Olympians sit in one picture.",
        href: "/pantheons/greek",
      },
      {
        title: "Meet the flagship deities",
        body: "Start with Zeus, then Athena, Poseidon, and Hades — domains, symbols, and linked stories.",
        href: "/deities/zeus",
      },
      {
        title: "See the bloodline",
        body: "Open the family tree for the Greek pantheon before reading longer myths that assume kinship.",
        href: "/family-tree",
      },
      {
        title: "Pressure-test recall",
        body: "Run the knowledge quiz, then use Review for cards that felt fuzzy.",
        href: "/quiz",
      },
    ],
  },
  {
    slug: "norse-mythology",
    title: "Norse Mythology Study Guide",
    description:
      "Learn the Aesir/Vanir landscape, Nine Realms map, and Ragnarök arc without drowning in encyclopedia entries.",
    pantheonId: "norse-pantheon",
    keywords: [
      "Norse mythology study guide",
      "Aesir Vanir",
      "Ragnarok",
      "learn Norse gods",
    ],
    steps: [
      {
        title: "Orient on the Norse pantheon",
        body: "Skim culture, realms, and the Aesir–Vanir frame before individual god pages.",
        href: "/pantheons/norse",
      },
      {
        title: "Walk the Nine Realms",
        body: "Use the Norse realms tour (and journeys when you want the map).",
        href: "/tours#norse-realms",
      },
      {
        title: "Read a signature arc",
        body: "Open Ragnarök cinematic or a core Eddic story after you know Odin, Thor, and Loki.",
        href: "/stories/ragnarok/cinematic",
      },
      {
        title: "Compare sky fathers",
        body: "Use parallels to see Odin beside Zeus and other sky-king analogues.",
        href: "/compare/parallels",
      },
    ],
  },
  {
    slug: "comparative-mythology",
    title: "Comparative Mythology Study Guide",
    description:
      "Train the comparative muscle: same roles across cultures, flood and sun myths, and how to use Mythos tools instead of memorizing catalogs.",
    keywords: [
      "comparative mythology study guide",
      "cross-cultural myths",
      "mythology parallels",
      "same gods different names",
    ],
    steps: [
      {
        title: "Browse parallels",
        body: "Start on the cross-pantheon parallels index — editorial analogies, not forced equivalences.",
        href: "/compare/parallels",
      },
      {
        title: "Spin a Rosetta collection",
        body: "Open a themed collection and read the Rosetta Wheel for one archetype across cultures.",
        href: "/collections",
      },
      {
        title: "Compare myth types",
        body: "Use Compare Myths for flood, creation, and underworld patterns side by side.",
        href: "/compare/myths",
      },
      {
        title: "Ask the Oracle carefully",
        body: "Pose a comparative question, then verify against deity pages and sources.",
        href: "/oracle",
      },
    ],
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}

export function listGuides() {
  return GUIDES;
}

export function studyMetadata(slug: string): Metadata {
  const guide = getGuide(slug);
  if (!guide) {
    return generateBaseMetadata({
      title: "Study Guide",
      description: "Mythology study routes on Mythos Atlas",
      url: `/study/${slug}`,
    });
  }
  return generateBaseMetadata({
    title: guide.title,
    description: guide.description,
    url: `/study/${guide.slug}`,
    keywords: guide.keywords,
  });
}

export function StudyGuidePage({ slug }: { slug: string }) {
  const guide = getGuide(slug);
  if (!guide) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="page-title">Guide not found</h1>
        <Link href="/study" className="mt-4 inline-block text-gold underline">
          All study guides
        </Link>
      </div>
    );
  }

  const deities = deitiesData as Array<{
    id: string;
    name: string;
    slug: string;
    pantheonId: string;
    importanceRank?: number | null;
  }>;
  const stories = storiesData as Array<{
    id: string;
    title: string;
    slug: string;
    pantheonId: string;
  }>;

  const featuredDeities = guide.pantheonId
    ? deities
        .filter((d) => d.pantheonId === guide.pantheonId)
        .sort((a, b) => (a.importanceRank ?? 99) - (b.importanceRank ?? 99))
        .slice(0, 6)
    : [];
  const featuredStories = guide.pantheonId
    ? stories.filter((s) => s.pantheonId === guide.pantheonId).slice(0, 4)
    : stories.slice(0, 4);

  return (
    <div className="min-h-screen">
      <PageHero
        mark="torch"
        tagline="Study route"
        title={guide.title}
        description={guide.description}
      />
      <div className="container mx-auto max-w-4xl px-4 py-12 bg-mythic">
        <Breadcrumbs />

        <ol className="mt-10 space-y-6">
          {guide.steps.map((step, i) => (
            <li
              key={step.href}
              className="border border-border/60 bg-card/60 p-5"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-gold/80">
                Step {i + 1}
              </p>
              <h2 className="mt-1 font-serif text-2xl text-foreground">
                {step.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
              <Link
                href={step.href}
                className="mt-3 inline-block text-sm text-gold underline-offset-4 hover:underline"
              >
                Open →
              </Link>
            </li>
          ))}
        </ol>

        {featuredDeities.length > 0 && (
          <section className="mt-12">
            <h2 className="font-serif text-xl text-foreground">
              Flagship deities
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {featuredDeities.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/deities/${d.slug}`}
                    className="border border-border/60 bg-background/50 px-3 py-1.5 text-sm hover:border-gold/40 hover:text-gold"
                  >
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {featuredStories.length > 0 && (
          <section className="mt-10">
            <h2 className="font-serif text-xl text-foreground">
              Stories to read next
            </h2>
            <ul className="mt-4 space-y-2">
              {featuredStories.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/stories/${s.slug}`}
                    className="text-sm text-gold hover:underline"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-12 text-sm text-muted-foreground">
          More routes:{" "}
          <Link href="/study" className="text-gold hover:underline">
            all study guides
          </Link>
          {" · "}
          <Link href="/learning-paths" className="text-gold hover:underline">
            personalized learning paths
          </Link>
        </p>
      </div>
    </div>
  );
}
