import { siteConfig } from "@/lib/metadata";

// ─── Helper ──────────────────────────────────────────────────────────
// Render in the server HTML; escape less-than signs so text cannot close the script.
function JsonLdScript({
  id,
  data,
}: Readonly<{ id: string; data: Record<string, unknown> }>) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inline; `<` is escaped above so the payload cannot close the script.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

// ─── BreadcrumbList ──────────────────────────────────────────────────
interface BreadcrumbItem {
  name: string;
  item: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: Readonly<BreadcrumbProps>) {
  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

  return <JsonLdScript id="breadcrumb-jsonld" data={breadcrumbList} />;
}

// ─── WebSite (homepage) ──────────────────────────────────────────────
interface WebSiteJsonLdProps {
  searchActionTarget?: string;
}

export function WebSiteJsonLd({
  searchActionTarget,
}: Readonly<WebSiteJsonLdProps>) {
  const website: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      "@type": "Person",
      name: siteConfig.creator,
    },
  };

  if (searchActionTarget) {
    website.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: searchActionTarget,
      },
      "query-input": "required name=search_term_string",
    };
  }

  return <JsonLdScript id="website-jsonld" data={website} />;
}

// ─── Article (stories, deity articles) ───────────────────────────────
interface ArticleJsonLdProps {
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  section?: string;
  tags?: string[];
  url?: string;
}

export function ArticleJsonLd({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author = siteConfig.name,
  section,
  tags,
  url,
}: Readonly<ArticleJsonLdProps>) {
  const article: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    image: image
      ? `${siteConfig.url}${image}`
      : `${siteConfig.url}/og-image.png`,
    datePublished: datePublished || "2026-01-01T00:00:00Z",
    dateModified: dateModified || "2026-02-01T00:00:00Z",
    author: {
      "@type": "Organization",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  if (url) article.url = `${siteConfig.url}${url}`;
  if (section) article.articleSection = section;
  if (tags && tags.length > 0) article.keywords = tags;

  return <JsonLdScript id="article-jsonld" data={article} />;
}

export function OrganizationJsonLd() {
  return (
    <JsonLdScript
      id="organization-jsonld"
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/icon.png`,
        sameAs: [siteConfig.links.github],
      }}
    />
  );
}

// ─── CollectionPage (pantheons listing, deities listing) ─────────────
interface CollectionPageJsonLdProps {
  name: string;
  description: string;
  url: string;
  numberOfItems?: number;
}

export function CollectionPageJsonLd({
  name,
  description,
  url,
  numberOfItems,
}: Readonly<CollectionPageJsonLdProps>) {
  const collection: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${siteConfig.url}${url}`,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  if (numberOfItems !== undefined) {
    collection.mainEntity = {
      "@type": "ItemList",
      numberOfItems,
    };
  }

  return <JsonLdScript id="collection-jsonld" data={collection} />;
}

// ─── Quiz ────────────────────────────────────────────────────────────
interface QuizJsonLdProps {
  name: string;
  description: string;
  url: string;
}

export function QuizJsonLd({
  name,
  description,
  url,
}: Readonly<QuizJsonLdProps>) {
  const quiz = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name,
    description,
    url: `${siteConfig.url}${url}`,
    educationalAlignment: {
      "@type": "AlignmentObject",
      alignmentType: "educationalSubject",
      targetName: "World Mythology",
    },
    about: {
      "@type": "Thing",
      name: "Ancient Mythology",
    },
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return <JsonLdScript id="quiz-jsonld" data={quiz} />;
}

// ─── AboutPage ───────────────────────────────────────────────────────
interface AboutPageJsonLdProps {
  creatorName: string;
  creatorDescription: string;
}

export function AboutPageJsonLd({
  creatorName,
  creatorDescription,
}: Readonly<AboutPageJsonLdProps>) {
  const aboutPage = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${siteConfig.name}`,
    description: `Learn about ${siteConfig.name}, an interactive encyclopedia of ancient mythology.`,
    url: `${siteConfig.url}/about`,
    mainEntity: {
      "@type": "Person",
      name: creatorName,
      description: creatorDescription,
      jobTitle: "Developer",
    },
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return <JsonLdScript id="about-jsonld" data={aboutPage} />;
}

// ─── WebApplication (family tree) ────────────────────────────────────
interface WebApplicationJsonLdProps {
  name: string;
  description: string;
  url: string;
}

export function WebApplicationJsonLd({
  name,
  description,
  url,
}: Readonly<WebApplicationJsonLdProps>) {
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: `${siteConfig.url}${url}`,
    applicationCategory: "EducationalApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return <JsonLdScript id="webapp-jsonld" data={app} />;
}

// ─── FAQPage ──────────────────────────────────────────────────────────
interface FAQQuestion {
  question: string;
  answer: string;
}

interface FAQJsonLdProps {
  questions: FAQQuestion[];
  /** Script element id; override when a page carries more than one FAQ block. */
  id?: string;
}

export function FAQJsonLd({
  questions,
  id = "faq-jsonld",
}: Readonly<FAQJsonLdProps>) {
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return <JsonLdScript id={id} data={faqPage} />;
}

// ─── ItemList (for listing pages) ─────────────────────────────────────
interface ItemListJsonLdProps {
  name: string;
  description: string;
  url: string;
  items: Array<{
    name: string;
    url: string;
    position: number;
  }>;
}

export function ItemListJsonLd({
  name,
  description,
  url,
  items,
}: Readonly<ItemListJsonLdProps>) {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    url: `${siteConfig.url}${url}`,
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      url: `${siteConfig.url}${item.url}`,
    })),
  };

  return <JsonLdScript id="itemlist-jsonld" data={itemList} />;
}

// ─── Entity articles (deities, heroes, creatures, artifacts, places) ──
//
// Each entry page is an Article *about* its subject. The subject is typed
// honestly: mythological figures, creatures and objects are `Thing`s (never
// `Person` or `Product`, which would assert that they are real people or goods
// for sale), and a location is a `Place` only when it is a physical site or a
// mythic place tradition ties to one. `geo` is emitted only for places the
// catalog marks as physically located, never for a mythic realm or for a later
// identification of one.

/** A primary or secondary work the entry cites (see sources.json). */
export interface CitedWork {
  title: string;
  author?: string;
  /** Path of the work's page on this site, e.g. "/sources/odyssey". */
  url?: string;
}

/** Authors that are editorial labels rather than a named individual. */
function isNamedAuthor(author: string | undefined): author is string {
  if (!author) return false;
  return !/^(anonymous|various)\b/i.test(author.trim());
}

function citedWorkJsonLd(work: CitedWork): Record<string, unknown> {
  const out: Record<string, unknown> = { "@type": "Book", name: work.title };
  if (isNamedAuthor(work.author)) {
    out.author = { "@type": "Person", name: work.author };
  }
  if (work.url) out.url = `${siteConfig.url}${work.url}`;
  return out;
}

interface EntityArticleInput {
  name: string;
  description: string;
  url: string;
  image?: string | null;
  alternateNames?: string[];
  keywords?: string[];
  /** "Deity in Greek tradition": what the subject is, in a few words. */
  disambiguatingDescription: string;
  citations?: CitedWork[];
  about: Record<string, unknown>;
}

function entityArticle({
  name,
  description,
  url,
  image,
  alternateNames,
  keywords,
  disambiguatingDescription,
  citations,
  about,
}: EntityArticleInput): Record<string, unknown> {
  const pageUrl = `${siteConfig.url}${url}`;
  const subject: Record<string, unknown> = {
    ...about,
    "@id": `${pageUrl}#subject`,
    name,
    description,
    disambiguatingDescription,
    url: pageUrl,
  };
  if (alternateNames && alternateNames.length > 0) {
    subject.alternateName = alternateNames;
  }
  if (image) subject.image = `${siteConfig.url}${image}`;

  const article: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${pageUrl}#article`,
    headline: name,
    description,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    inLanguage: "en",
    about: subject,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
  if (image) article.image = `${siteConfig.url}${image}`;
  if (keywords && keywords.length > 0) article.keywords = keywords;
  if (citations && citations.length > 0) {
    article.citation = citations.map(citedWorkJsonLd);
  }
  return article;
}

interface FigureJsonLdProps {
  name: string;
  description: string;
  url: string;
  image?: string | null;
  alternateNames?: string[];
  /** Tradition label, e.g. "Greek". */
  tradition?: string;
  citations?: CitedWork[];
}

function kindIn(kind: string, tradition: string | undefined): string {
  return tradition ? `${kind} in ${tradition} tradition` : kind;
}

interface DeityJsonLdProps extends FigureJsonLdProps {
  domains?: string[];
}

/** A deity: an Article about a `Thing` (a figure of myth, not a Person). */
export function DeityJsonLd({
  domains,
  tradition,
  ...props
}: Readonly<DeityJsonLdProps>) {
  return (
    <JsonLdScript
      id="deity-jsonld"
      data={entityArticle({
        ...props,
        keywords: domains,
        disambiguatingDescription: kindIn("Deity", tradition),
        about: { "@type": "Thing" },
      })}
    />
  );
}

/** A legendary hero: an Article about a `Thing`, never a historical Person. */
export function HeroJsonLd({
  tradition,
  ...props
}: Readonly<FigureJsonLdProps>) {
  return (
    <JsonLdScript
      id="hero-jsonld"
      data={entityArticle({
        ...props,
        disambiguatingDescription: kindIn("Legendary hero", tradition),
        about: { "@type": "Thing" },
      })}
    />
  );
}

interface CreatureJsonLdProps extends FigureJsonLdProps {
  abilities?: string[];
}

export function CreatureJsonLd({
  abilities,
  tradition,
  ...props
}: Readonly<CreatureJsonLdProps>) {
  return (
    <JsonLdScript
      id="creature-jsonld"
      data={entityArticle({
        ...props,
        keywords: abilities,
        disambiguatingDescription: kindIn("Mythological creature", tradition),
        about: { "@type": "Thing" },
      })}
    />
  );
}

interface ArtifactJsonLdProps extends FigureJsonLdProps {
  powers?: string[];
  artifactType?: string;
}

export function ArtifactJsonLd({
  powers,
  tradition,
  artifactType,
  ...props
}: Readonly<ArtifactJsonLdProps>) {
  const kind = artifactType
    ? `Mythological ${artifactType.replaceAll("_", " ")}`
    : "Mythological object";
  return (
    <JsonLdScript
      id="artifact-jsonld"
      data={entityArticle({
        ...props,
        keywords: powers,
        disambiguatingDescription: kindIn(kind, tradition),
        about: { "@type": "Thing" },
      })}
    />
  );
}

interface PlaceJsonLdProps extends FigureJsonLdProps {
  latitude?: number | null;
  longitude?: number | null;
  /**
   * The catalog's geography class: "physical" (a real place), "identified"
   * (a mythic place later identified with a real one) or "mythic".
   */
  geography?: string;
  locationType?: string;
}

/** Schema.org subject for a catalog location (exported for tests). */
export function placeSubject({
  geography,
  latitude,
  longitude,
  locationType,
}: Pick<
  PlaceJsonLdProps,
  "geography" | "latitude" | "longitude" | "locationType"
>): { about: Record<string, unknown>; kind: string } {
  const type = (locationType ?? "place").replaceAll("_", " ");
  if (geography === "physical") {
    const about: Record<string, unknown> = { "@type": "Place" };
    if (latitude != null && longitude != null) {
      about.geo = { "@type": "GeoCoordinates", latitude, longitude };
    }
    return { about, kind: `Real ${type}` };
  }
  if (geography === "identified") {
    return {
      about: { "@type": "Place" },
      kind: `Mythic ${type} traditionally identified with a real site`,
    };
  }
  return { about: { "@type": "Thing" }, kind: `Mythic ${type}` };
}

export function PlaceJsonLd({
  latitude,
  longitude,
  geography,
  locationType,
  tradition,
  ...props
}: Readonly<PlaceJsonLdProps>) {
  const { about, kind } = placeSubject({
    geography,
    latitude,
    longitude,
    locationType,
  });
  return (
    <JsonLdScript
      id="place-jsonld"
      data={entityArticle({
        ...props,
        disambiguatingDescription: kindIn(kind, tradition),
        about,
      })}
    />
  );
}

// ─── Book (primary and secondary sources) ────────────────────────────
interface SourceWorkJsonLdProps {
  title: string;
  description: string;
  url: string;
  author?: string;
  language?: string;
  translators?: string[];
  /** Figures of this atlas who appear in the work. */
  characters?: Array<{ name: string; url: string }>;
}

export function SourceWorkJsonLd({
  title,
  description,
  url,
  author,
  language,
  translators,
  characters,
}: Readonly<SourceWorkJsonLdProps>) {
  const pageUrl = `${siteConfig.url}${url}`;
  const book: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `${pageUrl}#work`,
    name: title,
    description,
    url: pageUrl,
  };
  if (isNamedAuthor(author)) {
    book.author = { "@type": "Person", name: author };
  } else if (author) {
    book.creditText = author;
  }
  if (language) book.inLanguage = language;
  if (translators && translators.length > 0) {
    book.workTranslation = translators.map((name) => ({
      "@type": "Book",
      name: `${title} (trans. ${name})`,
      translator: { "@type": "Person", name },
    }));
  }
  if (characters && characters.length > 0) {
    book.character = characters.map((c) => ({
      "@type": "Thing",
      name: c.name,
      url: `${siteConfig.url}${c.url}`,
    }));
  }
  return <JsonLdScript id="source-jsonld" data={book} />;
}

// ─── Guide (editorial hub) ───────────────────────────────────────────
interface GuideJsonLdProps {
  headline: string;
  description: string;
  url: string;
  /** Named subjects of the guide (entries in this atlas). */
  about?: Array<{ name: string; url: string }>;
  citations?: CitedWork[];
}

export function GuideJsonLd({
  headline,
  description,
  url,
  about,
  citations,
}: Readonly<GuideJsonLdProps>) {
  const pageUrl = `${siteConfig.url}${url}`;
  const guide: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${pageUrl}#article`,
    headline,
    description,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    inLanguage: "en",
    image: `${pageUrl}/opengraph-image`,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
  if (about && about.length > 0) {
    guide.about = about.map((a) => ({
      "@type": "Thing",
      name: a.name,
      url: `${siteConfig.url}${a.url}`,
    }));
  }
  if (citations && citations.length > 0) {
    guide.citation = citations.map(citedWorkJsonLd);
  }
  return <JsonLdScript id="guide-jsonld" data={guide} />;
}
