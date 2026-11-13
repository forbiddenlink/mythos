import type { Metadata } from "next";
import Link from "next/link";
import { EntityCard, EntityGrid } from "@/components/entities/EntityCard";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { ItemListJsonLd } from "@/components/seo/JsonLd";
import { getPantheons, getStories, getTraditions } from "@/lib/data/catalog";
import { getWorksheetSlugs } from "@/lib/data/worksheets";
import { generateBaseMetadata, shortPantheonName } from "@/lib/metadata";
import {
  fleschKincaidGrade,
  READING_BANDS,
  readingBand,
} from "@/lib/reading-level";
import { listGuides } from "../study/_guides";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythology for Teachers: Printable Worksheets and Classroom Tools",
  description:
    "Free printable mythology worksheets with answer keys for Greek, Norse, Egyptian and other traditions, plus study guides, quizzes and ready-made MLA, APA and Chicago citations.",
  url: "/teachers",
  image: null,
  keywords: [
    "mythology worksheets",
    "Greek mythology worksheet",
    "mythology lesson resources",
    "printable mythology activities",
  ],
});

/** Classroom tools that already exist elsewhere on the site. */
const TOOLS = [
  {
    title: "Quizzes",
    href: "/quiz",
    body: "Multiple-choice rounds on figures, symbols and domains. Wrong answers name the right one, and students can add the figures they missed to a review deck.",
  },
  {
    title: "Daily review",
    href: "/review",
    body: "Spaced-repetition flashcards built from what each student has read. Progress stays in their own browser, with no account or sign-in.",
  },
  {
    title: "Citations",
    href: "/sources",
    body: "Deity and story entries have a Cite this page control with MLA, APA and Chicago formats. The sources page lists the ancient texts and modern scholarship the atlas draws on.",
  },
  {
    title: "Reading paths",
    href: "/paths",
    body: "Ordered routes through a tradition or theme, for a unit that runs over several lessons.",
  },
] as const;

/** Every retelling, graded by formula and grouped into school-grade bands. */
function storiesByReadingLevel() {
  const pantheons = new Map(getPantheons().map((p) => [p.id, p]));
  const graded = getStories()
    .map((story) => ({
      slug: story.slug,
      title: story.title,
      tradition: shortPantheonName(pantheons.get(story.pantheonId)),
      grade: fleschKincaidGrade(story.fullNarrative),
    }))
    .sort((a, b) => a.grade - b.grade || a.title.localeCompare(b.title));
  return READING_BANDS.map((band) => ({
    band,
    stories: graded.filter((story) => readingBand(story.grade) === band),
  })).filter((group) => group.stories.length > 0);
}

export default function TeachersPage() {
  const worksheetSlugs = new Set(getWorksheetSlugs());
  const traditions = getTraditions().filter((p) => worksheetSlugs.has(p.slug));
  const studyGuides = listGuides();
  const readingLevels = storiesByReadingLevel();

  return (
    <>
      <ItemListJsonLd
        name="Mythos Atlas printable worksheets"
        description="Printable mythology worksheets with answer keys, one per tradition."
        url="/teachers"
        items={traditions.map((pantheon, index) => ({
          name: `${pantheon.name} worksheet`,
          url: `/pantheons/${pantheon.slug}/worksheet`,
          position: index + 1,
        }))}
      />
      <PageHero
        mark="codex"
        tagline="For teachers"
        title="Mythology for the Classroom"
        description="Printable worksheets with answer keys, study guides and citations. Free, with no sign-up for you or your students."
        count={`${traditions.length} worksheets`}
      />
      <Container className="pt-8 pb-12 md:pt-10">
        <nav
          aria-label="Classroom resources"
          className="mb-8 flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-4"
        >
          <a
            href="#teachers-worksheets"
            className="inline-flex min-h-11 items-center text-gold-text underline underline-offset-4"
          >
            Worksheets
          </a>
          <a
            href="#teachers-tools"
            className="inline-flex min-h-11 items-center text-gold-text underline underline-offset-4"
          >
            Classroom tools
          </a>
          <a
            href="#teachers-reading"
            className="inline-flex min-h-11 items-center text-gold-text underline underline-offset-4"
          >
            Stories by reading level
          </a>
          {studyGuides.length > 0 && (
            <a
              href="#teachers-study"
              className="inline-flex min-h-11 items-center text-gold-text underline underline-offset-4"
            >
              Study guides
            </a>
          )}
        </nav>
        <section aria-labelledby="teachers-worksheets" className="mb-14">
          <h2
            id="teachers-worksheets"
            className="page-section-title scroll-mt-24"
          >
            Printable worksheets
          </h2>
          <p className="mt-2 mb-6 max-w-prose text-muted-foreground">
            One sheet per tradition: match figures to their roles, complete
            family relationships, fill in a word bank and answer short
            questions. The answer key prints on its own page, on A4 or US
            Letter.
          </p>
          <EntityGrid>
            {traditions.map((pantheon, index) => (
              <EntityCard
                key={pantheon.slug}
                href={`/pantheons/${pantheon.slug}/worksheet`}
                title={`${pantheon.name} worksheet`}
                image={
                  pantheon.imageUrl?.startsWith("/")
                    ? pantheon.imageUrl
                    : undefined
                }
                aspect="landscape"
                priority={index < 3}
                headingLevel="h3"
                description={pantheon.region}
                meta="Worksheet and answer key"
              />
            ))}
          </EntityGrid>
        </section>

        <section aria-labelledby="teachers-tools" className="mb-14">
          <h2 id="teachers-tools" className="page-section-title scroll-mt-24">
            Classroom tools
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <li
                key={tool.href}
                className="rounded-lg border border-border/70 bg-card p-5"
              >
                <h3 className="font-serif text-xl">
                  <Link
                    href={tool.href}
                    className="underline decoration-gold/40 underline-offset-4 hover:decoration-current"
                  >
                    {tool.title}
                  </Link>
                </h3>
                <p className="mt-2 text-muted-foreground">{tool.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="teachers-reading" className="mb-14">
          <h2 id="teachers-reading" className="page-section-title scroll-mt-24">
            Stories by reading level
          </h2>
          <p className="mt-2 mb-6 max-w-prose text-muted-foreground">
            Every retelling, grouped by its Flesch-Kincaid grade: a formula over
            sentence length and syllables per word, computed from the text. It
            measures how hard the prose is to read, not how mature the story is,
            so read a story before you assign it.
          </p>
          <div className="space-y-3">
            {readingLevels.map(({ band, stories }) => (
              <details
                key={band.id}
                className="rounded-lg border border-border/70 bg-card"
              >
                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 px-5 py-3 font-serif text-lg">
                  <span>{band.label}</span>
                  <span className="type-meta text-muted-foreground">
                    {stories.length}{" "}
                    {stories.length === 1 ? "story" : "stories"}
                  </span>
                </summary>
                <ul className="grid gap-x-8 gap-y-2 border-t border-border/70 px-5 py-4 sm:grid-cols-2">
                  {stories.map((story) => (
                    <li key={story.slug}>
                      <Link
                        href={`/stories/${story.slug}`}
                        className="underline decoration-gold/40 underline-offset-4 hover:decoration-current"
                      >
                        {story.title}
                      </Link>{" "}
                      <span className="text-sm text-muted-foreground">
                        {story.tradition}, grade {story.grade.toFixed(1)}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </section>

        {studyGuides.length > 0 ? (
          <section aria-labelledby="teachers-study">
            <h2 id="teachers-study" className="page-section-title scroll-mt-24">
              Study guides
            </h2>
            <p className="mt-2 mb-6 max-w-prose text-muted-foreground">
              Step-by-step routes through a figure, a tradition or a comparison,
              with the entries and sources to read at each step.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {studyGuides.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    href={`/study/${guide.slug}`}
                    className="block rounded-lg border border-border/70 bg-card p-4 transition-colors hover:border-gold/60"
                  >
                    <span className="font-serif text-lg">{guide.title}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {guide.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
      <AboutThisPage title="About these resources">
        <p>
          The worksheets are built from the same catalog as the atlas, so every
          figure on a sheet has its own entry, with sources, for students who
          want to read further. Entries on living traditions say so, and retell
          the stories without speaking for the communities who keep them.
          Spotted an error, or need a sheet for a tradition that is not here
          yet? <Link href="/contact">Get in touch</Link>.
        </p>
      </AboutThisPage>
    </>
  );
}
