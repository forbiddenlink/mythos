import Script from 'next/script'

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

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
    />
  )
}

interface ArticleJsonLdProps {
  headline: string
  description: string
  image?: string
  datePublished?: string
  dateModified?: string
  author?: string
}

export function ArticleJsonLd({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author = 'Mythos Atlas',
}: ArticleJsonLdProps) {
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image: image || '/og-image.png',
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: author,
    },
  }

  return (
    <Script
      id="article-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
    />
  )
}
