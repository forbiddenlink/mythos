import type { Metadata } from "next";
import { getIllustrativeImageNote } from "@/lib/image-provenance";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TrackPageView } from "@/components/analytics/TrackPageView";
import deities from "@/data/deities.json";
import heroes from "@/data/heroes.json";
import pantheons from "@/data/pantheons.json";
import { findDeityByReference } from "@/lib/deities";
import {
  generateBaseMetadata,
  generateNotFoundMetadata,
  shortPantheonName,
} from "@/lib/metadata";
import { getMuseumObjectsFor, getMuseumPortrait } from "@/lib/museum";
import { ComparisonLinks } from "@/components/compare/ComparisonLinks";
import { FeaturedInGuides } from "@/components/guides/FeaturedInGuides";
import { counterpart, getComparisonsForDeity } from "@/lib/comparisons";
import { familyFaq } from "@/lib/deity-faq";
import { godsOfLinksForDomains } from "@/lib/gods-of";
import { BloodlineTapestry } from "@/components/deities/BloodlineTapestry";
import { DeityStoryRecommendations } from "@/components/deities/DeityStoryRecommendations";
import { RelatedDeities } from "@/components/deities/RelatedDeities";
import { MuseumGallery } from "@/components/museum/MuseumGallery";
import { LinkedMentions } from "@/components/mythology/LinkedMentions";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { DeityJsonLd } from "@/components/seo/JsonLd";
import { getAppearsIn } from "@/lib/appears-in";
import { citedWorksFor } from "@/lib/seo/cited-works";
import {
  getBranchingStories,
  getDeities,
  getDeityById,
  getDeityLookup,
  getPantheonById,
  getRelationships,
} from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import {
  buildBloodline,
  deitiesInRelationships,
  interactiveStoriesFeaturing,
  relationshipsFor,
  resolveParallels,
  selectRelatedDeities,
} from "@/lib/deity-page";
import { getTopRelatedDeities } from "@/lib/relationships";
import { DeityFamilyFaq } from "./_components/DeityFamilyFaq";
import { DeityFamilyTree } from "./_components/DeityFamilyTree";
import { DeityHero } from "./_components/DeityHero";
import {
  DeityAttributes,
  DeityNarrative,
  DeityParallels,
  DeitySources,
  DeityWorship,
} from "./_components/DeitySections";
import { DeityViewTracker } from "./_components/DeityViewTracker";

interface DeityData {
  id: string;
  pantheonId: string;
  name: string;
  slug: string;
  description: string;
  domain: string[];
  alternateNames?: string[];
  imageUrl?: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

function resolveDeityBySlug(slug: string) {
  return findDeityByReference(slug) as DeityData | undefined;
}

// Every valid param is prerendered by generateStaticParams; anything else is a
// 404 served from the static not-found page. (On-demand rendering of unknown
// params would cache HTML carrying one request's CSP nonce.) Alias URLs (ids,
// alternate names, other casings) are redirected by src/proxy.ts.
export const dynamicParams = false;

// Generate static params for all deities
export async function generateStaticParams() {
  return deities.map((deity) => ({
    slug: deity.slug,
  }));
}

// Generate metadata for each deity page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const deity = resolveDeityBySlug(slug);

  if (!deity) {
    return generateNotFoundMetadata(
      "Deity Not Found",
      "The requested deity could not be found.",
    );
  }

  const pantheon = pantheons.find((p) => p.id === deity.pantheonId);
  const pantheonName = shortPantheonName(pantheon);

  // Create a rich description
  const domains = deity.domain?.slice(0, 3).join(", ") || "";
  const baseDescription =
    deity.description ||
    `Explore ${deity.name}, ${pantheonName} deity of ${domains}. Learn about their mythology, symbols, and divine family.`;
  const description =
    baseDescription.length < 140
      ? `${baseDescription} Explore mythology, symbols, and related stories in Mythos Atlas.`
      : baseDescription;

  return generateBaseMetadata({
    title: `${deity.name} - ${pantheonName} Deity`,
    description: description.slice(0, 160),
    url: `/deities/${deity.slug}`,
    // The generated opengraph-image card for this route supplies og:image.
    image: null,
    type: "article",
    keywords: [
      deity.name,
      ...(deity.alternateNames || []),
      ...(deity.domain || []),
      pantheonName,
      "mythology",
      "deity",
      "god",
      "goddess",
    ],
    articleSection: "Deities",
    articleTags: deity.domain,
  });
}

export default async function DeityPage({ params }: PageProps) {
  const { slug } = await params;

  // Check if deity exists (for 404)
  const summary = resolveDeityBySlug(slug);
  if (!summary) {
    notFound();
  }

  if (summary.slug !== slug) {
    redirect(`/deities/${summary.slug}`);
  }

  const deity = getDeityById(summary.id);
  if (!deity) {
    notFound();
  }

  const allDeities = getDeities();
  const relationships = getRelationships();
  const pantheon = getPantheonById(deity.pantheonId);
  const museumObjects = getMuseumObjectsFor({ deity: deity.slug });

  // Hero comparisons live in their own field; render them with the deity
  // parallels so the comparison section links them to hero articles.
  const allParallels = [
    ...(deity.crossPantheonParallels ?? []),
    ...(deity.heroParallels ?? []).map(({ heroId, ...rest }) => ({
      ...rest,
      deityId: heroId,
    })),
  ];
  const heroParallels = heroes
    .filter((hero) =>
      allParallels.some((parallel) => parallel.deityId === hero.id),
    )
    .map(({ id, name, slug }) => ({ id, name, slug }));
  const parallels = resolveParallels(
    deity.id,
    allParallels,
    getDeityLookup(),
    heroParallels,
  );

  const compareSlugs = Object.fromEntries(
    getComparisonsForDeity(deity.id, Number.POSITIVE_INFINITY).map((c) => [
      counterpart(c, deity.id).id,
      c.slug,
    ]),
  );
  const bloodline = buildBloodline(deity.id, relationships, allDeities);
  const domainPages = godsOfLinksForDomains(deity.domain ?? []);

  const ownRelationships = relationshipsFor(deity.id, relationships);
  const familyTreeDeities = project(
    deitiesInRelationships(ownRelationships, allDeities),
    ["id", "name", "slug", "domain", "gender"],
  );
  const familyTreeRelationships = ownRelationships.map(
    ({ id, fromDeityId, toDeityId, relationshipType, description }) => ({
      id,
      fromDeityId,
      toDeityId,
      relationshipType,
      description: description ?? null,
    }),
  );

  const hasSources = Boolean(
    deity.primarySources?.length ||
    deity.primarySourceExcerpts?.length ||
    deity.furtherReading?.length ||
    deity.sources?.length ||
    getAppearsIn(deity.id, "deity").length,
  );

  return (
    <>
      <TrackPageView
        event="entry_viewed"
        properties={{
          entityType: "deity",
          slug,
          pantheon: deity.pantheonId,
        }}
      />
      <DeityViewTracker deityId={deity.id} pantheonId={deity.pantheonId} />
      <div className="min-h-screen">
        <DeityJsonLd
          name={deity.name}
          description={
            deity.description || `${deity.name} - deity from ancient mythology`
          }
          alternateNames={deity.alternateNames}
          domains={deity.domain}
          url={`/deities/${deity.slug}`}
          image={deity.imageUrl || undefined}
          tradition={shortPantheonName(pantheon)}
          citations={citedWorksFor(deity)}
        />
        <DeityHero
          deity={deity}
          traditionLabel={pantheon?.name}
          museumPortrait={getMuseumPortrait(museumObjects)}
          hasSources={hasSources}
          imageNote={getIllustrativeImageNote("deity", deity.id)}
        />

        <div className="container mx-auto max-w-4xl px-4 py-12">
          <Breadcrumbs />
          <div className="space-y-8">
            <div className="space-y-8">
              <LinkedMentions deityId={deity.id} deityName={deity.name} />
              <div className="space-y-12">
                <DeityNarrative deity={deity} />
                <FeaturedInGuides kind="deity" id={deity.id} />
                <DeityParallels
                  deity={deity}
                  parallels={parallels}
                  compareSlugs={compareSlugs}
                />
                <DeitySources deity={deity} />
                <DeityWorship deity={deity} />
                <DeityAttributes deity={deity} />
                {domainPages.length > 0 ? (
                  <nav
                    aria-label="Other gods of these domains"
                    className="max-w-[68ch] text-sm text-muted-foreground"
                  >
                    <span className="text-sm font-medium uppercase tracking-[0.2em] mr-2">
                      Across traditions
                    </span>
                    {domainPages.map((page, index) => (
                      <span key={page.slug}>
                        {index > 0 ? " · " : null}
                        <Link
                          href={`/gods-of/${page.slug}`}
                          className="text-foreground underline decoration-gold/50 underline-offset-4 hover:text-gold-text hover:decoration-current"
                        >
                          Gods of {page.label}
                        </Link>
                      </span>
                    ))}
                  </nav>
                ) : null}
              </div>
            </div>

            <MuseumGallery name={deity.name} objects={museumObjects} />

            <RelatedDeities
              deities={selectRelatedDeities(
                deity.id,
                deity.pantheonId,
                getTopRelatedDeities(deity.id, 6),
                allDeities,
              )}
            />

            <DeityStoryRecommendations
              deityName={deity.name}
              stories={interactiveStoriesFeaturing(
                deity.id,
                getBranchingStories(),
              )}
            />

            <BloodlineTapestry
              deityId={deity.id}
              deityName={deity.name}
              pantheonId={deity.pantheonId}
              bloodline={bloodline}
            />

            <DeityFamilyFaq
              deityName={deity.name}
              answers={familyFaq(deity.name, bloodline)}
            />

            <DeityFamilyTree
              deityId={deity.id}
              deityName={deity.name}
              deities={familyTreeDeities}
              relationships={familyTreeRelationships}
            />
          </div>
        </div>
      </div>
      <ComparisonLinks deityId={deity.id} deityName={deity.name} />
    </>
  );
}
