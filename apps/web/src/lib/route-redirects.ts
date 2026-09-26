/**
 * Permanent redirects for routes retired by the product consolidation
 * (2026-09-26). next.config.ts spreads these into `redirects()`, so every old
 * URL keeps working. Destinations must be pages that exist.
 */
export interface RouteRedirect {
  source: string;
  destination: string;
  permanent: true;
}

function permanent(source: string, destination: string): RouteRedirect {
  return { source, destination, permanent: true };
}

export const CONSOLIDATION_REDIRECTS: readonly RouteRedirect[] = [
  // "Your Stats" was a local-only leaderboard; it now lives on /progress.
  permanent("/leaderboard", "/progress"),

  // Guided tours merged into journeys. Three tours duplicated a journey; the
  // Nine Realms and Duat tours became otherworld journeys.
  permanent("/tours", "/journeys"),
  permanent("/tours/odyssey", "/journeys/odyssey"),
  permanent("/tours/argonauts", "/journeys/golden-fleece"),
  permanent("/tours/heracles-labors", "/journeys/twelve-labors"),
  permanent("/tours/norse-realms", "/journeys/nine-realms"),
  permanent("/tours/egyptian-afterlife", "/journeys/duat-night-journey"),
  permanent("/tours/:path*", "/journeys"),

  // Learning paths, collections and study guides share one hub, /paths.
  // Detail pages (/collections/[slug], /study/[slug]) keep their URLs.
  permanent("/learning-paths", "/paths#reading-paths"),
  permanent("/collections", "/paths#collections"),
  permanent("/study", "/paths#study-guides"),
];
