import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EditorialByline } from "@/components/content/EditorialByline";
import {
  ArticleStack,
  heroShareClass,
} from "@/components/content/detail-parts";
import { AboutThisPage } from "@/components/layout/about-this-page";
import {
  ArticleSection,
  AsideLinks,
  DetailHero,
  DetailLayout,
  FactList,
  type TocItem,
} from "@/components/layout/detail-layout";
import { EntityList } from "@/components/layout/entity-gallery";
import { ParallelFigures } from "@/components/mythology/ParallelFigures";
import { ItemListJsonLd } from "@/components/seo/JsonLd";
import { ShareButton } from "@/components/sharing/ShareButton";
import collections from "@/data/collections.json";
import pantheons from "@/data/pantheons.json";
import { getDeities, getStories } from "@/lib/data/catalog";
import { formatPantheonLabel } from "@/lib/deity-page";
import { generateBaseMetadata, generateNotFoundMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Every valid param is prerendered by generateStaticParams; anything else is a
// 404 served from the static not-found page. (On-demand rendering of unknown
// params would cache HTML carrying one request's CSP nonce.)
export const dynamicParams = false;

export async function generateStaticParams() {
  return collections.map((collection) => ({
    slug: collection.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = collections.find((c) => c.slug === slug);

  if (!collection) {
    return generateNotFoundMetadata(
      "Collection Not Found",
      "The requested collection could not be found.",
    );
  }

  return generateBaseMetadata({
    title: `${collection.name} Collection`,
    description:
      `${collection.description} See related deities, myths, and themes in this Mythos Atlas guide.`.slice(
        0,
        158,
      ),
    url: `/collections/${slug}`,
    keywords: [
      collection.name,
      "mythology",
      "deities",
      "myths",
      collection.theme,
    ],
  });
}

/** First sentence of a description, for compact annotations. */
function firstSentence(text: string | null | undefined): string | undefined {
  if (!text) return undefined;
  const match = text.match(/^.+?[.!?](?=\s|$)/);
  return (match?.[0] ?? text).trim();
}

/** Four portraits of the collection's figures, for the hero. */
function PortraitMosaic({
  figures,
}: {
  figures: Array<{ name: string; imageUrl?: string | null }>;
}) {
  const shown = figures.filter((f) => f.imageUrl).slice(0, 4);
  if (shown.length === 0) return null;
  return (
    <div
      className="mx-auto grid w-full max-w-[18rem] grid-cols-2 gap-2 md:max-w-none"
      aria-hidden="true"
    >
      {shown.map((figure, index) => (
        <div
          key={figure.name}
          className={
            "relative aspect-4/5 overflow-hidden rounded-md bg-midnight-light shadow-xl shadow-black/40 ring-1 ring-gold/25" +
            (index % 2 === 1 ? " md:translate-y-6" : "")
          }
        >
          <Image
            src={figure.imageUrl as string}
            alt=""
            fill
            priority={index < 2}
            sizes="(min-width: 1024px) 14rem, (min-width: 768px) 10rem, 9rem"
            className="object-cover object-top"
          />
        </div>
      ))}
    </div>
  );
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = collections.find((c) => c.slug === slug);

  if (!collection) {
    notFound();
  }

  const deities = getDeities();
  const stories = getStories();
  const collectionDeities = collection.deities.flatMap((id) => {
    const deity = deities.find((d) => d.id === id || d.slug === id);
    return deity ? [deity] : [];
  });
  const collectionStories = collection.stories.flatMap((id) => {
    const story = stories.find((s) => s.id === id || s.slug === id);
    return story ? [story] : [];
  });

  const pantheonName = (id: string) =>
    pantheons.find((p) => p.id === id)?.name ?? formatPantheonLabel(id);
  const traditions = [
    ...new Set(
      collectionDeities.map((deity) => pantheonName(deity.pantheonId)),
    ),
  ];

  const listItems = [
    ...collectionDeities.map((deity, index) => ({
      name: deity.name,
      url: `/deities/${deity.slug}`,
      position: index + 1,
    })),
    ...collectionStories.map((story, index) => ({
      name: story.title,
      url: `/stories/${story.slug}`,
      position: collectionDeities.length + index + 1,
    })),
  ];

  const toc: TocItem[] = [
    ...(collectionDeities.length > 0
      ? [{ id: "figures", label: "The figures" }]
      : []),
    ...(collectionStories.length > 0
      ? [{ id: "stories", label: "The stories" }]
      : []),
  ];

  const facts = (
    <FactList
      facts={[
        {
          label: "Theme",
          value: <span className="capitalize">{collection.theme}</span>,
        },
        {
          label: "Figures",
          value: collectionDeities.length
            ? String(collectionDeities.length)
            : null,
        },
        {
          label: "Stories",
          value: collectionStories.length
            ? String(collectionStories.length)
            : null,
        },
        {
          label: traditions.length === 1 ? "Tradition" : "Traditions",
          value: traditions.length ? traditions.join(", ") : null,
        },
      ]}
    />
  );

  const otherCollections = collections
    .filter((other) => other.slug !== collection.slug)
    .slice(0, 6)
    .map((other) => ({
      href: `/collections/${other.slug}`,
      label: other.name,
      meta: `${other.deities.length} figures · ${other.stories.length} stories`,
    }));

  return (
    <>
      <ItemListJsonLd
        name={`${collection.name} Collection`}
        description={collection.description}
        url={`/collections/${slug}`}
        items={listItems}
      />
      <DetailLayout
        hero={
          <DetailHero
            media={<PortraitMosaic figures={collectionDeities} />}
            eyebrow={
              <>
                <span>Collection</span>
                <span className="text-gold/50" aria-hidden="true">
                  ·
                </span>
                <span className="capitalize text-parchment/85">
                  {collection.theme}
                </span>
              </>
            }
            title={collection.name}
            lede={<p>{collection.description}</p>}
            actions={
              <ShareButton
                surface="collection_page"
                title={`${collection.name} - Mythos Atlas`}
                text={collection.description}
                url={`https://mythosatlas.com/collections/${collection.slug}`}
                className={heroShareClass}
              />
            }
          />
        }
        facts={facts}
        toc={toc}
        asideLabel={`${collection.name} at a glance`}
        aside={<AsideLinks title="More collections" links={otherCollections} />}
      >
        <ArticleStack>
          {collectionDeities.length > 0 ? (
            <ArticleSection
              id="figures"
              eyebrow="Across traditions"
              title="The figures"
              description="They share a theme; their roles, beliefs and histories differ from one tradition to the next."
              reading={false}
            >
              <ParallelFigures
                label={`${collection.name} across pantheons`}
                figures={collectionDeities.map((deity) => ({
                  name: deity.name,
                  href: `/deities/${deity.slug}`,
                  pantheonId: deity.pantheonId,
                  traditionLabel: pantheonName(deity.pantheonId),
                  imageUrl: deity.imageUrl,
                  note: firstSentence(deity.description),
                }))}
              />
            </ArticleSection>
          ) : null}

          {collectionStories.length > 0 ? (
            <ArticleSection id="stories" title="The stories" reading={false}>
              <EntityList
                columns={2}
                items={collectionStories.map((story) => ({
                  name: story.title,
                  href: `/stories/${story.slug}`,
                  imageUrl: story.imageUrl,
                  pantheonId: story.pantheonId,
                  meta: pantheonName(story.pantheonId),
                  description: story.summary,
                }))}
              />
            </ArticleSection>
          ) : null}

          {collectionDeities.length === 0 && collectionStories.length === 0 ? (
            <p className="type-reading text-muted-foreground">
              This collection is being curated.
            </p>
          ) : null}

          <AboutThisPage title="About this collection" size={false}>
            <EditorialByline />
            <p>
              Collections group figures and myths by a shared theme. A shared
              theme is an editorial lens, not evidence that the traditions
              borrowed from one another.
            </p>
          </AboutThisPage>
        </ArticleStack>
      </DetailLayout>
    </>
  );
}
