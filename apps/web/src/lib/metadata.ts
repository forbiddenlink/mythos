import type { Metadata } from 'next'

export const siteConfig = {
  name: 'Mythos Atlas',
  description: 'Explore ancient mythology through interactive deity family trees, cultural maps, and epic story timelines from civilizations around the world.',
  url: 'https://mythosatlas.com', // Update with actual domain
  ogImage: '/og-image.png',
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
}: {
  title: string
  description?: string
  image?: string
  type?: 'website' | 'article'
  url?: string
}): Metadata {
  const desc = description || siteConfig.description
  const ogImage = image || siteConfig.ogImage
  const pageUrl = url ? `${siteConfig.url}${url}` : siteConfig.url

  return {
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description: desc,
    keywords: [
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
    ],
    authors: [
      {
        name: siteConfig.name,
      },
    ],
    creator: siteConfig.name,
    openGraph: {
      type,
      locale: 'en_US',
      url: pageUrl,
      title,
      description: desc,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
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
