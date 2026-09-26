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
import { EditorialByline } from "@/components/content/EditorialByline";
import { AboutThisPage } from "@/components/layout/about-this-page";
import {
  ArticleSection,
  AsideLinks,
  DetailLayout,
  FactList,
  RelatedFigures,
  type TocItem,
} from "@/components/layout/detail-layout";
import { guidesFeaturing } from "@/lib/guides";
import { counterpart, getComparisonsForDeity } from "@/lib/comparisons";
import { familyFaq } from "@/lib/deity-faq";
import { godsOfLinksForDomains } from "@/lib/gods-of";
import { BloodlineTapestry } from "@/components/deities/BloodlineTapestry";
import { DeityStoryRecommendations } from "@/components/deities/DeityStoryRecommendations";
import { MuseumGallery } from "@/components/museum/MuseumGallery";
import {
  hasLinkedMentions,
  LinkedMentions,
} from "@/components/mythology/LinkedMentions";
import { DeityJsonLd } from "@/components/seo/JsonLd";
import {
  EntitySources,
  hasEntitySources,
} from "@/components/sources/EntitySources";
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
  formatPantheonLabel,
  hasLineage,
  type Kin,
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
  DeityNarrative,
  DeityParallels,
  DeityWorship,
  hasWorship,
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

// Relationship labels describe this deity's side ("Parent" of Ares); the aside
// names the related figure's role instead.
const RELATED_ROLE: Record<string, string> = {
  Parent: "Child",
  Child: "Parent",
};

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

  const hasSources = hasEntitySources({
    ...deity,
    appearsIn: { id: deity.id, kind: "deity" },
  });

  // Portraits for the parallels, keyed by the page each one links to.
  const parallelImages: Record<string, string | null | undefined> = {};
  for (const parallel of parallels) {
    if (!parallel.href || !parallel.slug) continue;
    const figure = parallel.href.startsWith("/heroes/")
      ? heroes.find((hero) => hero.slug === parallel.slug)
      : allDeities.find((d) => d.slug === parallel.slug);
    parallelImages[parallel.href] = figure?.imageUrl;
  }

  const familyAnswers = familyFaq(deity.name, bloodline);
  const hasFamily = hasLineage(bloodline) || familyAnswers.length > 0;
  const interactiveStories = interactiveStoriesFeaturing(
    deity.id,
    getBranchingStories(),
  );
  const hasAtlasLinks =
    hasLinkedMentions(deity.id) || interactiveStories.length > 0;
  const worship = hasWorship(deity);
  const relatedDeities = selectRelatedDeities(
    deity.id,
    deity.pantheonId,
    getTopRelatedDeities(deity.id, 6),
    allDeities,
  );
  const comparisons = getComparisonsForDeity(deity.id);
  const guides = guidesFeaturing("deity", deity.id);

  const toc: TocItem[] = [
    { id: "deity-about", label: `About ${deity.name}` },
    ...(parallels.length > 0
      ? [{ id: "parallels", label: "Across traditions" }]
      : []),
    ...(worship ? [{ id: "worship", label: "Worship" }] : []),
    ...(hasFamily ? [{ id: "family", label: "Family" }] : []),
    ...(hasAtlasLinks ? [{ id: "in-the-atlas", label: "In the atlas" }] : []),
    ...(museumObjects.length > 0 ? [{ id: "in-art", label: "In art" }] : []),
    ...(hasSources
      ? [{ id: "deity-sources", label: "Sources and further reading" }]
      : []),
    ...(familyTreeRelationships.length > 0
      ? [{ id: "family-tree", label: "Family tree" }]
      : []),
  ];

  const kinList = (kin: Kin[], max = 6) =>
    kin.length === 0 ? null : (
      <>
        {kin.slice(0, max).map((k, index) => (
          <span key={k.key}>
            {index > 0 ? ", " : null}
            {k.slug ? (
              <Link
                href={`/deities/${k.slug}`}
                className="underline decoration-gold/40 underline-offset-4 hover:text-gold-text hover:decoration-current"
              >
                {k.name}
              </Link>
            ) : (
              k.name
            )}
          </span>
        ))}
        {kin.length > max ? ` and ${kin.length - max} more` : null}
      </>
    );

  const facts = (
    <FactList
      facts={[
        {
          label: "Tradition",
          value: pantheon ? (
            <Link
              href={`/pantheons/${pantheon.slug}`}
              className="underline decoration-gold/40 underline-offset-4 hover:text-gold-text hover:decoration-current"
            >
              {pantheon.name}
            </Link>
          ) : (
            formatPantheonLabel(deity.pantheonId)
          ),
        },
        { label: "Role", value: deity.traditionRole },
        {
          label: "Domains",
          value: deity.domain?.length ? (
            <span className="capitalize">{deity.domain.join(", ")}</span>
          ) : null,
        },
        {
          label: "Symbols",
          value: deity.symbols?.length ? deity.symbols.join(", ") : null,
        },
        { label: "Parents", value: kinList(bloodline.parents) },
        {
          label: bloodline.consorts.length === 1 ? "Consort" : "Consorts",
          value: kinList(bloodline.consorts),
        },
        { label: "Children", value: kinList(bloodline.children) },
      ]}
    />
  );

  const aside = (
    <>
      <RelatedFigures
        title="Related figures"
        figures={relatedDeities.map((related) => ({
          name: related.name,
          href: `/deities/${related.slug}`,
          imageUrl: related.imageUrl,
          meta: RELATED_ROLE[related.label] ?? related.label,
        }))}
      />
      <AsideLinks
        title="Featured in guides"
        links={guides.map((guide) => ({
          href: `/guides/${guide.slug}`,
          label: guide.title,
        }))}
      />
      <AsideLinks
        title="Compare side by side"
        links={comparisons.map((comparison) => {
          const other = counterpart(comparison, deity.id);
          return {
            href: `/compare/${comparison.slug}`,
            label: `${deity.name} vs ${other.displayName}`,
            meta: other.pantheonName,
          };
        })}
      />
      <AsideLinks
        title="Across traditions"
        links={domainPages.map((page) => ({
          href: `/gods-of/${page.slug}`,
          label: `Gods of ${page.label}`,
        }))}
      />
    </>
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
      <DetailLayout
        hero={
          <DeityHero
            deity={deity}
            traditionLabel={pantheon?.name}
            museumPortrait={getMuseumPortrait(museumObjects)}
            imageNote={getIllustrativeImageNote("deity", deity.id)}
          />
        }
        facts={facts}
        toc={toc}
        aside={aside}
        asideLabel={`${deity.name} at a glance`}
        after={
          familyTreeRelationships.length > 0 ? (
            <DeityFamilyTree
              deityId={deity.id}
              deityName={deity.name}
              deities={familyTreeDeities}
              relationships={familyTreeRelationships}
            />
          ) : null
        }
      >
        <div className="space-y-16 md:space-y-20">
          <ArticleSection id="deity-about" title={`About ${deity.name}`}>
            <DeityNarrative deity={deity} />
          </ArticleSection>

          {parallels.length > 0 ? (
            <ArticleSection
              id="parallels"
              eyebrow="Across traditions"
              title="Parallel figures"
              description={`Figures who play a role like ${deity.name}'s in other traditions.`}
              reading={false}
            >
              <DeityParallels
                deity={deity}
                parallels={parallels}
                compareSlugs={compareSlugs}
                images={parallelImages}
              />
            </ArticleSection>
          ) : null}

          {worship ? (
            <ArticleSection
              id="worship"
              title="Worship and cult"
              description={`Temples, festivals, and practices recorded for ${deity.name}`}
            >
              <DeityWorship deity={deity} />
            </ArticleSection>
          ) : null}

          {hasFamily ? (
            <ArticleSection id="family" title="Family" reading={false}>
              <div className="space-y-10">
                <BloodlineTapestry
                  deityId={deity.id}
                  deityName={deity.name}
                  pantheonId={deity.pantheonId}
                  bloodline={bloodline}
                />
                <DeityFamilyFaq
                  deityName={deity.name}
                  answers={familyAnswers}
                />
              </div>
            </ArticleSection>
          ) : null}

          {hasAtlasLinks ? (
            <ArticleSection
              id="in-the-atlas"
              eyebrow="In the atlas"
              title={`Where ${deity.name} appears`}
              reading={false}
            >
              <div className="space-y-10">
                <LinkedMentions deityId={deity.id} deityName={deity.name} />
                {interactiveStories.length > 0 ? (
                  <div>
                    <h3 className="type-h3 mb-2 text-foreground">
                      Play the myth
                    </h3>
                    <DeityStoryRecommendations
                      deityName={deity.name}
                      stories={interactiveStories}
                    />
                  </div>
                ) : null}
              </div>
            </ArticleSection>
          ) : null}

          {museumObjects.length > 0 ? (
            <ArticleSection
              id="in-art"
              eyebrow="In the museums"
              title={`${deity.name} in art`}
              reading={false}
            >
              <MuseumGallery objects={museumObjects} />
            </ArticleSection>
          ) : null}

          {hasSources ? (
            <ArticleSection
              id="deity-sources"
              title="Sources and further reading"
            >
              <EntitySources
                {...deity}
                appearsIn={{ id: deity.id, kind: "deity" }}
              />
            </ArticleSection>
          ) : null}

          <AboutThisPage title="About this entry" size={false}>
            <EditorialByline />
            <p>
              Parallels are editorial comparisons across traditions: a shared
              role does not, by itself, establish a shared origin.
            </p>
            {hasFamily ? (
              <p>
                Family relationships come from the atlas&apos;s kinship records.
                Ancient sources often disagree on divine genealogy.
              </p>
            ) : null}
          </AboutThisPage>
        </div>
      </DetailLayout>
    </>
  );
}
