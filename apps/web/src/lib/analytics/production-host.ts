import { siteConfig } from "@/lib/metadata";

const PRODUCTION_HOSTNAME = new URL(siteConfig.url).hostname;

/**
 * Analytics record the live site only. Local production builds (including
 * every Playwright run, which pre-accepts cookie consent) inline the same
 * public PostHog key, so without this check test traffic lands in the
 * production project and outnumbers real readers.
 */
export function isProductionHostname(hostname: string): boolean {
  return (
    hostname === PRODUCTION_HOSTNAME ||
    hostname === `www.${PRODUCTION_HOSTNAME}`
  );
}
