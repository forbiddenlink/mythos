import type { MetadataRoute } from "next";
import deities from "@/data/deities.json";
import stories from "@/data/stories.json";
import pantheons from "@/data/pantheons.json";
import creatures from "@/data/creatures.json";
import artifacts from "@/data/artifacts.json";
import journeys from "@/data/journeys.json";
import locations from "@/data/locations.json";
import collections from "@/data/collections.json";
import heroes from "@/data/heroes.json";
import sources from "@/data/sources.json";
import { getDeityComparisons } from "@/lib/comparisons";
import { isOracleEnabled } from "@/lib/oracle/availability";

const BASE_URL = "https://mythosatlas.com";

const STUDY_GUIDES = [
  "inanna-text-and-temple",
  "ibeji-objects-and-remembrance",
  "greek-gods",
  "norse-mythology",
  "comparative-mythology",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  // Omit lastModified until the catalog records actual editorial update dates.

  // Static pages - core navigation
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/support`, changeFrequency: "monthly", priority: 0.3 },
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/deities`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/heroes`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/stories`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/pantheons`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/creatures`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/artifacts`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/family-tree`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/cosmology`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/timeline`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/quiz`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/quiz/personality`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/quiz/relationships`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/quiz/quick`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/stories/interactive`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/games`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/games/memory`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/locations`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/journeys`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/knowledge-graph`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Listed only while the Oracle is switched on (see src/lib/oracle/availability.ts).
    ...(isOracleEnabled()
      ? [
          {
            url: `${BASE_URL}/oracle`,
            changeFrequency: "monthly" as const,
            priority: 0.6,
          },
        ]
      : []),
    {
      url: `${BASE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contact`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/compare`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/compare/myths`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/divine-domains`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/paths`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/achievements`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/changelog`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/sources`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/facts`,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  // Deity pages
  const deityPages: MetadataRoute.Sitemap = deities.map((deity) => ({
    url: `${BASE_URL}/deities/${deity.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Hero pages
  const heroPages: MetadataRoute.Sitemap = heroes.map((hero) => ({
    url: `${BASE_URL}/heroes/${hero.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  // Source detail pages
  const sourcePages: MetadataRoute.Sitemap = sources.map((source) => ({
    url: `${BASE_URL}/sources/${source.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Story pages
  const storyPages: MetadataRoute.Sitemap = stories.map((story) => ({
    url: `${BASE_URL}/stories/${story.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Pantheon pages
  const pantheonPages: MetadataRoute.Sitemap = pantheons.map((pantheon) => ({
    url: `${BASE_URL}/pantheons/${pantheon.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Creature pages
  const creaturePages: MetadataRoute.Sitemap = creatures.map((creature) => ({
    url: `${BASE_URL}/creatures/${creature.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Artifact pages
  const artifactPages: MetadataRoute.Sitemap = artifacts.map((artifact) => ({
    url: `${BASE_URL}/artifacts/${artifact.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Journey pages
  const journeyPages: MetadataRoute.Sitemap = journeys.map((journey) => ({
    url: `${BASE_URL}/journeys/${journey.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Location pages
  const locationPages: MetadataRoute.Sitemap = locations.map((location) => ({
    url: `${BASE_URL}/locations/${location.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Collection pages
  const collectionPages: MetadataRoute.Sitemap = collections.map(
    (collection) => ({
      url: `${BASE_URL}/collections/${collection.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }),
  );

  // Head-to-head comparison pages. The /compare tool itself is client-rendered
  // behind query params, so these static routes are the only crawlable form.
  const comparisonPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/compare/pairs`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    ...getDeityComparisons().map((comparison) => ({
      url: `${BASE_URL}/compare/${comparison.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  const studyPages: MetadataRoute.Sitemap = STUDY_GUIDES.map((slug) => ({
    url: `${BASE_URL}/study/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  return [
    ...staticPages,
    ...studyPages,
    ...comparisonPages,
    ...deityPages,
    ...heroPages,
    ...storyPages,
    ...pantheonPages,
    ...creaturePages,
    ...artifactPages,
    ...journeyPages,
    ...locationPages,
    ...collectionPages,
    ...sourcePages,
  ];
}
