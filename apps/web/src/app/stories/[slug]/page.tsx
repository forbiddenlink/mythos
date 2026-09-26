import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowDown, Headphones, Play, ScrollText } from "lucide-react";
import { TrackPageView } from "@/components/analytics/TrackPageView";
import { EditorialByline } from "@/components/content/EditorialByline";
import {
  ArticleStack,
  FactLink,
  heroIconButtonClass,
  heroShareClass,
} from "@/components/content/detail-parts";
import { IllustrativeImageCaption } from "@/components/content/IllustrativeImageCaption";
import {
  ReadingParagraph,
  ReadingProse,
} from "@/components/content/reading-prose";
import {
  ArticleSection,
  DetailHero,
  DetailLayout,
  FactList,
  RelatedFigures,
  type TocItem,
} from "@/components/layout/detail-layout";
import { MuseumGallery } from "@/components/museum/MuseumGallery";
import { ArticleJsonLd } from "@/components/seo/JsonLd";
import { ShareButton } from "@/components/sharing/ShareButton";
import {
  EntitySources,
  hasEntitySources,
} from "@/components/sources/EntitySources";
import type { CitationSourceItem } from "@/components/sources/CitationSourcesList";
import type { FurtherReadingReference } from "@/components/sources/ReferencesList";
import type { PrimarySourceExcerpt } from "@/components/sources/SourceExcerpt";
import {
  MythVariants,
  type MythVariant,
} from "@/components/stories/MythVariants";
import { StoryNarrator } from "@/components/stories/StoryNarrator";
import { VersionMatrix } from "@/components/stories/VersionMatrix";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { ExportIconButton } from "@/components/ui/export-button";
import deities from "@/data/deities.json";
import heroes from "@/data/heroes.json";
import locations from "@/data/locations.json";
import pantheons from "@/data/pantheons.json";
import stories from "@/data/stories.json";
import { formatPantheonLabel } from "@/lib/deity-page";
import { getIllustrativeImageNote } from "@/lib/image-provenance";
import {
  generateBaseMetadata,
  generateNotFoundMetadata,
  shortPantheonName,
} from "@/lib/metadata";
import { getMuseumObjectsForStory } from "@/lib/museum";
import { getMythVersions } from "@/lib/myth-versions";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { canonicalStorySlug } from "@/lib/story-aliases";
import { StoryProgressTracker } from "./_components/StoryProgressTracker";

interface StoryData {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  imageUrl?: string | null;
  fullNarrative?: string | null;
  keyExcerpts?: string;
  moralThemes?: string[];
  culturalSignificance?: string;
  featuredDeities?: string[];
  featuredHeroes?: string[];
  featuredLocations?: string[];
  relatedStories?: string[];
  variants?: MythVariant[];
  citationSources?: CitationSourceItem[];
  primarySourceExcerpts?: PrimarySourceExcerpt[];
  furtherReading?: FurtherReadingReference[];
  sources?: string[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const allStories = stories as unknown as StoryData[];

function sentenceCase(text: string): string {
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// Stories that have cinematic versions available
const CINEMATIC_STORIES = new Set(["ragnarok", "titanomachy"]);

// Every valid param is prerendered by generateStaticParams; anything else is a
// 404 served from the static not-found page. (On-demand rendering of unknown
// params would cache HTML carrying one request's CSP nonce.)
export const dynamicParams = false;

export async function generateStaticParams() {
  return allStories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = canonicalStorySlug(rawSlug);
  const story = allStories.find((s) => s.slug === slug);

  if (!story) {
    return generateNotFoundMetadata(
      "Story Not Found",
      "The requested story could not be found.",
    );
  }

  const pantheon = pantheons.find((p) => p.id === story.pantheonId);
  const pantheonName = shortPantheonName(pantheon);

  const themes = story.moralThemes?.slice(0, 3).join(", ") || "";
  const description =
    story.summary?.slice(0, 160) ||
    `Read ${story.title}, a ${story.category} from ${pantheonName} mythology. Themes: ${themes}.`;

  return generateBaseMetadata({
    title: `${story.title} - ${pantheonName} Mythology`,
    description: description,
    url: `/stories/${story.slug}`,
    // The generated opengraph-image card for this route supplies og:image.
    image: null,
    type: "article",
    keywords: [
      story.title,
      story.category,
      ...(story.moralThemes || []),
      pantheonName,
      "mythology",
      "myth",
      "legend",
      "ancient story",
    ],
    articleSection: "Stories",
    articleTags: story.moralThemes,
  });
}

export default async function StoryPage({ params }: PageProps) {
  const { slug } = await params;
  const canonical = canonicalStorySlug(slug);
  if (canonical !== slug) {
    redirect(`/stories/${canonical}`);
  }

  const story = allStories.find((s) => s.slug === slug);
  if (!story) {
    notFound();
  }

  const pantheon = pantheons.find((entry) => entry.id === story.pantheonId);
  const traditionName = pantheon?.name ?? formatPantheonLabel(story.pantheonId);

  // Stories without curated links name their cast in the text: fall back to
  // figures and places of the same tradition that the narrative mentions.
  const text = `${story.summary} ${story.fullNarrative ?? ""}`;
  const mentions = (name: string) =>
    name.length > 2 &&
    new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(
      text,
    );
  const deityIds = story.featuredDeities?.length
    ? story.featuredDeities
    : deities
        .filter((d) => d.pantheonId === story.pantheonId && mentions(d.name))
        .slice(0, 8)
        .map((d) => d.id);
  const locationIds = story.featuredLocations?.length
    ? story.featuredLocations
    : locations
        .filter((l) => l.pantheonId === story.pantheonId && mentions(l.name))
        .slice(0, 6)
        .map((l) => l.id);

  const characters = [
    ...deityIds.flatMap((id) => {
      const entry = deities.find((deity) => deity.id === id);
      return entry
        ? [
            {
              name: entry.name,
              href: `/deities/${entry.slug}`,
              imageUrl: entry.imageUrl,
              meta: entry.domain?.slice(0, 2).join(", "),
            },
          ]
        : [];
    }),
    ...(story.featuredHeroes ?? []).flatMap((id) => {
      const entry = heroes.find((hero) => hero.id === id);
      return entry
        ? [
            {
              name: entry.name,
              href: `/heroes/${entry.slug}`,
              imageUrl: entry.imageUrl,
              meta: "Hero",
            },
          ]
        : [];
    }),
  ];
  const places = locationIds.flatMap((id) => {
    const entry = locations.find((location) => location.id === id);
    return entry
      ? [
          {
            name: entry.name,
            href: `/locations/${entry.id}`,
            imageUrl: entry.imageUrl,
            meta: entry.locationType?.replaceAll("_", " "),
          },
        ]
      : [];
  });
  const relatedStories = (story.relatedStories ?? []).flatMap((id) => {
    const entry = allStories.find((related) => related.id === id);
    return entry
      ? [
          {
            name: entry.title,
            href: `/stories/${entry.slug}`,
            imageUrl: entry.imageUrl,
            meta: formatPantheonLabel(entry.pantheonId),
          },
        ]
      : [];
  });

  const versions = getMythVersions(slug);
  const museumObjects = getMuseumObjectsForStory(story.id);
  const variants = story.variants ?? [];
  const hasSources = hasEntitySources(story);

  const toc: TocItem[] = [
    { id: "story-narrative", label: "The story" },
    ...(story.keyExcerpts ? [{ id: "highlights", label: "Highlights" }] : []),
    ...(story.culturalSignificance
      ? [{ id: "significance", label: "Why it matters" }]
      : []),
    ...(versions ? [{ id: "versions", label: "Compare tellings" }] : []),
    ...(variants.length > 0
      ? [{ id: "variants", label: "Other versions" }]
      : []),
    ...(museumObjects.length > 0
      ? [{ id: "in-art", label: "The myth in art" }]
      : []),
    { id: "story-sources", label: "Sources and further reading" },
  ];

  const facts = (
    <FactList
      facts={[
        {
          label: "Tradition",
          value: pantheon ? (
            <FactLink href={`/pantheons/${pantheon.slug}`}>
              {pantheon.name}
            </FactLink>
          ) : (
            traditionName
          ),
        },
        {
          label: "Kind of myth",
          value: <span className="capitalize">{story.category}</span>,
        },
        {
          label: "Themes",
          value: story.moralThemes?.length
            ? sentenceCase(story.moralThemes.join(", "))
            : null,
        },
      ]}
    />
  );

  return (
    <>
      <TrackPageView
        event="entry_viewed"
        properties={{
          entityType: "story",
          slug,
          pantheon: story.pantheonId,
        }}
      />
      <StoryProgressTracker storyId={story.id} pantheonId={story.pantheonId} />
      <ArticleJsonLd
        headline={story.title}
        description={story.summary}
        section={story.category}
        tags={story.moralThemes}
        url={`/stories/${story.slug}`}
      />
      <DetailLayout
        hero={
          <DetailHero
            accentColor={getPantheonColor(story.pantheonId)}
            imageAspect="square"
            image={
              story.imageUrl
                ? {
                    src: story.imageUrl,
                    alt: `Illustration for ${story.title}`,
                  }
                : null
            }
            imageCaption={
              story.imageUrl ? (
                <IllustrativeImageCaption
                  note={getIllustrativeImageNote("story", story.id)}
                  subject="Story illustration. Historical objects are identified separately with their museum records"
                  tone="light"
                />
              ) : null
            }
            imageFallback={
              <ScrollText className="size-16 text-gold/60" aria-hidden="true" />
            }
            eyebrow={
              <>
                <span>{traditionName}</span>
                <span className="text-gold/50" aria-hidden="true">
                  ·
                </span>
                <span className="capitalize text-parchment/85">
                  {story.category}
                </span>
              </>
            }
            title={story.title}
            lede={<p>{story.summary}</p>}
            actions={
              <>
                <a
                  href="#story-narrative"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-gold px-5 text-[0.9375rem] font-semibold text-midnight transition-colors hover:bg-gold-light"
                >
                  Read the story
                  <ArrowDown className="size-4" aria-hidden="true" />
                </a>
                <BookmarkButton
                  type="story"
                  id={story.id}
                  size="md"
                  variant="light"
                  className={heroIconButtonClass}
                />
                <ShareButton
                  surface="story_page"
                  title={`${story.title} - Mythos Atlas`}
                  text={story.summary}
                  url={`https://mythosatlas.com/stories/${story.slug}`}
                  className={heroShareClass}
                />
                <ExportIconButton
                  type="story"
                  data={{
                    title: story.title,
                    summary: story.summary,
                    fullNarrative: story.fullNarrative,
                    category: story.category,
                    moralThemes: story.moralThemes,
                    culturalSignificance: story.culturalSignificance,
                    pantheonId: story.pantheonId,
                    featuredDeities: story.featuredDeities,
                  }}
                  variant="ghost"
                  className={heroIconButtonClass}
                />
              </>
            }
          />
        }
        facts={facts}
        toc={toc}
        asideLabel={`${story.title}: people and places`}
        aside={
          characters.length + places.length + relatedStories.length > 0 ? (
            <>
              <RelatedFigures title="Characters" figures={characters} />
              <RelatedFigures title="Places" figures={places} />
              <RelatedFigures
                title="Related stories"
                figures={relatedStories}
              />
            </>
          ) : null
        }
      >
        <ArticleStack>
          <ArticleSection
            id="story-narrative"
            eyebrow="An editorial retelling"
            title="The story"
          >
            {story.fullNarrative ? (
              <ReadingProse markdown={story.fullNarrative} dropCap />
            ) : (
              <ReadingParagraph>{story.summary}</ReadingParagraph>
            )}

            <details className="group mt-10 border-y border-border/70 py-2">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 type-ui font-medium text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                <Headphones
                  className="size-4 text-gold-text"
                  aria-hidden="true"
                />
                Listen or change reading mode
              </summary>
              <div className="space-y-4 pb-3 pt-2">
                <StoryNarrator
                  text={story.fullNarrative || story.summary}
                  defaultCompact
                />
                <div className="flex flex-wrap gap-x-6 gap-y-1 type-ui">
                  {story.fullNarrative ? (
                    <Link
                      href={`/stories/${story.slug}/read`}
                      className="inline-flex min-h-11 items-center gap-2 text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
                    >
                      <ScrollText className="size-4" aria-hidden="true" />
                      Cinematic reading
                    </Link>
                  ) : null}
                  {CINEMATIC_STORIES.has(story.slug) ? (
                    <Link
                      href={`/stories/${story.slug}/cinematic`}
                      className="inline-flex min-h-11 items-center gap-2 text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
                    >
                      <Play className="size-4" aria-hidden="true" />
                      Scene-by-scene version
                    </Link>
                  ) : null}
                </div>
              </div>
            </details>
          </ArticleSection>

          {story.keyExcerpts ? (
            <ArticleSection id="highlights" title="Highlights">
              <ReadingParagraph>{story.keyExcerpts}</ReadingParagraph>
            </ArticleSection>
          ) : null}

          {story.culturalSignificance ? (
            <ArticleSection id="significance" title="Why it matters">
              <ReadingParagraph>{story.culturalSignificance}</ReadingParagraph>
            </ArticleSection>
          ) : null}

          {versions ? <VersionMatrix versions={versions} /> : null}

          {variants.length > 0 ? (
            <ArticleSection
              id="variants"
              title="Other versions"
              description={`${variants.length} alternate ${variants.length === 1 ? "account" : "accounts"} in the catalog.`}
            >
              <MythVariants variants={variants} />
            </ArticleSection>
          ) : null}

          {museumObjects.length > 0 ? (
            <ArticleSection
              id="in-art"
              title="The myth in art"
              description="Documented objects and later interpretations. Dates refer to the objects, not the events of the story."
              reading={false}
            >
              <MuseumGallery objects={museumObjects} intro={null} columns={2} />
            </ArticleSection>
          ) : null}

          <ArticleSection
            id="story-sources"
            title="Sources and further reading"
          >
            <div className="space-y-12">
              <EditorialByline />
              {hasSources ? (
                <EntitySources {...story} provenance={false} />
              ) : null}
            </div>
          </ArticleSection>
        </ArticleStack>
      </DetailLayout>
    </>
  );
}
