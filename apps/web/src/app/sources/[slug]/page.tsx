import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import sources from "@/data/sources.json";
import deities from "@/data/deities.json";
import heroes from "@/data/heroes.json";
import storiesData from "@/data/stories.json";
import { EditorialByline } from "@/components/content/EditorialByline";
import {
  ArticleStack,
  heroIconButtonClass,
  heroShareClass,
} from "@/components/content/detail-parts";
import { ReadingParagraph } from "@/components/content/reading-prose";
import { AboutThisPage } from "@/components/layout/about-this-page";
import {
  ArticleSection,
  DetailHero,
  DetailLayout,
  FactList,
  type TocItem,
} from "@/components/layout/detail-layout";
import { EntityList } from "@/components/layout/entity-gallery";
import { generateBaseMetadata, generateNotFoundMetadata } from "@/lib/metadata";
import { matchesSource } from "@/lib/source-matching";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { ShareButton } from "@/components/sharing/ShareButton";
import { SourceExcerpt } from "@/components/sources/SourceExcerpt";
import { SourceWorkJsonLd } from "@/components/seo/JsonLd";

interface SourceCharacter {
  id: string;
  kind: "deity" | "hero";
  role: string;
  where: string;
}

interface SourceKeyScene {
  title: string;
  where: string;
  summary: string;
}

interface Source {
  id: string;
  title: string;
  author?: string;
  year?: string | number;
  type: string;
  language?: string;
  description: string;
  translators?: Array<{ name: string; year: number }>;
  externalUrl?: string;
  characters?: SourceCharacter[];
  keyScenes?: SourceKeyScene[];
  readingOrder?: string;
}

interface SourceExcerptRecord {
  text: string;
  translation: string;
  source: string;
  sourceId?: string;
  lineNumbers?: string;
  translator?: string;
  originalLanguage?: string;
  quoteStatus: "direct-quotation" | "editorial-paraphrase" | "unverified";
  verification: "verified" | "source-and-locator-verified" | "not-verified";
  sourceUrl: string;
  edition: string;
}

interface Deity {
  id: string;
  name: string;
  slug: string;
  primarySourceExcerpts?: SourceExcerptRecord[];
}

interface Story {
  id: string;
  title: string;
  slug: string;
  imageUrl?: string | null;
  category?: string;
  summary?: string;
  description?: string;
  citationSources?: Array<{
    title?: string;
    source?: string;
    sourceId?: string;
  }>;
  primarySourceExcerpts?: SourceExcerptRecord[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

function resolveSource(slug: string): Source | undefined {
  return (sources as Source[]).find((s) => s.id === slug);
}

// Every valid param is prerendered by generateStaticParams; anything else is a
// 404 served from the static not-found page. (On-demand rendering of unknown
// params would cache HTML carrying one request's CSP nonce.)
export const dynamicParams = false;

export async function generateStaticParams() {
  return (sources as Source[]).map((source) => ({ slug: source.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const source = resolveSource(slug);

  if (!source) {
    return generateNotFoundMetadata(
      "Source Not Found",
      "The requested source could not be found.",
    );
  }

  return generateBaseMetadata({
    title: `${source.title} - Source & Reference`,
    description: source.description.slice(0, 160),
    url: `/sources/${source.id}`,
    keywords: [source.title, source.author ?? "", "mythology source"].filter(
      Boolean,
    ),
    articleSection: "Sources",
  });
}

const TYPE_LABEL: Record<string, string> = {
  "ancient-text": "Ancient text",
  translation: "Translation",
  academic: "Scholarship",
};

/** A typographic title plate for a text (works have no portrait). */
function TitlePlate({ source }: { source: Source }) {
  return (
    <div className="mx-auto w-full max-w-[15rem] md:max-w-none">
      <div className="relative flex aspect-4/5 flex-col items-center justify-center overflow-hidden rounded-md bg-linear-to-b from-midnight-light to-midnight px-6 text-center shadow-2xl shadow-black/50 ring-1 ring-gold/30">
        <div
          className="absolute inset-3 rounded-sm border border-gold/25"
          aria-hidden="true"
        />
        <p className="type-eyebrow text-gold-light">
          {TYPE_LABEL[source.type] ?? source.type}
        </p>
        <p className="mt-5 font-serif text-3xl leading-tight text-parchment text-balance lg:text-4xl">
          {source.title}
        </p>
        <div className="mt-5 flex items-center gap-3" aria-hidden="true">
          <span className="h-px w-8 bg-gold/50" />
          <span className="size-1.5 rotate-45 bg-gold" />
          <span className="h-px w-8 bg-gold/50" />
        </div>
        {source.author ? (
          <p className="mt-5 font-body text-lg text-parchment/85">
            {source.author}
          </p>
        ) : null}
        {source.year ? (
          <p className="mt-1 type-meta text-parchment/65">{source.year}</p>
        ) : null}
      </div>
    </div>
  );
}

export default async function SourcePage({ params }: PageProps) {
  const { slug } = await params;
  const source = resolveSource(slug);

  if (!source) {
    notFound();
  }

  const allStories = storiesData as Story[];
  const allDeities = deities as Deity[];

  const heroById = (id: string) => heroes.find((h) => h.id === id);
  const deityById = (id: string) => deities.find((d) => d.id === id);

  const figureItems = (kind: "hero" | "deity") =>
    (source.characters ?? [])
      .filter((character) => character.kind === kind)
      .flatMap((character) => {
        const figure =
          kind === "hero" ? heroById(character.id) : deityById(character.id);
        return figure
          ? [
              {
                name: figure.name,
                href: `/${kind === "hero" ? "heroes" : "deities"}/${figure.slug}`,
                imageUrl: figure.imageUrl,
                meta: character.where,
                description: character.role,
              },
            ]
          : [];
      });
  const heroFigures = figureItems("hero");
  const deityFigures = figureItems("deity");

  // Passages quoted from this work on story and deity pages.
  const sourceExcerpts: Array<
    SourceExcerptRecord & {
      entityTitle: string;
      entitySlug: string;
      entityType: "story" | "deity";
    }
  > = [];
  for (const story of allStories) {
    for (const excerpt of story.primarySourceExcerpts ?? []) {
      if (matchesSource(excerpt, source)) {
        sourceExcerpts.push({
          ...excerpt,
          entityTitle: story.title,
          entitySlug: story.slug,
          entityType: "story",
        });
      }
    }
  }
  for (const deity of allDeities) {
    for (const excerpt of deity.primarySourceExcerpts ?? []) {
      if (matchesSource(excerpt, source)) {
        sourceExcerpts.push({
          ...excerpt,
          entityTitle: deity.name,
          entitySlug: deity.slug,
          entityType: "deity",
        });
      }
    }
  }

  const linkedStories = allStories.filter((story) => {
    const hasExcerpt = story.primarySourceExcerpts?.some((excerpt) =>
      matchesSource(excerpt, source),
    );
    return (
      hasExcerpt ||
      story.citationSources?.some((citation) => matchesSource(citation, source))
    );
  });

  const characterLinks = [...heroFigures, ...deityFigures].map((item) => ({
    name: item.name,
    url: item.href,
  }));
  const typeLabel = TYPE_LABEL[source.type] ?? source.type;

  const toc: TocItem[] = [
    { id: "about", label: "About this work" },
    ...(heroFigures.length + deityFigures.length > 0
      ? [{ id: "figures", label: "Figures in the text" }]
      : []),
    ...(source.keyScenes?.length
      ? [{ id: "scenes", label: "Key scenes" }]
      : []),
    ...(sourceExcerpts.length > 0
      ? [{ id: "passages", label: "Passages" }]
      : []),
    ...(linkedStories.length > 0
      ? [{ id: "stories", label: "Stories drawn from it" }]
      : []),
  ];

  const facts = (
    <FactList
      facts={[
        { label: "Author", value: source.author },
        { label: "Date", value: source.year ? String(source.year) : null },
        { label: "Language", value: source.language },
        { label: "Kind", value: typeLabel },
        {
          label: "Translations",
          value: source.translators?.length ? (
            <ul className="space-y-0.5">
              {source.translators.map((translator) => (
                <li key={translator.name}>
                  {translator.name} ({translator.year})
                </li>
              ))}
            </ul>
          ) : null,
        },
      ]}
    />
  );

  return (
    <>
      <SourceWorkJsonLd
        title={source.title}
        description={source.description}
        url={`/sources/${source.id}`}
        author={source.author}
        language={source.language}
        translators={source.translators?.map((t) => t.name)}
        characters={characterLinks}
      />
      <DetailLayout
        hero={
          <DetailHero
            media={<TitlePlate source={source} />}
            eyebrow={
              <>
                <span>Source record</span>
                <span className="text-gold/50" aria-hidden="true">
                  ·
                </span>
                <span className="text-parchment/85">{typeLabel}</span>
              </>
            }
            title={source.title}
            nativeName={
              [source.author, source.year, source.language]
                .filter(Boolean)
                .join(" · ") || null
            }
            lede={<p>{source.description}</p>}
            actions={
              <>
                {source.externalUrl ? (
                  <a
                    href={source.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Read ${source.title} online (opens in new tab)`}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-gold px-5 text-[0.9375rem] font-semibold text-midnight transition-colors hover:bg-gold-light"
                  >
                    Read online
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                ) : null}
                <BookmarkButton
                  type="source"
                  id={source.id}
                  size="md"
                  variant="light"
                  className={heroIconButtonClass}
                />
                <ShareButton
                  surface="source_page"
                  title={`${source.title} - Mythos Atlas`}
                  text={`${source.title}${source.author ? ` by ${source.author}` : ""}: passages, characters and linked myths on Mythos Atlas`}
                  url={`https://mythosatlas.com/sources/${source.id}`}
                  className={heroShareClass}
                />
              </>
            }
          />
        }
        facts={facts}
        toc={toc}
        asideLabel={`${source.title} at a glance`}
      >
        <ArticleStack>
          <ArticleSection id="about" title="About this work">
            <ReadingParagraph>{source.description}</ReadingParagraph>
            {source.readingOrder ? (
              <div className="mt-10">
                <h3 className="type-h3 text-foreground">Where to start</h3>
                <ReadingParagraph className="mt-3">
                  {source.readingOrder}
                </ReadingParagraph>
              </div>
            ) : null}
          </ArticleSection>

          {heroFigures.length + deityFigures.length > 0 ? (
            <ArticleSection
              id="figures"
              title="Figures in the text"
              description="Heroes and divinities who feature prominently, with where they appear."
              reading={false}
            >
              <div className="space-y-10">
                {heroFigures.length > 0 ? (
                  <div>
                    <h3 className="type-h3 mb-3 text-foreground">
                      Heroes and mortals
                    </h3>
                    <EntityList columns={2} items={heroFigures} />
                  </div>
                ) : null}
                {deityFigures.length > 0 ? (
                  <div>
                    <h3 className="type-h3 mb-3 text-foreground">
                      Deities and immortals
                    </h3>
                    <EntityList columns={2} items={deityFigures} />
                  </div>
                ) : null}
              </div>
            </ArticleSection>
          ) : null}

          {source.keyScenes?.length ? (
            <ArticleSection
              id="scenes"
              title="Key scenes"
              description="Turning points of the work, in reading order."
            >
              <ol className="divide-y divide-border/70 border-y border-border/70">
                {source.keyScenes.map((scene, index) => (
                  <li
                    key={scene.title}
                    className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-2 py-4"
                  >
                    <span
                      aria-hidden="true"
                      className="pt-0.5 font-serif text-[0.9375rem] font-semibold tabular-nums text-gold-text"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-serif text-[1.125rem] font-semibold leading-snug text-foreground">
                        {scene.title}
                      </h3>
                      <p className="mt-0.5 type-meta text-muted-foreground">
                        {scene.where}
                      </p>
                      <p className="mt-2 type-reading text-foreground/90">
                        {scene.summary}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </ArticleSection>
          ) : null}

          {sourceExcerpts.length > 0 ? (
            <ArticleSection
              id="passages"
              title="Passages"
              description="Direct quotations are distinguished from editorial paraphrases and records awaiting verification."
            >
              <div className="divide-y divide-border/70 border-y border-border/70">
                {sourceExcerpts.map((excerpt, index) => (
                  <div key={`${excerpt.entitySlug}-${index}`} className="pb-4">
                    <SourceExcerpt excerpt={excerpt} className="pb-2" />
                    <Link
                      href={`/${excerpt.entityType === "story" ? "stories" : "deities"}/${excerpt.entitySlug}`}
                      className="inline-flex min-h-10 items-center type-ui text-gold-text underline decoration-gold/40 underline-offset-4 hover:decoration-current"
                    >
                      Featured in {excerpt.entityTitle} &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            </ArticleSection>
          ) : null}

          {linkedStories.length > 0 ? (
            <ArticleSection
              id="stories"
              title="Stories drawn from it"
              description="Retellings in the atlas that quote or cite this work."
              reading={false}
            >
              <EntityList
                columns={2}
                items={linkedStories.map((story) => ({
                  name: story.title,
                  href: `/stories/${story.slug}`,
                  imageUrl: story.imageUrl,
                  meta: story.category,
                  description: story.summary || story.description,
                }))}
              />
            </ArticleSection>
          ) : null}

          <AboutThisPage title="About this record" size={false}>
            <EditorialByline />
            <p>
              Dates and authorship follow standard scholarly references; for
              many ancient works both are approximate or disputed.
            </p>
          </AboutThisPage>
        </ArticleStack>
      </DetailLayout>
    </>
  );
}
