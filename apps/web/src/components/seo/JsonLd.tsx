import Script from 'next/script'
import { siteConfig } from '@/lib/metadata'

// ─── Helper ──────────────────────────────────────────────────────────
// JSON-LD script injection is safe here: all data is constructed from
// our own trusted data structures, never from user input.
function JsonLdScript({ id, data }: { id: string; data: Record<string, unknown> }) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// ─── BreadcrumbList ──────────────────────────────────────────────────
interface BreadcrumbItem {
  name: string
  item: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbJsonLd({ items }: BreadcrumbProps) {
  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  }

  return <JsonLdScript id="breadcrumb-jsonld" data={breadcrumbList} />
}

// ─── WebSite (homepage) ──────────────────────────────────────────────
interface WebSiteJsonLdProps {
  searchActionTarget?: string
}

export function WebSiteJsonLd({ searchActionTarget }: WebSiteJsonLdProps) {
  const website: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      '@type': 'Person',
      name: siteConfig.creator,
    },
  }

  if (searchActionTarget) {
    website.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: searchActionTarget,
      },
      'query-input': 'required name=search_term_string',
    }
  }

  return <JsonLdScript id="website-jsonld" data={website} />
}

// ─── Article (stories, deity articles) ───────────────────────────────
interface ArticleJsonLdProps {
  headline: string
  description: string
  image?: string
  datePublished?: string
  dateModified?: string
  author?: string
  section?: string
  tags?: string[]
  url?: string
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
}: ArticleJsonLdProps) {
  const article: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image: image ? `${siteConfig.url}${image}` : `${siteConfig.url}/og-image.png`,
    datePublished: datePublished || '2026-01-01T00:00:00Z',
    dateModified: dateModified || '2026-02-01T00:00:00Z',
    author: {
      '@type': 'Organization',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  }

  if (url) article.url = `${siteConfig.url}${url}`
  if (section) article.articleSection = section
  if (tags && tags.length > 0) article.keywords = tags

  return <JsonLdScript id="article-jsonld" data={article} />
}

// ─── Deity (Person schema for mythological figure) ───────────────────
interface DeityJsonLdProps {
  name: string
  description: string
  alternateNames?: string[]
  domains?: string[]
  url: string
  image?: string
}

export function DeityJsonLd({
  name,
  description,
  alternateNames,
  domains,
  url,
  image,
}: DeityJsonLdProps) {
  const deity: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Person', 'Article'],
    name,
    description,
    url: `${siteConfig.url}${url}`,
    headline: name,
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    datePublished: '2026-01-01T00:00:00Z',
    dateModified: '2026-02-01T00:00:00Z',
  }

  if (alternateNames && alternateNames.length > 0) {
    deity.alternateName = alternateNames
  }
  if (domains && domains.length > 0) {
    deity.keywords = domains
    deity.knowsAbout = domains
  }
  if (image) {
    deity.image = `${siteConfig.url}${image}`
  }

  return <JsonLdScript id="deity-jsonld" data={deity} />
}

// ─── CollectionPage (pantheons listing, deities listing) ─────────────
interface CollectionPageJsonLdProps {
  name: string
  description: string
  url: string
  numberOfItems?: number
}

export function CollectionPageJsonLd({
  name,
  description,
  url,
  numberOfItems,
}: CollectionPageJsonLdProps) {
  const collection: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: `${siteConfig.url}${url}`,
    isPartOf: {
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  }

  if (numberOfItems !== undefined) {
    collection.mainEntity = {
      '@type': 'ItemList',
      numberOfItems,
    }
  }

  return <JsonLdScript id="collection-jsonld" data={collection} />
}

// ─── Quiz ────────────────────────────────────────────────────────────
interface QuizJsonLdProps {
  name: string
  description: string
  url: string
}

export function QuizJsonLd({ name, description, url }: QuizJsonLdProps) {
  const quiz = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name,
    description,
    url: `${siteConfig.url}${url}`,
    educationalAlignment: {
      '@type': 'AlignmentObject',
      alignmentType: 'educationalSubject',
      targetName: 'World Mythology',
    },
    about: {
      '@type': 'Thing',
      name: 'Ancient Mythology',
    },
    provider: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  }

  return <JsonLdScript id="quiz-jsonld" data={quiz} />
}

// ─── AboutPage ───────────────────────────────────────────────────────
interface AboutPageJsonLdProps {
  creatorName: string
  creatorDescription: string
}

export function AboutPageJsonLd({
  creatorName,
  creatorDescription,
}: AboutPageJsonLdProps) {
  const aboutPage = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${siteConfig.name}`,
    description: `Learn about ${siteConfig.name}, an interactive encyclopedia of ancient mythology.`,
    url: `${siteConfig.url}/about`,
    mainEntity: {
      '@type': 'Person',
      name: creatorName,
      description: creatorDescription,
      jobTitle: 'Developer',
    },
    isPartOf: {
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  }

  return <JsonLdScript id="about-jsonld" data={aboutPage} />
}

// ─── WebApplication (family tree) ────────────────────────────────────
interface WebApplicationJsonLdProps {
  name: string
  description: string
  url: string
}

export function WebApplicationJsonLd({
  name,
  description,
  url,
}: WebApplicationJsonLdProps) {
  const app = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url: `${siteConfig.url}${url}`,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  }

  return <JsonLdScript id="webapp-jsonld" data={app} />
}
