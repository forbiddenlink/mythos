import type { Metadata } from "next";
import { getIllustrativeImageNote } from "@/lib/image-provenance";
import { notFound, redirect } from "next/navigation";
import locations from "@/data/locations.json";
import pantheons from "@/data/pantheons.json";
import { canonicalLocationSlug } from "@/lib/location-aliases";
import {
  generateBaseMetadata,
  generateNotFoundMetadata,
  shortPantheonName,
} from "@/lib/metadata";
import { PlaceJsonLd } from "@/components/seo/JsonLd";
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
import { LocationMap } from "@/components/locations/LocationMap";
import { ShareButton } from "@/components/sharing/ShareButton";
import {
  EntitySources,
  hasEntitySources,
} from "@/components/sources/EntitySources";
import { formatPantheonLabel } from "@/lib/deity-page";
import { guidesFeaturing } from "@/lib/guides";
import { getPantheonColor } from "@/lib/pantheon-colors";

function formatLocationType(type: string): string {
  return type.replaceAll("_", " ").replaceAll(/\b\w/g, (c) => c.toUpperCase());
}

function formatCoordinates(latitude: number, longitude: number): string {
  return `${Math.abs(latitude)}°${latitude >= 0 ? "N" : "S"}, ${Math.abs(longitude)}°${longitude >= 0 ? "E" : "W"}`;
}

interface LocationData {
  id: string;
  name: string;
  locationType: string;
  pantheonId: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl?: string;
  geography?: string;
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

// Generate static params for all locations
export async function generateStaticParams() {
  return locations.map((location) => ({
    slug: location.id,
  }));
}

// Generate metadata for each location page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = canonicalLocationSlug(rawSlug);
  const location = locations.find((l) => l.id === slug) as
    LocationData | undefined;

  if (!location) {
    return generateNotFoundMetadata(
      "Location Not Found",
      "The requested location could not be found.",
    );
  }

  const pantheon = pantheons.find((p) => p.id === location.pantheonId);
  const pantheonName = shortPantheonName(pantheon);
  const locationType =
    location.locationType?.replaceAll("_", " ") || "location";

  const description =
    location.description?.slice(0, 160) ||
    `Explore ${location.name}, a mythological ${locationType} from ${pantheonName} traditions.`;

  return generateBaseMetadata({
    title: `${location.name} - ${pantheonName} Location`,
    description,
    url: `/locations/${location.id}`,
    // The generated opengraph-image card for this route supplies og:image.
    image: null,
    type: "article",
    keywords: [
      location.name,
      locationType,
      pantheonName,
      "mythology",
      "mythological location",
      "sacred place",
      "ancient world",
    ],
    articleSection: "Locations",
    articleTags: [locationType, pantheonName],
  });
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params;
  const canonical = canonicalLocationSlug(slug);
  if (canonical !== slug) {
    redirect(`/locations/${canonical}`);
  }

  const allLocations = locations as unknown as LocationData[];
  const location = allLocations.find((l) => l.id === slug);
  if (!location) {
    notFound();
  }

  const pantheon = pantheons.find((p) => p.id === location.pantheonId);
  const traditionName =
    pantheon?.name ?? formatPantheonLabel(location.pantheonId);
  const typeLabel = formatLocationType(location.locationType);
  const hasCoordinates =
    location.latitude != null && location.longitude != null;

  const sameTradition = allLocations.filter(
    (l) => l.pantheonId === location.pantheonId && l.id !== location.id,
  );
  const guides = guidesFeaturing("location", location.id);

  const sourceFields = { primarySources: location.primarySources };
  const hasSources = hasEntitySources(sourceFields);
  const toc: TocItem[] = [
    { id: "about", label: `About ${location.name}` },
    ...(hasCoordinates ? [{ id: "map", label: "On the map" }] : []),
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
        { label: "Type", value: typeLabel },
        {
          label: hasCoordinates ? "Coordinates" : "Realm",
          value: hasCoordinates ? (
            <span className="tabular-nums">
              {formatCoordinates(location.latitude!, location.longitude!)}
            </span>
          ) : (
            "Mythological, not on an earthly map"
          ),
        },
      ]}
    />
  );

  return (
    <>
      <PlaceJsonLd
        name={location.name}
        description={location.description}
        url={`/locations/${location.id}`}
        image={location.imageUrl}
        latitude={location.latitude}
        longitude={location.longitude}
        geography={location.geography}
        locationType={location.locationType}
        tradition={shortPantheonName(pantheon)}
        citations={citedWorksFor(location)}
      />
      <DetailLayout
        hero={
          <DetailHero
            accentColor={getPantheonColor(location.pantheonId)}
            imageAspect="square"
            image={
              location.imageUrl
                ? { src: location.imageUrl, alt: location.name }
                : null
            }
            imageCaption={
              location.imageUrl ? (
                <IllustrativeImageCaption
                  note={getIllustrativeImageNote("location", location.id)}
                  subject={`Illustration of ${location.name}`}
                  tone="light"
                />
              ) : null
            }
            imageFallback={
              <span
                className="font-serif text-7xl text-gold/70"
                aria-hidden="true"
              >
                {location.name.charAt(0)}
              </span>
            }
            eyebrow={
              <>
                <span>{traditionName}</span>
                <span className="text-gold/50" aria-hidden="true">
                  ·
                </span>
                <span className="text-parchment/85">{typeLabel}</span>
              </>
            }
            title={location.name}
            lede={location.detailedBio ? <p>{location.description}</p> : null}
            actions={
              <ShareButton
                surface="location_page"
                title={`${location.name} - Mythos Atlas`}
                text={`Explore ${location.name}, a sacred place in ${traditionName} mythology, on Mythos Atlas`}
                url={`https://mythosatlas.com/locations/${location.id}`}
                className={heroShareClass}
              />
            }
          />
        }
        facts={facts}
        toc={toc}
        asideLabel={`${location.name} at a glance`}
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
              title={`More ${shortPantheonName(pantheon)} places`}
              figures={sameTradition.slice(0, 5).map((related) => ({
                name: related.name,
                href: `/locations/${related.id}`,
                imageUrl: related.imageUrl,
                meta: formatLocationType(related.locationType),
              }))}
            />
          </>
        }
      >
        <ArticleStack>
          <ArticleSection id="about" title={`About ${location.name}`}>
            {location.detailedBio ? (
              <ReadingProse markdown={location.detailedBio} dropCap />
            ) : (
              <ReadingParagraph>{location.description}</ReadingParagraph>
            )}
          </ArticleSection>

          {hasCoordinates ? (
            <ArticleSection
              id="map"
              title="On the map"
              description={`${location.name} among other places of the ${traditionName}.`}
              reading={false}
            >
              <LocationMap
                location={{
                  id: location.id,
                  name: location.name,
                  locationType: location.locationType,
                  pantheonId: location.pantheonId,
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                relatedLocations={sameTradition.map((l) => ({
                  id: l.id,
                  name: l.name,
                  locationType: l.locationType,
                  pantheonId: l.pantheonId,
                  latitude: l.latitude,
                  longitude: l.longitude,
                }))}
                pantheonName={traditionName}
              />
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
              Coordinates mark where the myths place a site, or where the
              tradition locates it today. Mythic realms are left off the map or
              marked as symbolic placements.
            </p>
          </AboutThisPage>
        </ArticleStack>
      </DetailLayout>
    </>
  );
}
