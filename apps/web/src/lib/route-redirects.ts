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
];
