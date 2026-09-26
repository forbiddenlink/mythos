import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Printer } from "lucide-react";
import { EditorialByline } from "@/components/content/EditorialByline";
import {
  ArticleStack,
  heroShareClass,
} from "@/components/content/detail-parts";
import {
  ReadingParagraph,
  ReadingProse,
} from "@/components/content/reading-prose";
import { CosmologyDiagram } from "@/components/cosmology/CosmologyDiagram";
import { AboutThisPage } from "@/components/layout/about-this-page";
import {
  ArticleSection,
  DetailHero,
  DetailLayout,
  FactList,
  RelatedFigures,
  type TocItem,
} from "@/components/layout/detail-layout";
import { EntityGallery, EntityList } from "@/components/layout/entity-gallery";
import { SectionHeading } from "@/components/layout/section";
import { CollectionPageJsonLd } from "@/components/seo/JsonLd";
import { ShareButton } from "@/components/sharing/ShareButton";
import type { CitationSourceItem } from "@/components/sources/CitationSourcesList";
import { EntitySources } from "@/components/sources/EntitySources";
import creaturesData from "@/data/creatures.json";
import heroesData from "@/data/heroes.json";
import locationsData from "@/data/locations.json";
import pantheons from "@/data/pantheons.json";
import { resolveCosmology } from "@/lib/cosmology";
import { getDeities, getStories } from "@/lib/data/catalog";
import { hasWorksheet } from "@/lib/data/worksheets";
import { generateBaseMetadata, generateNotFoundMetadata } from "@/lib/metadata";
import { getPantheonColor } from "@/lib/pantheon-colors";

interface PantheonData {
  id: string;
  name: string;
  slug: string;
  culture: string;
  region: string;
  description: string | null;
  detailedHistory?: string | null;
  timePeriodStart: number | null;
  timePeriodEnd: number | null;
  imageUrl?: string | null;
  figuresLabel?: string | null;
  citationSources?: CitationSourceItem[];
}

interface Figure {
  id: string;
  name: string;
  slug: string;
  pantheonId?: string;
  imageUrl?: string | null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const allPantheons = pantheons as unknown as PantheonData[];

// Every valid param is prerendered by generateStaticParams; anything else is a
// 404 served from the static not-found page. (On-demand rendering of unknown
// params would cache HTML carrying one request's CSP nonce.) Alias URLs (ids,
// alternate names, other casings) are redirected by src/proxy.ts.
export const dynamicParams = false;

export async function generateStaticParams() {
  return allPantheons.map((pantheon) => ({ slug: pantheon.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pantheon = allPantheons.find((p) => p.slug === slug || p.id === slug);

  if (!pantheon) {
    return generateNotFoundMetadata(
      "Pantheon Not Found",
      "The requested pantheon could not be found.",
    );
  }

  const baseDescription =
    pantheon.description ||
    `Explore the ${pantheon.name} from ${pantheon.culture} mythology. Discover the gods, goddesses, and myths of ${pantheon.region}.`;
  const description =
    `${baseDescription} See major deities, stories, and cultural context in Mythos Atlas.`.slice(
      0,
      158,
    );

  return generateBaseMetadata({
    title: `${pantheon.name} Guide`,
    description: description,
    url: `/pantheons/${pantheon.slug}`,
    // The generated opengraph-image card for this route supplies og:image.
    image: null,
    type: "website",
    keywords: [
      pantheon.name,
      pantheon.culture,
      pantheon.region,
      "mythology",
      "pantheon",
      "gods",
      "goddesses",
      "ancient religion",
      "mythology encyclopedia",
    ],
  });
}

function era(year: number): string {
  return `${Math.abs(year)} ${year < 0 ? "BCE" : "CE"}`;
}

function catalogPeriod(pantheon: PantheonData): string {
  const { timePeriodStart: start, timePeriodEnd: end } = pantheon;
  if (start !== null) {
    if (end === null) return `From ${era(start)}; end date not recorded`;
    return `${era(start)} – ${era(end)}`;
  }
  return end !== null ? `Until ${era(end)}` : "Dates not recorded";
}

/**
 * The cover: the catalog image, preferring the copy served from /public when
 * the catalog points at a remote host (read at build time; pages are static).
 */
function coverImage(pantheon: PantheonData): string | null {
  const url = pantheon.imageUrl ?? null;
  if (url && url.startsWith("/")) return url;
  for (const ext of ["jpg", "png"]) {
    const local = `/pantheons/${pantheon.slug}.${ext}`;
    if (existsSync(join(process.cwd(), "public", local))) return local;
  }
  return url;
}

export default async function PantheonPage({ params }: PageProps) {
  const { slug } = await params;

  const pantheon = allPantheons.find((p) => p.slug === slug || p.id === slug);
  if (!pantheon) {
    notFound();
  }

  if (pantheon.slug !== slug) {
    redirect(`/pantheons/${pantheon.slug}`);
  }

  const figuresLabel = pantheon.figuresLabel || "Deities";
  const deities = getDeities()
    .filter((deity) => deity.pantheonId === pantheon.id)
    .sort((a, b) => (a.importanceRank ?? 999) - (b.importanceRank ?? 999));
  const stories = getStories().filter(
    (story) => story.pantheonId === pantheon.id,
  );
  const places = (
    locationsData as Array<Figure & { locationType: string }>
  ).filter((location) => location.pantheonId === pantheon.id);
  const heroes = (heroesData as Figure[]).filter(
    (hero) => hero.pantheonId === pantheon.id,
  );
  const creatures = (creaturesData as Array<Figure & { habitat?: string }>)
    .filter((creature) => creature.pantheonId === pantheon.id)
    .slice(0, 6);
  const cosmology = resolveCosmology(pantheon.id);
  const accent = getPantheonColor(pantheon.id);
  const cover = coverImage(pantheon);
  const PLACE_LIMIT = 12;

  const toc: TocItem[] = [
    {
      id: "pantheon-about",
      label: pantheon.detailedHistory ? "History and context" : "Context",
    },
    ...(cosmology ? [{ id: "cosmology", label: "Cosmology" }] : []),
    ...(pantheon.citationSources?.length
      ? [{ id: "sources", label: "Sources" }]
      : []),
    ...(deities.length > 0
      ? [{ id: "pantheon-figures", label: figuresLabel }]
      : []),
    ...(stories.length > 0
      ? [{ id: "pantheon-stories", label: "Stories and myths" }]
      : []),
    ...(places.length > 0 ? [{ id: "pantheon-places", label: "Places" }] : []),
  ];

  const facts = (
    <FactList
      facts={[
        { label: "Culture", value: pantheon.culture },
        { label: "Region", value: pantheon.region },
        { label: "Catalog period", value: catalogPeriod(pantheon) },
        { label: figuresLabel, value: String(deities.length) },
        {
          label: "Stories",
          value: stories.length ? String(stories.length) : null,
        },
      ]}
    />
  );

  return (
    <>
      <CollectionPageJsonLd
        name={`${pantheon.name} - ${pantheon.culture} Mythology`}
        description={
          pantheon.description ||
          `Explore the ${pantheon.name} from ${pantheon.culture} mythology.`
        }
        url={`/pantheons/${pantheon.slug}`}
        numberOfItems={deities.length}
      />
      <DetailLayout
        hero={
          <DetailHero
            accentColor={accent}
            imageAspect="landscape"
            image={cover ? { src: cover, alt: "" } : null}
            imageFallback={
              <span
                className="font-serif text-7xl text-gold/70"
                aria-hidden="true"
              >
                {pantheon.name.charAt(0)}
              </span>
            }
            eyebrow={<span>{pantheon.region}</span>}
            title={pantheon.name}
            lede={pantheon.description ? <p>{pantheon.description}</p> : null}
            actions={
              <>
                <ShareButton
                  surface="pantheon_page"
                  title={`${pantheon.name} - Mythos Atlas`}
                  text={`Explore the ${pantheon.name} of ${pantheon.culture} mythology on Mythos Atlas`}
                  url={`https://mythosatlas.com/pantheons/${pantheon.slug}`}
                  className={heroShareClass}
                />
                {hasWorksheet(pantheon.slug) ? (
                  <Link
                    href={`/pantheons/${pantheon.slug}/worksheet`}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-parchment/25 px-4 type-ui text-parchment transition-colors hover:border-gold/60 hover:bg-white/10"
                  >
                    <Printer aria-hidden="true" className="size-4" />
                    Printable worksheet
                  </Link>
                ) : null}
              </>
            }
          />
        }
        facts={facts}
        toc={toc}
        asideLabel={`${pantheon.name} at a glance`}
        aside={
          <>
            <RelatedFigures
              title="Heroes"
              figures={heroes.slice(0, 6).map((hero) => ({
                name: hero.name,
                href: `/heroes/${hero.slug}`,
                imageUrl: hero.imageUrl,
                meta: "Hero",
              }))}
            />
            <RelatedFigures
              title="Creatures"
              figures={creatures.map((creature) => ({
                name: creature.name,
                href: `/creatures/${creature.slug}`,
                imageUrl: creature.imageUrl,
                meta: creature.habitat,
              }))}
            />
          </>
        }
        after={
          <>
            {deities.length > 0 ? (
              <section
                id="pantheon-figures"
                aria-labelledby="pantheon-figures-heading"
                className="scroll-mt-24"
              >
                <SectionHeading
                  id="pantheon-figures-heading"
                  eyebrow={`${deities.length} in the atlas`}
                  title={figuresLabel}
                  action={{ href: "/deities", label: "All deities" }}
                />
                <EntityGallery
                  columns={6}
                  items={deities.map((deity) => ({
                    name: deity.name,
                    href: `/deities/${deity.slug}`,
                    imageUrl: deity.imageUrl,
                    meta:
                      deity.traditionRole ??
                      deity.domain?.slice(0, 2).join(", "),
                  }))}
                />
              </section>
            ) : null}

            {stories.length > 0 ? (
              <section
                id="pantheon-stories"
                aria-labelledby="pantheon-stories-heading"
                className="scroll-mt-24"
              >
                <SectionHeading
                  id="pantheon-stories-heading"
                  eyebrow={`${stories.length} retold`}
                  title="Stories and myths"
                  action={{ href: "/stories", label: "All stories" }}
                />
                <EntityList
                  columns={2}
                  items={stories.map((story) => ({
                    name: story.title,
                    href: `/stories/${story.slug}`,
                    imageUrl: story.imageUrl,
                    meta: story.category,
                    description: story.summary,
                  }))}
                />
              </section>
            ) : null}

            {places.length > 0 ? (
              <section
                id="pantheon-places"
                aria-labelledby="pantheon-places-heading"
                className="scroll-mt-24"
              >
                <SectionHeading
                  id="pantheon-places-heading"
                  eyebrow={
                    places.length > PLACE_LIMIT
                      ? `${PLACE_LIMIT} of ${places.length}`
                      : `${places.length} in the atlas`
                  }
                  title="Sacred places"
                  action={{ href: "/locations", label: "All places" }}
                />
                <EntityGallery
                  columns={6}
                  aspect="square"
                  items={places.slice(0, PLACE_LIMIT).map((place) => ({
                    name: place.name,
                    href: `/locations/${place.id}`,
                    imageUrl: place.imageUrl,
                    meta: place.locationType.replaceAll("_", " "),
                  }))}
                />
              </section>
            ) : null}
          </>
        }
      >
        <ArticleStack>
          <ArticleSection
            id="pantheon-about"
            title={pantheon.detailedHistory ? "History and context" : "Context"}
          >
            {pantheon.detailedHistory ? (
              <ReadingProse markdown={pantheon.detailedHistory} dropCap />
            ) : (
              <ReadingParagraph>{pantheon.description}</ReadingParagraph>
            )}
          </ArticleSection>

          {cosmology ? (
            <ArticleSection
              id="cosmology"
              eyebrow="Cosmology"
              title={cosmology.title}
              reading={false}
            >
              <CosmologyDiagram cosmology={cosmology} accent={accent} />
            </ArticleSection>
          ) : null}

          {pantheon.citationSources?.length ? (
            <ArticleSection id="sources" title="Sources">
              <EntitySources
                citationSources={pantheon.citationSources}
                provenance={false}
              />
            </ArticleSection>
          ) : null}

          <AboutThisPage title="About this guide" size={false}>
            <EditorialByline />
            <p>
              The catalog period is the span of the sources this atlas draws on,
              not the age of the tradition itself. Many traditions are older
              than their first written record, and many are still practised.
            </p>
          </AboutThisPage>
        </ArticleStack>
      </DetailLayout>
    </>
  );
}
