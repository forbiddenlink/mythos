import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/bookmarks', '/progress', '/review', '/api/'],
      },
    ],
    sitemap: 'https://mythos-web-seven.vercel.app/sitemap.xml',
  }
}
