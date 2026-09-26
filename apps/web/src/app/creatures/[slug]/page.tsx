import type { Metadata } from "next";
import { getIllustrativeImageNote } from "@/lib/image-provenance";
import { notFound, redirect } from "next/navigation";
import creatures from "@/data/creatures.json";
import deitiesData from "@/data/deities.json";
import pantheons from "@/data/pantheons.json";
import { canonicalCreatureSlug } from "@/lib/creature-aliases";
import {
  generateBaseMetadata,
  generateNotFoundMetadata,
  shortPantheonName,
} from "@/lib/metadata";
import { getMuseumObjectsFor } from "@/lib/museum";
import { CreatureJsonLd } from "@/components/seo/JsonLd";
import { citedWorksFor } from "@/lib/seo/cited-works";
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
  AsideLinks,
  DetailHero,
  DetailLayout,
  FactList,
  RelatedFigures,
  type TocItem,
} from "@/components/layout/detail-layout";
import { MuseumGallery } from "@/components/museum/MuseumGallery";
import { ShareButton } from "@/components/sharing/ShareButton";
import {
  EntitySources,
  hasEntitySources,
} from "@/components/sources/EntitySources";
import { formatPantheonLabel } from "@/lib/deity-page";
import { guidesFeaturing } from "@/lib/guides";
import { getPantheonColor } from "@/lib/pantheon-colors";

interface CreatureData {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  description: string;
  habitat: string;
  abilities: string[];
  dangerLevel: number;
  imageUrl?: string | null;
  detailedBio?: string;
  primarySources?: Array<{ text: string; source: string; date?: string }>;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Every valid param is prerendered by generateStaticParams; anything else is a
// 404 served from the static not-found page. (On-demand rendering of unknown
// params would cache HTML carrying one request's CSP nonce.)
export const dynamicParams = false;

// Generate static params for all creatures
export async function generateStaticParams() {
  return creatures.map((creature) => ({
    slug: creature.slug,
  }));
}

// Generate metadata for each creature page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = canonicalCreatureSlug(rawSlug);
  const creature = creatures.find((c) => c.slug === slug) as
    CreatureData | undefined;

  if (!creature) {
    return generateNotFoundMetadata(
      "Creature Not Found",
      "The requested creature could not be found.",
    );
  }

  const pantheon = pantheons.find((p) => p.id === creature.pantheonId);
  const pantheonName = shortPantheonName(pantheon);

  // Create a rich description
  const abilities = creature.abilities?.slice(0, 3).join(", ") || "";
  const description =
    creature.description?.slice(0, 160) ||
    `Learn about ${creature.name}, a mythological creature from ${pantheonName} mythology. Habitat: ${creature.habitat}. Abilities: ${abilities}.`;

  return generateBaseMetadata({
    title: `${creature.name} - ${pantheonName} Creature`,
    description: description,
    url: `/creatures/${creature.slug}`,
    // The generated opengraph-image card for this route supplies og:image.
    image: null,
    type: "article",
    keywords: [
      creature.name,
      creature.habitat,
      ...creature.abilities,
      pantheonName,
      "mythology",
      "creature",
      "monster",
      "beast",
      "bestiary",
    ],
    articleSection: "Bestiary",
    articleTags: creature.abilities,
  });
}

export default async function CreaturePage({ params }: PageProps) {
  const { slug } = await params;
  const canonical = canonicalCreatureSlug(slug);
  if (canonical !== slug) {
    redirect(`/creatures/${canonical}`);
  }

  const allCreatures = creatures as CreatureData[];
  const creature = allCreatures.find((c) => c.slug === slug);
  if (!creature) {
    notFound();
  }

  const pantheon = pantheons.find((p) => p.id === creature.pantheonId);
  const traditionName =
    pantheon?.name ?? formatPantheonLabel(creature.pantheonId);
  const museumObjects = getMuseumObjectsFor({ creature: slug });

  const sameTraditionCreatures = allCreatures
    .filter((c) => c.pantheonId === creature.pantheonId && c.id !== creature.id)
    .slice(0, 4)
    .map((c) => ({
      name: c.name,
      href: `/creatures/${c.slug}`,
      imageUrl: c.imageUrl,
      meta: c.habitat,
    }));
  const sameTraditionDeities = (
    deitiesData as Array<{
      id: string;
      slug: string;
      name: string;
      pantheonId: string;
      imageUrl?: string;
      domain?: string[];
    }>
  )
    .filter((d) => d.pantheonId === creature.pantheonId)
    .slice(0, 4)
    .map((d) => ({
      name: d.name,
      href: `/deities/${d.slug}`,
      imageUrl: d.imageUrl,
      meta: d.domain?.slice(0, 2).join(", "),
    }));
  const guides = guidesFeaturing("creature", creature.id);

  const sourceFields = { primarySources: creature.primarySources };
  const hasSources = hasEntitySources(sourceFields);

  const toc: TocItem[] = [
    { id: "about", label: `About ${creature.name}` },
    ...(museumObjects.length > 0 ? [{ id: "in-art", label: "In art" }] : []),
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
        { label: "Habitat", value: creature.habitat },
        {
          label: "Danger rating",
          value: (
            <span className="flex items-center gap-3">
              <span>{creature.dangerLevel} of 10</span>
              <span
                aria-hidden="true"
                className="h-1.5 w-20 overflow-hidden rounded-full bg-muted"
              >
                <span
                  className="block h-full rounded-full bg-gold"
                  style={{ width: `${creature.dangerLevel * 10}%` }}
                />
              </span>
            </span>
          ),
        },
      ]}
    />
  );

  return (
    <>
      <CreatureJsonLd
        name={creature.name}
        description={creature.description}
        url={`/creatures/${creature.slug}`}
        image={creature.imageUrl || undefined}
        abilities={creature.abilities}
        tradition={shortPantheonName(pantheon)}
        citations={citedWorksFor(creature)}
      />
      <DetailLayout
        hero={
          <DetailHero
            accentColor={getPantheonColor(creature.pantheonId)}
            imageAspect="square"
            image={
              creature.imageUrl
                ? { src: creature.imageUrl, alt: creature.name }
                : null
            }
            imageCaption={
              creature.imageUrl ? (
                <IllustrativeImageCaption
                  note={getIllustrativeImageNote("creature", creature.id)}
                  subject={`Illustration of ${creature.name}`}
                  tone="light"
                />
              ) : null
            }
            imageFallback={
              <span
                className="font-serif text-7xl text-gold/70"
                aria-hidden="true"
              >
                {creature.name.charAt(0)}
              </span>
            }
            eyebrow={
              <>
                <span>{traditionName}</span>
                <span className="text-gold/50" aria-hidden="true">
                  ·
                </span>
                <span className="text-parchment/85">Creature</span>
              </>
            }
            title={creature.name}
            tags={creature.abilities}
            tagsLabel="Abilities"
            lede={creature.detailedBio ? <p>{creature.description}</p> : null}
            actions={
              <ShareButton
                surface="creature_page"
                title={`${creature.name} - Mythos Atlas`}
                text={`Meet ${creature.name} in the Mythos Atlas bestiary`}
                url={`https://mythosatlas.com/creatures/${creature.slug}`}
                className={heroShareClass}
              />
            }
          />
        }
        facts={facts}
        toc={toc}
        asideLabel={`${creature.name} at a glance`}
        aside={
          <>
            <AsideLinks
              title="Featured in guides"
              links={guides.map((guide) => ({
                href: `/guides/${guide.slug}`,
                label: guide.title,
              }))}
            />
            <RelatedFigures
              title="More from this tradition"
              figures={sameTraditionCreatures}
            />
            <RelatedFigures
              title={`${shortPantheonName(pantheon)} gods`}
              figures={sameTraditionDeities}
            />
          </>
        }
      >
        <ArticleStack>
          <ArticleSection id="about" title={`About ${creature.name}`}>
            {creature.detailedBio ? (
              <ReadingProse markdown={creature.detailedBio} dropCap />
            ) : (
              <ReadingParagraph>{creature.description}</ReadingParagraph>
            )}
          </ArticleSection>

          {museumObjects.length > 0 ? (
            <ArticleSection
              id="in-art"
              eyebrow="In the museums"
              title={`${creature.name} in art`}
              reading={false}
            >
              <MuseumGallery objects={museumObjects} />
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
              The danger rating is an editorial shorthand for how the myths
              portray the creature, not a claim made by the sources.
            </p>
          </AboutThisPage>
        </ArticleStack>
      </DetailLayout>
    </>
  );
}
