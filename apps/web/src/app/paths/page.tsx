import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { EntityCard, EntityGrid } from "@/components/entities/EntityCard";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import {
  AnkiDeckExport,
  type AnkiDeckExportProps,
} from "@/components/learning/AnkiDeckExport";
import {
  COLLECTION_COUNT,
  CollectionsSection,
} from "@/components/paths/CollectionsSection";
import { ReadingPaths } from "@/components/paths/ReadingPaths";
import { toDeityCardData } from "@/lib/anki-export";
import {
  getDeities,
  getJourneys,
  getPantheonShortNames,
  getPantheons,
  getStories,
} from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { generateBaseMetadata } from "@/lib/metadata";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { listGuides } from "../study/_guides";

export const metadata: Metadata = generateBaseMetadata({
  title: "Paths Through World Mythology",
  description:
    "Guided ways through the atlas: themed collections across traditions, mapped hero journeys, study guides with Anki decks, and reading paths built from what you have read.",
  url: "/paths",
  keywords: [
    "mythology learning paths",
    "mythology collections",
    "hero journeys",
    "mythology study guide",
    "Anki mythology deck",
  ],
});

/** Counts and one preview card per pantheon; the full deck loads on download. */
function ankiDeckProps(): AnkiDeckExportProps {
  const deities = getDeities();
  const names = getPantheonShortNames();
  const deityCounts: Record<string, number> = {};
  const samples: AnkiDeckExportProps["samples"] = {};
  for (const d of deities) {
    deityCounts[d.pantheonId] = (deityCounts[d.pantheonId] ?? 0) + 1;
    const card = () => toDeityCardData(d, names[d.pantheonId] ?? d.pantheonId);
    samples.all ??= card();
    samples[d.pantheonId] ??= card();
  }
  return {
    pantheons: project(getPantheons(), ["id", "name", "slug"]),
    deityCounts,
    totalDeities: deities.length,
    samples,
  };
}

export default function PathsPage() {
  const journeys = getJourneys();
  const guides = listGuides();
  const shortNames = getPantheonShortNames();

  const sections = [
    {
      id: "collections",
      label: "Themed collections",
      detail: `${COLLECTION_COUNT} themes across traditions`,
    },
    {
      id: "journeys",
      label: "Guided journeys",
      detail: `${journeys.length} routes, stop by stop`,
    },
    {
      id: "study-guides",
      label: "Study guides",
      detail: `${guides.length} guides and flashcard decks`,
    },
    {
      id: "reading-paths",
      label: "Your reading paths",
      detail: "Built from what you have read",
    },
  ];

  return (
    <div className="min-h-screen">
      <PageHeader
        mark="compass"
        eyebrow="Guided ways through the atlas"
        title="Paths"
        lede="Be led by a theme that crosses traditions, a route with stops, a study guide, or a reading path shaped by what you have opened."
      />
      <Container className="pt-6 pb-16 md:pt-8">
        <nav aria-label="Kinds of path" className="mb-14">
          <ul className="grid gap-x-8 border-y border-border sm:grid-cols-2 lg:grid-cols-4">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="group flex min-h-11 flex-col py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  <span className="font-serif text-lg text-foreground group-hover:text-gold-text">
                    {section.label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {section.detail}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-20">
          <CollectionsSection />

          <section
            id="journeys"
            aria-labelledby="paths-journeys"
            className="scroll-mt-24"
          >
            <p className="type-eyebrow mb-2">Follow a route</p>
            <h2 id="paths-journeys" className="page-section-title">
              Guided journeys
            </h2>
            <p className="mt-3 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
              Travel with a hero or a god from stop to stop. Earthly voyages are
              drawn on a map; journeys through the otherworld follow their
              realms in order.
            </p>
            <EntityGrid className="mt-8">
              {journeys.map((journey) => (
                <EntityCard
                  key={journey.id}
                  href={`/journeys/${journey.slug}`}
                  title={journey.title}
                  image={journey.imageUrl}
                  aspect="landscape"
                  tradition={
                    shortNames[journey.pantheonId] ?? journey.pantheonId
                  }
                  traditionColor={getPantheonColor(journey.pantheonId)}
                  subtitle={`${journey.heroName} · ${journey.waypoints.length} stops${
                    journey.setting === "otherworld" ? " · otherworld" : ""
                  }`}
                  description={journey.description}
                />
              ))}
            </EntityGrid>
            <Link
              href="/journeys"
              className="mt-4 inline-flex min-h-11 items-center gap-2 font-medium text-gold-text underline underline-offset-4"
            >
              See every journey with its map
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </section>

          <section
            id="study-guides"
            aria-labelledby="paths-study-guides"
            className="scroll-mt-24"
          >
            <p className="type-eyebrow mb-2">Read with sources</p>
            <h2 id="paths-study-guides" className="page-section-title">
              Study guides
            </h2>
            <p className="mt-3 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
              Short curricula that pair catalog entries with source passages and
              guided questions.
            </p>
            <ul className="mt-6 grid gap-x-12 md:grid-cols-2">
              {guides.map((guide) => (
                <li key={guide.slug} className="border-t border-border">
                  <Link
                    href={`/study/${guide.slug}`}
                    className="group flex gap-4 py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block font-serif text-xl text-foreground group-hover:text-gold-text">
                        {guide.title}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                        {guide.description}
                      </span>
                    </div>
                    <ArrowRight
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-gold-text"
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <AnkiDeckExport {...ankiDeckProps()} />
            </div>
          </section>

          <section
            id="reading-paths"
            aria-labelledby="paths-reading"
            className="scroll-mt-24"
          >
            <p className="type-eyebrow mb-2">Made for you, in this browser</p>
            <h2 id="paths-reading" className="page-section-title">
              Your reading paths
            </h2>
            <p className="mt-3 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
              Sequences of deities and stories chosen from the traditions and
              themes you have opened. Your reading history stays on this device.
            </p>
            <ReadingPaths
              allDeities={project(getDeities(), [
                "id",
                "name",
                "slug",
                "pantheonId",
                "domain",
                "importanceRank",
              ])}
              allStories={project(getStories(), [
                "id",
                "title",
                "slug",
                "pantheonId",
                "category",
                "moralThemes",
              ])}
            />
          </section>
        </div>
      </Container>
    </div>
  );
}
