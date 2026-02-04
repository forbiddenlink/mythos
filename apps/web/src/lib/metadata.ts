import type { Metadata } from 'next'

export const siteConfig = {
  name: 'Mythos Atlas',
  description: 'Explore ancient mythology through interactive deity family trees, cultural maps, and epic story timelines from civilizations around the world.',
  url: 'https://mythos-web-seven.vercel.app',
  ogImage: '/og-image.png',
  creator: 'Elizabeth Stein',
  links: {
    twitter: 'https://twitter.com/mythosatlas',
    github: 'https://github.com/yourusername/mythos-atlas',
  },
}

export function generateBaseMetadata({
  title,
  description,
  image,
  type = 'website',
  url,
  keywords,
  articleSection,
  articleTags,
}: {
  title: string
  description?: string
  image?: string
  type?: 'website' | 'article'
  url?: string
  keywords?: string[]
  articleSection?: string
  articleTags?: string[]
}): Metadata {
  const desc = description || siteConfig.description
  const ogImage = image || siteConfig.ogImage
  const pageUrl = url ? `${siteConfig.url}${url}` : siteConfig.url

  const baseKeywords = [
    'mythology',
    'ancient gods',
    'deities',
    'greek mythology',
    'norse mythology',
    'egyptian mythology',
    'family tree',
    'pantheon',
    'stories',
    'legends',
    'encyclopedia',
  ]

  const allKeywords = keywords
    ? [...new Set([...keywords, ...baseKeywords])]
    : baseKeywords

  const ogImages = [
    {
      url: ogImage,
      width: 1200,
      height: 630,
      alt: title,
    },
  ]

  const ogMetadata: Metadata['openGraph'] =
    type === 'article'
      ? {
          type: 'article',
          locale: 'en_US',
          url: pageUrl,
          title,
          description: desc,
          siteName: siteConfig.name,
          images: ogImages,
          section: articleSection,
          tags: articleTags,
        }
      : {
          type: 'website',
          locale: 'en_US',
          url: pageUrl,
          title,
          description: desc,
          siteName: siteConfig.name,
          images: ogImages,
        }

  return {
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description: desc,
    keywords: allKeywords,
    authors: [
      {
        name: siteConfig.creator,
      },
    ],
    creator: siteConfig.creator,
    publisher: siteConfig.name,
    openGraph: ogMetadata,
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [ogImage],
      creator: '@mythosatlas',
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}
