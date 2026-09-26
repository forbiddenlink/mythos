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

/** Remove a terminal category label without dropping cultural qualifiers. */
export function shortPantheonName(
  pantheon: { name: string } | undefined,
): string {
  return pantheon?.name.replace(/\s+(?:Pantheon|Tradition)$/, "") ?? "Ancient";
}

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

/** Same canonical URL for all languages (locale chosen via cookie / UI).
 *  Do not emit hreflang for identical URLs — that confuses crawlers when
 *  locale content is not URL-segmented.
 */
export function buildHreflangAlternates(_path: string): Record<string, string> {
  return {};
}

/**
 * Search Console ownership token, emitted as `<meta name="google-site-verification">`.
 *
 * Public by design: Google requires it to be readable in the page source, so it
 * is not a secret. Absent, no tag is emitted and nothing else changes.
 */
export function googleSiteVerification(): string | undefined {
  const token = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  return token ? token : undefined;
}

/** Metadata for soft-missing entity pages — always noindex. */
export function generateNotFoundMetadata(
  title: string,
  description: string,
): Metadata {
  return {
    ...generateBaseMetadata({ title, description }),
    robots: { index: false, follow: false },
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
  /**
   * Share image. `null` leaves og:image and twitter:image unset so the route's
   * `opengraph-image` file supplies them: an explicit image here would
   * override the generated card.
   */
  image?: string | null;
  type?: "website" | "article";
  url?: string;
  keywords?: string[];
  articleSection?: string;
  articleTags?: string[];
  /** UI locale for og:locale (cookie-based; URLs are not locale-prefixed). */
  locale?: string;
}): Metadata {
  const desc = description || siteConfig.description;
  const useRouteImage = image === null;
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

  const ogImages = useRouteImage
    ? undefined
    : [
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
          ...(ogImages ? { images: ogImages } : {}),
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
          ...(ogImages ? { images: ogImages } : {}),
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
      ...(useRouteImage ? {} : { images: [ogImage] }),
      creator: "@mythosatlas",
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: pageUrl,
      ...(Object.keys(buildHreflangAlternates(pathForAlternates)).length > 0
        ? { languages: buildHreflangAlternates(pathForAlternates) }
        : {}),
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
