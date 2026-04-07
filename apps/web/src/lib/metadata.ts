import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";

export const siteConfig = {
  name: "Mythos Atlas",
  description:
    "Explore ancient mythology through interactive deity family trees, cultural maps, and epic story timelines from civilizations around the world.",
  url: "https://mythosatlas.com",
  ogImage: "/og-image.png",
  creator: "Elizabeth Stein",
  links: {
    twitter: "https://twitter.com/mythosatlas",
    github: "https://github.com/forbiddenlink/mythos",
  },
};

/** Map UI locale to Open Graph locale (cookie-based locale; URLs are not locale-prefixed). */
export function localeToOpenGraphLocale(locale: string): string {
  const map: Record<Locale, string> = {
    en: "en_US",
    es: "es_ES",
    fr: "fr_FR",
    de: "de_DE",
  };
  return (map as Record<string, string>)[locale] ?? "en_US";
}

/** Same canonical URL for all languages (locale chosen via cookie / UI). */
export function buildHreflangAlternates(path: string): Record<string, string> {
  const base = siteConfig.url;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const full = `${base}${normalized}`;
  return {
    en: full,
    es: full,
    fr: full,
    de: full,
    "x-default": full,
  };
}

export function generateBaseMetadata({
  title,
  description,
  image,
  type = "website",
  url,
  keywords,
  articleSection,
  articleTags,
  locale = "en",
}: {
  title: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  url?: string;
  keywords?: string[];
  articleSection?: string;
  articleTags?: string[];
  /** UI locale for og:locale (hreflang still lists all locales for the same URL). */
  locale?: string;
}): Metadata {
  const desc = description || siteConfig.description;
  const ogImage = image || siteConfig.ogImage;
  const pageUrl = url ? `${siteConfig.url}${url}` : siteConfig.url;
  const pathForAlternates = url || "/";
  const ogLocale = localeToOpenGraphLocale(locale);

  const baseKeywords = [
    "mythology",
    "ancient gods",
    "deities",
    "greek mythology",
    "norse mythology",
    "egyptian mythology",
    "family tree",
    "pantheon",
    "stories",
    "legends",
    "encyclopedia",
  ];

  const allKeywords = keywords
    ? [...new Set([...keywords, ...baseKeywords])]
    : baseKeywords;

  const ogImages = [
    {
      url: ogImage,
      width: 1200,
      height: 630,
      alt: title,
    },
  ];

  const ogMetadata: Metadata["openGraph"] =
    type === "article"
      ? {
          type: "article",
          locale: ogLocale,
          url: pageUrl,
          title,
          description: desc,
          siteName: siteConfig.name,
          images: ogImages,
          section: articleSection,
          tags: articleTags,
        }
      : {
          type: "website",
          locale: ogLocale,
          url: pageUrl,
          title,
          description: desc,
          siteName: siteConfig.name,
          images: ogImages,
        };

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
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogImage],
      creator: "@mythosatlas",
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: pageUrl,
      languages: buildHreflangAlternates(pathForAlternates),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
