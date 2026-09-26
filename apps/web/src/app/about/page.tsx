import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AboutPageJsonLd } from "@/components/seo/JsonLd";
import { generateBaseMetadata } from "@/lib/metadata";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { InfoColumns } from "@/components/layout/info-page";
import deitiesData from "@/data/deities.json";
import storiesData from "@/data/stories.json";
import locationsData from "@/data/locations.json";
import { getTraditionCount } from "@/lib/data/catalog";
import { countImagesByKind } from "@/lib/image-provenance";

const IMAGE_COUNTS = countImagesByKind();

// Derived from the data files so the About copy can never drift from the atlas
// again (it previously undercounted locations by 38 and overstated deities).
const COVERAGE = {
  pantheons: getTraditionCount(),
  deities: deitiesData.length,
  stories: storiesData.length,
  locations: locationsData.length,
} as const;

const COVERAGE_FIGURES = [
  { value: COVERAGE.pantheons, label: "traditions", href: "/pantheons" },
  { value: COVERAGE.deities, label: "deities", href: "/deities" },
  { value: COVERAGE.stories, label: "stories", href: "/stories" },
  { value: COVERAGE.locations, label: "sacred places", href: "/locations" },
] as const;

const WAYS_IN = [
  {
    title: "Follow a family",
    body: "Family trees and a knowledge graph show who descends from whom and which figures echo each other across traditions.",
    href: "/family-tree",
    link: "Open the family tree",
  },
  {
    title: "Read the myths",
    body: "Retellings drawn from primary sources such as the Eddas, the Theogony and the Popol Vuh, each with its citations.",
    href: "/stories",
    link: "Browse the stories",
  },
  {
    title: "Compare traditions",
    body: "Set figures side by side to see where sky fathers, tricksters and rulers of the dead meet and where they part.",
    href: "/compare",
    link: "Compare figures",
  },
  {
    title: "Make it stick",
    body: "Quizzes, a daily myth and spaced-repetition review turn reading into something you remember.",
    href: "/quiz",
    link: "Take a quiz",
  },
] as const;

const STACK = [
  "Next.js 16 (App Router)",
  "React 19",
  "TypeScript",
  "Tailwind CSS",
  "A static JSON content layer",
  "ReactFlow and D3",
  "Vercel hosting",
];

export const metadata = generateBaseMetadata({
  title: "About Mythos Atlas",
  description:
    "Learn about Mythos Atlas, an interactive encyclopedia exploring ancient mythology from civilizations around the world. Created by Elizabeth Stein.",
  url: "/about",
  keywords: [
    "about",
    "mythology encyclopedia",
    "Elizabeth Stein",
    "ancient mythology project",
  ],
});

const TOC = [
  { id: "about-mission", label: "Why this atlas exists" },
  { id: "about-ways-in", label: "Four ways in" },
  { id: "images", label: "About the images" },
  { id: "about-creator", label: "Who makes it" },
  { id: "about-status", label: "Project status" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <AboutPageJsonLd
        creatorName="Elizabeth Stein"
        creatorDescription="A passionate developer and mythology enthusiast who combines technical expertise with a deep appreciation for ancient cultures and storytelling."
      />
      <PageHeader
        eyebrow="The project"
        mark="temple"
        title="About Mythos Atlas"
        lede="An illustrated encyclopedia of world mythology, built so that gods, stories and places connect instead of sitting in separate entries."
      />

      <Container className="pt-10 md:pt-14">
        <ul
          aria-label="The atlas at a glance"
          className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border/70 bg-border/70 md:grid-cols-4"
        >
          {COVERAGE_FIGURES.map((figure) => (
            <li key={figure.label} className="bg-background">
              <Link
                href={figure.href}
                className="group flex h-full flex-col gap-1 px-5 py-5 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold md:px-6 md:py-6"
              >
                <span className="order-2 flex items-center gap-1.5 type-ui text-muted-foreground group-hover:text-foreground">
                  {figure.label}
                  <ArrowRight
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
                <span className="order-1 font-serif text-3xl font-semibold tabular-nums text-foreground md:text-4xl">
                  {figure.value}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      <Container className="section-space">
        <InfoColumns toc={TOC} aside={<SupportCard />}>
          <section aria-labelledby="about-mission">
            <h2 id="about-mission">Why this atlas exists</h2>
            <p>
              Mythos Atlas is built for learners who want mythology to stick:
              students, self-taught readers and curious explorers who need more
              than isolated encyclopedia entries.
            </p>
            <p>
              It connects pantheons, deities, stories, places and family trees
              so you can move from quick orientation into deeper study, then
              reinforce what you learn with quizzes and review. Open a deity,
              follow their stories and relations, test yourself, and return with
              a clearer sense of the culture that shaped them.
            </p>
          </section>

          <section aria-labelledby="about-ways-in">
            <h2 id="about-ways-in">Four ways in</h2>
            <ul className="mt-6! list-none! space-y-0! divide-y divide-border/70 border-y border-border/70 pl-0!">
              {WAYS_IN.map((way) => (
                <li
                  key={way.href}
                  className="grid gap-2 py-5 pl-0! sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6"
                >
                  <h3 className="mt-0! text-lg!">{way.title}</h3>
                  <div className="mt-0!">
                    <p className="text-muted-foreground">{way.body}</p>
                    <p className="mt-2">
                      <Link href={way.href} className="type-ui font-medium">
                        {way.link}
                      </Link>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section id="images" aria-labelledby="about-images-title">
            <h2 id="about-images-title">About the images</h2>
            <p>
              The pictures of deities, heroes, creatures, artifacts, places and
              stories in the catalog are illustrations made for Mythos Atlas.{" "}
              {IMAGE_COUNTS["illustration-ai"]} were generated with an AI image
              model; {IMAGE_COUNTS["illustration-procedural"]} are ornamental
              plates drawn by code, with a border, an emblem and a name.
            </p>
            <p>
              They are interpretations to help you find your way. They are not
              historical artworks or archaeological finds, and they are not
              evidence of how a tradition pictured its gods. Pages mark them
              with an <strong>Illustrative image</strong> label.
            </p>
            <p>
              One photograph is used as a card background: the Acropolis of
              Athens at sunset, by{" "}
              <a
                href="https://unsplash.com/photos/G8OyUvtAxUQ"
                rel="noopener noreferrer"
                target="_blank"
              >
                Stavrialena Gontzou on Unsplash
              </a>
              , used under the Unsplash License.
            </p>
            <p>
              Historical objects are shown separately with their museum records:
              the institution, accession number and image rights appear beside
              each one, linked to the museum&apos;s own page.
            </p>
            <p className="text-muted-foreground">
              If an illustration misrepresents a tradition, please{" "}
              <Link href="/contact">tell us</Link> and it will be reviewed or
              replaced.
            </p>
          </section>

          <section aria-labelledby="about-creator">
            <h2 id="about-creator">Who makes it</h2>
            <p>
              Mythos Atlas is written, designed and built by{" "}
              <strong>Elizabeth Stein</strong>, a developer and mythology
              enthusiast who combines technical craft with a deep appreciation
              for ancient cultures and storytelling.
            </p>
            <blockquote className="border-l-2 border-gold/50 pl-5 font-body text-xl italic leading-relaxed text-foreground">
              &ldquo;I built Mythos Atlas because I couldn&apos;t find a
              mythology resource that combined scholarly accuracy with good
              design. These stories deserve better than dusty encyclopedias or
              clickbait listicles.&rdquo;
            </blockquote>
          </section>

          <section aria-labelledby="about-status">
            <h2 id="about-status">Project status</h2>
            <p>
              The atlas is an ongoing, independent project with regular updates.
              It currently spans {COVERAGE.pantheons} traditions, and each
              release deepens source coverage and the links between them. The{" "}
              <Link href="/changelog">changelog</Link> lists what changed and
              when; the <Link href="/sources">sources</Link> page lists the
              works every entry draws on.
            </p>
            <p className="type-ui text-muted-foreground">
              Built with {STACK.join(", ")}. Last updated August 2026.
            </p>
          </section>
        </InfoColumns>
      </Container>
    </div>
  );
}

function SupportCard() {
  return (
    <aside
      aria-labelledby="support-atlas"
      className="rounded-lg border border-gold/30 bg-gold/[0.06] p-6"
    >
      <p className="type-eyebrow">Independent and ad-free</p>
      <h2
        id="support-atlas"
        className="mt-2 font-serif text-2xl font-semibold text-foreground"
      >
        Support the atlas
      </h2>
      <p className="mt-3 type-reading text-muted-foreground">
        Optional contributions help with source research, design and upkeep.
        Nothing is behind a paywall.
      </p>
      <Link
        href="/support"
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-gold px-5 type-ui font-semibold text-midnight transition-colors hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        Support Mythos Atlas
      </Link>
      <p className="mt-4 type-ui text-muted-foreground">
        Found an error or have a suggestion?{" "}
        <Link
          href="/contact"
          className="text-gold-text underline underline-offset-4"
        >
          Get in touch
        </Link>
        .
      </p>
    </aside>
  );
}
