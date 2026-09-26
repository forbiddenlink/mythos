import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialByline } from "@/components/content/EditorialByline";
import {
  ArticleStack,
  FactLink,
  heroShareClass,
} from "@/components/content/detail-parts";
import { AboutThisPage } from "@/components/layout/about-this-page";
import {
  ArticleSection,
  DetailHero,
  DetailLayout,
  FactList,
  RelatedFigures,
  type TocItem,
} from "@/components/layout/detail-layout";
import { ItemListJsonLd } from "@/components/seo/JsonLd";
import { ShareButton } from "@/components/sharing/ShareButton";
import heroes from "@/data/heroes.json";
import locations from "@/data/locations.json";
import sources from "@/data/sources.json";
import { getDeities, getJourneys, getPantheonById } from "@/lib/data/catalog";
import { formatPantheonLabel } from "@/lib/deity-page";
import { isOtherworldJourney, sortWaypoints } from "@/lib/journeys";
import { generateBaseMetadata, generateNotFoundMetadata } from "@/lib/metadata";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { JourneyExplorer } from "./JourneyExplorer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Every valid param is prerendered by generateStaticParams; anything else is a
// 404 served from the static not-found page. (On-demand rendering of unknown
// params would cache HTML carrying one request's CSP nonce.)
export const dynamicParams = false;

function findJourney(slug: string) {
  return getJourneys().find((j) => j.slug === slug);
}

export async function generateStaticParams() {
  return getJourneys().map((journey) => ({
    slug: journey.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const journey = findJourney(slug);

  if (!journey) {
    return generateNotFoundMetadata(
      "Journey Not Found",
      "The requested journey could not be found.",
    );
  }

  const pantheon = getPantheonById(journey.pantheonId);
  const pantheonName = pantheon?.name || "Ancient";

  const waypointCount = journey.waypoints?.length || 0;
  const description =
    journey.description?.slice(0, 160) ||
    `Follow ${journey.heroName}'s epic ${journey.duration} journey through ${waypointCount} legendary locations in ${pantheonName} mythology.`;

  return generateBaseMetadata({
    title: `${journey.title} - ${journey.heroName}'s Journey`,
    description: description,
    url: `/journeys/${journey.slug}`,
    image: journey.imageUrl || "/og-image.png",
    type: "article",
    keywords: [
      journey.title,
      journey.heroName,
      pantheonName,
      "mythology",
      "epic journey",
      "hero quest",
      "adventure",
      "ancient voyage",
      journey.source.split(",")[0], // e.g., "Homer"
    ],
    articleSection: "Journeys",
    articleTags: journey.waypoints?.slice(0, 5).map((w) => w.name),
  });
}

export default async function JourneyPage({ params }: PageProps) {
  const { slug } = await params;
  const journey = findJourney(slug);
  if (!journey) {
    notFound();
  }

  const pantheon = getPantheonById(journey.pantheonId);
  const traditionName =
    pantheon?.name ?? formatPantheonLabel(journey.pantheonId);
  const color = getPantheonColor(journey.pantheonId);
  const otherworld = isOtherworldJourney(journey);
  const stops = sortWaypoints(journey.waypoints);

  const traveller =
    journey.heroKind === "hero"
      ? heroes.find((hero) => hero.id === journey.heroId)
      : getDeities().find((deity) => deity.id === journey.heroId);
  const travellerHref = traveller
    ? `/${journey.heroKind === "hero" ? "heroes" : "deities"}/${traveller.slug}`
    : null;
  const sourceWork = journey.sourceId
    ? sources.find((source) => source.id === journey.sourceId)
    : undefined;

  const places = stops.flatMap((stop) => {
    const place = stop.locationId
      ? locations.find((location) => location.id === stop.locationId)
      : undefined;
    return place
      ? [
          {
            name: place.name,
            href: `/locations/${place.id}`,
            imageUrl: place.imageUrl,
            meta: `Stop ${stop.order}`,
          },
        ]
      : [];
  });
  const otherJourneys = getJourneys()
    .filter((other) => other.slug !== journey.slug)
    .slice(0, 4)
    .map((other) => ({
      name: other.title,
      href: `/journeys/${other.slug}`,
      imageUrl: other.imageUrl,
      meta: other.heroName,
    }));

  const toc: TocItem[] = [
    { id: "route", label: "The route" },
    ...(otherworld ? [] : [{ id: "stops", label: "Stop by stop" }]),
  ];

  const facts = (
    <FactList
      facts={[
        {
          label: "Traveller",
          value:
            traveller && travellerHref ? (
              <FactLink href={travellerHref}>{traveller.name}</FactLink>
            ) : (
              journey.heroName
            ),
        },
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
        { label: "Duration", value: journey.duration },
        { label: "Stops", value: String(stops.length) },
        {
          label: "Source",
          value: sourceWork ? (
            <FactLink href={`/sources/${sourceWork.id}`}>
              {journey.source}
            </FactLink>
          ) : (
            journey.source
          ),
        },
      ]}
    />
  );

  return (
    <>
      <ItemListJsonLd
        name={journey.title}
        description={journey.description}
        url={`/journeys/${journey.slug}`}
        items={stops.map((waypoint, index) => ({
          name: waypoint.name,
          url: `/journeys/${journey.slug}`,
          position: index + 1,
        }))}
      />
      <DetailLayout
        hero={
          <DetailHero
            accentColor={color}
            imageAspect="square"
            image={
              journey.imageUrl
                ? { src: journey.imageUrl, alt: journey.title }
                : null
            }
            imageFallback={
              <span
                className="font-serif text-7xl text-gold/70"
                aria-hidden="true"
              >
                {journey.title.charAt(0)}
              </span>
            }
            eyebrow={
              <>
                <span>{traditionName}</span>
                <span className="text-gold/50" aria-hidden="true">
                  ·
                </span>
                <span className="text-parchment/85">Journey</span>
              </>
            }
            title={journey.title}
            nativeName={
              <>
                {otherworld ? "Through the realms with " : "The voyage of "}
                <span className="text-gold-light">{journey.heroName}</span>
              </>
            }
            lede={<p>{journey.description}</p>}
            actions={
              <>
                <a
                  href="#route"
                  className="inline-flex h-10 items-center rounded-full bg-gold px-5 text-[0.9375rem] font-semibold text-midnight transition-colors hover:bg-gold-light"
                >
                  Follow the route
                </a>
                <ShareButton
                  surface="journey_page"
                  title={`${journey.title} - Mythos Atlas`}
                  text={`Follow ${journey.heroName} on ${journey.title} in Mythos Atlas`}
                  url={`https://mythosatlas.com/journeys/${journey.slug}`}
                  className={heroShareClass}
                />
              </>
            }
          />
        }
        facts={facts}
        toc={toc}
        asideLabel={`${journey.title} at a glance`}
        aside={
          <>
            {traveller && travellerHref ? (
              <RelatedFigures
                title="The traveller"
                figures={[
                  {
                    name: traveller.name,
                    href: travellerHref,
                    imageUrl: traveller.imageUrl,
                    meta: journey.heroKind === "hero" ? "Hero" : "Deity",
                  },
                ]}
              />
            ) : null}
            <RelatedFigures title="Places on the route" figures={places} />
            <RelatedFigures title="Other journeys" figures={otherJourneys} />
          </>
        }
      >
        <ArticleStack>
          <ArticleSection
            id="route"
            title="The route"
            description={
              otherworld
                ? "These realms belong to the mythic cosmos, not an earthly map, so the route is shown in order instead of as pins."
                : "The map illustrates the story's route. Pins are not evidence of an exact historical itinerary; some places are disputed or mythical."
            }
            reading={false}
          >
            <JourneyExplorer journey={journey} color={color} />
          </ArticleSection>

          {otherworld ? null : (
            <ArticleSection id="stops" title="Stop by stop">
              <ol className="divide-y divide-border/70 border-y border-border/70">
                {stops.map((stop) => (
                  <li
                    key={stop.id}
                    className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 py-5"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-8 items-center justify-center rounded-full border-2 bg-background font-serif text-sm font-semibold text-foreground"
                      style={{ borderColor: color }}
                    >
                      {stop.order}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-serif text-[1.1875rem] font-semibold leading-snug text-foreground">
                        {stop.locationId ? (
                          <Link
                            href={`/locations/${stop.locationId}`}
                            className="underline decoration-gold/40 underline-offset-4 hover:text-gold-text hover:decoration-current"
                          >
                            {stop.name}
                          </Link>
                        ) : (
                          stop.name
                        )}
                      </h3>
                      {stop.duration ? (
                        <p className="mt-0.5 type-meta text-muted-foreground">
                          {stop.duration}
                        </p>
                      ) : null}
                      <p className="mt-2 type-reading text-foreground/90">
                        {stop.description}
                      </p>
                      {stop.events?.length ? (
                        <p className="mt-2 type-ui text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Events:{" "}
                          </span>
                          {stop.events.join("; ")}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </ArticleSection>
          )}

          <AboutThisPage title="About this journey" size={false}>
            <EditorialByline />
            <p>
              Routes follow the named source; other tellings order or place the
              stops differently.
            </p>
          </AboutThisPage>
        </ArticleStack>
      </DetailLayout>
    </>
  );
}
