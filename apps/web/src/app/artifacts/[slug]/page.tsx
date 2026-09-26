import type { Metadata } from "next";
import { getIllustrativeImageNote } from "@/lib/image-provenance";
import { notFound, redirect } from "next/navigation";
import artifacts from "@/data/artifacts.json";
import deitiesData from "@/data/deities.json";
import pantheons from "@/data/pantheons.json";
import storiesData from "@/data/stories.json";
import { canonicalArtifactSlug } from "@/lib/artifact-aliases";
import {
  generateBaseMetadata,
  generateNotFoundMetadata,
  shortPantheonName,
} from "@/lib/metadata";
import { ArtifactJsonLd } from "@/components/seo/JsonLd";
import { citedWorksFor } from "@/lib/seo/cited-works";
import heroesData from "@/data/heroes.json";
import { EditorialByline } from "@/components/content/EditorialByline";
import {
  ArticleStack,
  FactLink,
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
  DetailHero,
  DetailLayout,
  FactList,
  RelatedFigures,
  type TocItem,
} from "@/components/layout/detail-layout";
import { ShareButton } from "@/components/sharing/ShareButton";
import {
  EntitySources,
  hasEntitySources,
} from "@/components/sources/EntitySources";
import { formatPantheonLabel } from "@/lib/deity-page";
import { getPantheonColor } from "@/lib/pantheon-colors";

interface ArtifactData {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  powers: string[];
  ownerId?: string;
  ownerKind?: "deity" | "hero";
  imageUrl?: string | null;
  origin?: string | null;
  currentLocation?: string | null;
  relatedStories?: string[];
  detailedBio?: string;
  primarySources?: Array<{ text: string; source: string; date?: string }>;
}

interface NamedRef {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string | null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Every valid param is prerendered by generateStaticParams; anything else is a
// 404 served from the static not-found page. (On-demand rendering of unknown
// params would cache HTML carrying one request's CSP nonce.)
export const dynamicParams = false;

// Generate static params for all artifacts
export async function generateStaticParams() {
  return artifacts.map((artifact) => ({
    slug: artifact.slug,
  }));
}

// Generate metadata for each artifact page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = canonicalArtifactSlug(rawSlug);
  const artifact = artifacts.find((a) => a.slug === slug) as
    ArtifactData | undefined;

  if (!artifact) {
    return generateNotFoundMetadata(
      "Artifact Not Found",
      "The requested artifact could not be found.",
    );
  }

  const pantheon = pantheons.find((p) => p.id === artifact.pantheonId);
  const pantheonName = shortPantheonName(pantheon);

  // Create a rich description
  const powers = artifact.powers?.slice(0, 3).join(", ") || "";
  const description =
    artifact.description?.slice(0, 160) ||
    `Learn about ${artifact.name}, a legendary ${artifact.type} from ${pantheonName} mythology. Powers: ${powers}.`;

  return generateBaseMetadata({
    title: `${artifact.name} - ${pantheonName} Artifact`,
    description: description,
    url: `/artifacts/${artifact.slug}`,
    // The generated opengraph-image card for this route supplies og:image.
    image: null,
    type: "article",
    keywords: [
      artifact.name,
      artifact.type,
      ...artifact.powers,
      pantheonName,
      "mythology",
      "artifact",
      "relic",
      "legendary weapon",
      "divine item",
    ],
    articleSection: "Arsenal",
    articleTags: artifact.powers,
  });
}

export default async function ArtifactPage({ params }: PageProps) {
  const { slug } = await params;
  const canonical = canonicalArtifactSlug(slug);
  if (canonical !== slug) {
    redirect(`/artifacts/${canonical}`);
  }

  const allArtifacts = artifacts as ArtifactData[];
  const artifact = allArtifacts.find((a) => a.slug === slug);
  if (!artifact) {
    notFound();
  }

  const ownerPool = (
    artifact.ownerKind === "hero" ? heroesData : deitiesData
  ) as NamedRef[];
  const owner = artifact.ownerId
    ? (ownerPool.find((entry) => entry.id === artifact.ownerId) ?? null)
    : null;
  const ownerHref = owner
    ? `/${artifact.ownerKind === "hero" ? "heroes" : "deities"}/${owner.slug}`
    : null;

  const relatedStories = (artifact.relatedStories ?? []).flatMap((id) => {
    const story = (
      storiesData as Array<{
        id: string;
        slug: string;
        title: string;
        category?: string;
        imageUrl?: string | null;
      }>
    ).find((s) => s.id === id);
    return story
      ? [
          {
            name: story.title,
            href: `/stories/${story.slug}`,
            imageUrl: story.imageUrl,
            meta: story.category,
          },
        ]
      : [];
  });
  const sameTradition = allArtifacts
    .filter((a) => a.pantheonId === artifact.pantheonId && a.id !== artifact.id)
    .slice(0, 4)
    .map((a) => ({
      name: a.name,
      href: `/artifacts/${a.slug}`,
      imageUrl: a.imageUrl,
      meta: a.type,
    }));

  const pantheon = pantheons.find((p) => p.id === artifact.pantheonId);
  const traditionName =
    pantheon?.name ?? formatPantheonLabel(artifact.pantheonId);

  const sourceFields = { primarySources: artifact.primarySources };
  const hasSources = hasEntitySources(sourceFields);
  const toc: TocItem[] = [
    { id: "about", label: `About ${artifact.name}` },
    ...(artifact.origin ? [{ id: "origin", label: "Origin" }] : []),
    ...(hasSources
      ? [{ id: "sources", label: "Sources and further reading" }]
      : []),
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
          label: "Type",
          value: <span className="capitalize">{artifact.type}</span>,
        },
        {
          label: "Wielded by",
          value:
            owner && ownerHref ? (
              <FactLink href={ownerHref}>{owner.name}</FactLink>
            ) : null,
        },
        { label: "Mythic location", value: artifact.currentLocation },
      ]}
    />
  );

  return (
    <>
      <ArtifactJsonLd
        name={artifact.name}
        description={artifact.description}
        url={`/artifacts/${artifact.slug}`}
        image={artifact.imageUrl || undefined}
        powers={artifact.powers}
        artifactType={artifact.type}
        tradition={shortPantheonName(pantheon)}
        citations={citedWorksFor(artifact)}
      />
      <DetailLayout
        hero={
          <DetailHero
            accentColor={getPantheonColor(artifact.pantheonId)}
            imageAspect="square"
            image={
              artifact.imageUrl
                ? { src: artifact.imageUrl, alt: artifact.name }
                : null
            }
            imageCaption={
              artifact.imageUrl ? (
                <IllustrativeImageCaption
                  note={getIllustrativeImageNote("artifact", artifact.id)}
                  subject={`Illustration of ${artifact.name}`}
                  tone="light"
                />
              ) : null
            }
            imageFallback={
              <span
                className="font-serif text-7xl text-gold/70"
                aria-hidden="true"
              >
                {artifact.name.charAt(0)}
              </span>
            }
            eyebrow={
              <>
                <span>{traditionName}</span>
                <span className="text-gold/50" aria-hidden="true">
                  ·
                </span>
                <span className="capitalize text-parchment/85">
                  {artifact.type}
                </span>
              </>
            }
            title={artifact.name}
            tags={artifact.powers}
            tagsLabel="Powers"
            lede={artifact.detailedBio ? <p>{artifact.description}</p> : null}
            actions={
              <ShareButton
                surface="artifact_page"
                title={`${artifact.name} - Mythos Atlas`}
                text={`Discover ${artifact.name}, a mythical ${artifact.type.toLowerCase()}, on Mythos Atlas`}
                url={`https://mythosatlas.com/artifacts/${artifact.slug}`}
                className={heroShareClass}
              />
            }
          />
        }
        facts={facts}
        toc={toc}
        asideLabel={`${artifact.name} at a glance`}
        aside={
          <>
            {owner && ownerHref ? (
              <RelatedFigures
                title="Wielder"
                figures={[
                  {
                    name: owner.name,
                    href: ownerHref,
                    imageUrl: owner.imageUrl,
                    meta: artifact.ownerKind === "hero" ? "Hero" : "Deity",
                  },
                ]}
              />
            ) : null}
            <RelatedFigures title="In the myths" figures={relatedStories} />
            <RelatedFigures
              title="More from this tradition"
              figures={sameTradition}
            />
          </>
        }
      >
        <ArticleStack>
          <ArticleSection id="about" title={`About ${artifact.name}`}>
            {artifact.detailedBio ? (
              <ReadingProse markdown={artifact.detailedBio} dropCap />
            ) : (
              <ReadingParagraph>{artifact.description}</ReadingParagraph>
            )}
          </ArticleSection>

          {artifact.origin ? (
            <ArticleSection id="origin" title="Origin">
              <ReadingParagraph>{artifact.origin}</ReadingParagraph>
            </ArticleSection>
          ) : null}

          {hasSources ? (
            <ArticleSection id="sources" title="Sources and further reading">
              <EntitySources {...sourceFields} />
            </ArticleSection>
          ) : null}

          <AboutThisPage title="About this entry" size={false}>
            <EditorialByline />
          </AboutThisPage>
        </ArticleStack>
      </DetailLayout>
    </>
  );
}
