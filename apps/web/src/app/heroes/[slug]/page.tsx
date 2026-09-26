import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EditorialByline } from "@/components/content/EditorialByline";
import {
  ArticleStack,
  FactLink,
  MuseumPortraitCaption,
  NumberedList,
  heroIconButtonClass,
  heroShareClass,
} from "@/components/content/detail-parts";
import { IllustrativeImageCaption } from "@/components/content/IllustrativeImageCaption";
import {
  ReadingParagraph,
  ReadingProse,
} from "@/components/content/reading-prose";
import { AboutThisPage } from "@/components/layout/about-this-page";
import {
  ArticleSection,
  AsideLinks,
  DetailHero,
  DetailLayout,
  FactList,
  RelatedFigures,
  type TocItem,
} from "@/components/layout/detail-layout";
import { MuseumGallery } from "@/components/museum/MuseumGallery";
import { ParallelFigures } from "@/components/mythology/ParallelFigures";
import { HeroJsonLd } from "@/components/seo/JsonLd";
import { ShareButton } from "@/components/sharing/ShareButton";
import {
  EntitySources,
  hasEntitySources,
} from "@/components/sources/EntitySources";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { PronunciationDisplay } from "@/components/ui/pronunciation";
import pantheons from "@/data/pantheons.json";
import { getDeities, getHeroes } from "@/lib/data/catalog";
import { normalizeDeityReference } from "@/lib/deity-reference";
import { formatPantheonLabel, formatSlugAsTitle } from "@/lib/deity-page";
import { guidesFeaturing } from "@/lib/guides";
import { findHeroByReference } from "@/lib/heroes";
import { getIllustrativeImageNote } from "@/lib/image-provenance";
import {
  generateBaseMetadata,
  generateNotFoundMetadata,
  shortPantheonName,
} from "@/lib/metadata";
import { getMuseumObjectsFor, getMuseumPortrait } from "@/lib/museum";
import { readableParallelNote } from "@/lib/parallel-notes";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { citedWorksFor } from "@/lib/seo/cited-works";

interface HeroRecord {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  alternateNames?: string[];
  description: string;
  detailedBio?: string;
  parentage?: {
    divineParentId?: string;
    divineParentName?: string;
    mortalParentName?: string;
    note?: string;
  };
  keyDeeds?: string[];
  fate?: string;
  relatedDeityIds?: string[];
  imageUrl?: string | null;
  pronunciation?: { ipa: string; phonetic: string };
  primarySources?: Array<{ text: string; source: string; date?: string }>;
  crossPantheonParallels?: Array<{
    pantheonId: string;
    refId: string;
    kind: "hero" | "deity";
    note: string;
  }>;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

function heroRecords(): HeroRecord[] {
  return getHeroes() as unknown as HeroRecord[];
}

function resolveHeroBySlug(slug: string): HeroRecord | undefined {
  const ref = findHeroByReference(slug) as { id: string } | undefined;
  return ref ? heroRecords().find((hero) => hero.id === ref.id) : undefined;
}

// Every valid param is prerendered by generateStaticParams; anything else is a
// 404 served from the static not-found page. (On-demand rendering of unknown
// params would cache HTML carrying one request's CSP nonce.) Alias URLs (ids,
// alternate names, other casings) are redirected by src/proxy.ts.
export const dynamicParams = false;

export async function generateStaticParams() {
  return heroRecords().map((hero) => ({ slug: hero.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const hero = resolveHeroBySlug(slug);

  if (!hero) {
    return generateNotFoundMetadata(
      "Hero Not Found",
      "The requested hero could not be found.",
    );
  }

  const pantheon = pantheons.find((p) => p.id === hero.pantheonId);
  const pantheonName = shortPantheonName(pantheon);

  const baseDescription =
    hero.description ||
    `Explore ${hero.name}, a hero of ${pantheonName} mythology.`;
  const description =
    baseDescription.length < 140
      ? `${baseDescription} Explore mythology, key deeds, and sources in Mythos Atlas.`
      : baseDescription;

  return generateBaseMetadata({
    title: `${hero.name} - Hero of ${pantheonName} Mythology`,
    description: description.slice(0, 160),
    url: `/heroes/${hero.slug}`,
    // The generated opengraph-image card for this route supplies og:image.
    image: null,
    type: "article",
    keywords: [
      hero.name,
      ...(hero.alternateNames || []),
      pantheonName,
      "mythology",
      "hero",
      "legend",
    ],
    articleSection: "Heroes",
  });
}

export default async function HeroPage({ params }: PageProps) {
  const { slug } = await params;

  const hero = resolveHeroBySlug(slug);
  if (!hero) {
    notFound();
  }

  if (hero.slug !== slug) {
    redirect(`/heroes/${hero.slug}`);
  }

  const allHeroes = heroRecords();
  const deities = getDeities();
  const pantheon = pantheons.find((p) => p.id === hero.pantheonId);
  const traditionName = pantheon?.name ?? formatPantheonLabel(hero.pantheonId);

  const deityById = (id: string) =>
    deities.find(
      (d) => normalizeDeityReference(d.id) === normalizeDeityReference(id),
    );
  const heroById = (id: string) =>
    allHeroes.find(
      (h) => normalizeDeityReference(h.id) === normalizeDeityReference(id),
    );

  const museumObjects = getMuseumObjectsFor({ hero: hero.slug });
  const museumPortrait = getMuseumPortrait(museumObjects);
  const galleryObjects = museumObjects.filter(
    (object) => object.id !== museumPortrait?.id,
  );

  const divineParent = hero.parentage?.divineParentId
    ? deityById(hero.parentage.divineParentId)
    : undefined;

  const parallels = (hero.crossPantheonParallels ?? []).map((parallel) => {
    const target =
      parallel.kind === "hero"
        ? heroById(parallel.refId)
        : deityById(parallel.refId);
    return {
      name: target?.name ?? formatSlugAsTitle(parallel.refId),
      href: target
        ? `/${parallel.kind === "hero" ? "heroes" : "deities"}/${target.slug}`
        : null,
      pantheonId: parallel.pantheonId,
      traditionLabel:
        pantheons.find((p) => p.id === parallel.pantheonId)?.name ??
        formatPantheonLabel(parallel.pantheonId),
      imageUrl: (target as { imageUrl?: string | null } | undefined)?.imageUrl,
      note: readableParallelNote(parallel.note),
    };
  });

  const relatedDeities = (hero.relatedDeityIds ?? []).flatMap((id) => {
    const deity = deityById(id);
    return deity
      ? [
          {
            name: deity.name,
            href: `/deities/${deity.slug}`,
            imageUrl: deity.imageUrl,
            meta: deity.domain?.slice(0, 2).join(", "),
          },
        ]
      : [];
  });
  const sameTradition = allHeroes
    .filter((h) => h.pantheonId === hero.pantheonId && h.id !== hero.id)
    .slice(0, 4)
    .map((h) => ({
      name: h.name,
      href: `/heroes/${h.slug}`,
      imageUrl: h.imageUrl,
      meta: "Hero",
    }));
  const guides = guidesFeaturing("hero", hero.id);

  const sourceFields = {
    primarySources: hero.primarySources,
    appearsIn: { id: hero.id, kind: "hero" as const },
  };
  const hasSources = hasEntitySources(sourceFields);

  const toc: TocItem[] = [
    { id: "about", label: `About ${hero.name}` },
    ...(hero.keyDeeds?.length ? [{ id: "deeds", label: "Key deeds" }] : []),
    ...(hero.fate ? [{ id: "fate", label: "Fate" }] : []),
    ...(parallels.length > 0
      ? [{ id: "parallels", label: "Across traditions" }]
      : []),
    ...(galleryObjects.length > 0 ? [{ id: "in-art", label: "In art" }] : []),
    ...(hasSources
      ? [{ id: "sources", label: "Sources and further reading" }]
      : []),
  ];

  const image = museumPortrait?.imageUrl
    ? {
        src: museumPortrait.imageUrl,
        alt: museumPortrait.imageAlt || museumPortrait.title,
        unoptimized: true,
        fit: "contain" as const,
      }
    : hero.imageUrl
      ? { src: hero.imageUrl, alt: hero.name }
      : null;

  const parentage = hero.parentage;
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
          label: "Divine parent",
          value: divineParent ? (
            <FactLink href={`/deities/${divineParent.slug}`}>
              {divineParent.name}
            </FactLink>
          ) : (
            parentage?.divineParentName
          ),
        },
        { label: "Mortal parent", value: parentage?.mortalParentName },
      ]}
    />
  );

  return (
    <>
      <HeroJsonLd
        name={hero.name}
        description={
          hero.description || `${hero.name}, a hero of ancient mythology`
        }
        alternateNames={hero.alternateNames}
        url={`/heroes/${hero.slug}`}
        image={hero.imageUrl || undefined}
        tradition={shortPantheonName(pantheon)}
        citations={citedWorksFor(hero)}
      />
      <DetailLayout
        hero={
          <DetailHero
            accentColor={getPantheonColor(hero.pantheonId)}
            image={image}
            imageCaption={
              museumPortrait ? (
                <MuseumPortraitCaption object={museumPortrait} />
              ) : (
                <IllustrativeImageCaption
                  note={getIllustrativeImageNote("hero", hero.id)}
                  subject={`Illustration of ${hero.name}`}
                  tone="light"
                />
              )
            }
            imageFallback={
              <span
                className="font-serif text-7xl text-gold/70"
                aria-hidden="true"
              >
                {hero.name.charAt(0)}
              </span>
            }
            eyebrow={
              <>
                <span>{traditionName}</span>
                <span className="text-gold/50" aria-hidden="true">
                  ·
                </span>
                <span className="text-parchment/85">Hero</span>
              </>
            }
            title={hero.name}
            titleAddon={
              hero.pronunciation ? (
                <PronunciationDisplay
                  pronunciation={hero.pronunciation}
                  className="text-parchment/75 hover:text-parchment"
                />
              ) : null
            }
            epithets={hero.alternateNames}
            lede={hero.description ? <p>{hero.description}</p> : null}
            actions={
              <>
                <BookmarkButton
                  type="hero"
                  id={hero.id}
                  size="md"
                  variant="light"
                  className={heroIconButtonClass}
                />
                <ShareButton
                  surface="hero_page"
                  title={`${hero.name} - Mythos Atlas`}
                  text={`Read about ${hero.name}, a hero of ${traditionName} mythology, on Mythos Atlas`}
                  url={`https://mythosatlas.com/heroes/${hero.slug}`}
                  className={heroShareClass}
                />
              </>
            }
          />
        }
        facts={facts}
        toc={toc}
        asideLabel={`${hero.name} at a glance`}
        aside={
          <>
            <RelatedFigures
              title="Gods in the story"
              figures={relatedDeities}
            />
            <AsideLinks
              title="Featured in guides"
              links={guides.map((guide) => ({
                href: `/guides/${guide.slug}`,
                label: guide.title,
              }))}
            />
            <RelatedFigures
              title={`More ${shortPantheonName(pantheon)} heroes`}
              figures={sameTradition}
            />
          </>
        }
      >
        <ArticleStack>
          <ArticleSection id="about" title={`About ${hero.name}`}>
            {hero.detailedBio ? (
              <ReadingProse markdown={hero.detailedBio} dropCap />
            ) : (
              <ReadingParagraph>{hero.description}</ReadingParagraph>
            )}
            {parentage?.note ? (
              <p className="mt-8 border-t border-border/70 pt-4 type-ui text-muted-foreground">
                <span className="font-medium text-foreground">
                  On parentage:{" "}
                </span>
                {parentage.note}
              </p>
            ) : null}
          </ArticleSection>

          {hero.keyDeeds?.length ? (
            <ArticleSection id="deeds" title="Key deeds">
              <NumberedList items={hero.keyDeeds} />
            </ArticleSection>
          ) : null}

          {hero.fate ? (
            <ArticleSection id="fate" title="Fate">
              <ReadingParagraph>{hero.fate}</ReadingParagraph>
            </ArticleSection>
          ) : null}

          {parallels.length > 0 ? (
            <ArticleSection
              id="parallels"
              eyebrow="Across traditions"
              title="Parallel figures"
              description={`Heroes and gods who play a part like ${hero.name}'s in other traditions.`}
              reading={false}
            >
              <ParallelFigures
                label={`${hero.name} across pantheons`}
                figures={parallels}
              />
            </ArticleSection>
          ) : null}

          {galleryObjects.length > 0 ? (
            <ArticleSection
              id="in-art"
              eyebrow="In the museums"
              title={`${hero.name} in art`}
              reading={false}
            >
              <MuseumGallery objects={galleryObjects} />
            </ArticleSection>
          ) : null}

          {hasSources ? (
            <ArticleSection id="sources" title="Sources and further reading">
              <EntitySources {...sourceFields} />
            </ArticleSection>
          ) : null}

          <AboutThisPage title="About this entry" size={false}>
            <EditorialByline />
            <p>
              Hero legends were retold for centuries, and the sources often
              disagree on parentage, deeds and death. This entry follows the
              best-known versions and notes the main alternatives.
            </p>
          </AboutThisPage>
        </ArticleStack>
      </DetailLayout>
    </>
  );
}
