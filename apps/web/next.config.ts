import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";
import { CREATURE_ALIASES } from "./src/lib/creature-aliases";
import { ARTIFACT_ALIASES } from "./src/lib/artifact-aliases";
import { LOCATION_ALIASES } from "./src/lib/location-aliases";
import { STORY_ALIASES } from "./src/lib/story-aliases";
import { getReversedComparisonSlugs } from "./src/lib/comparisons";
import { CONSOLIDATION_REDIRECTS } from "./src/lib/route-redirects";

const withNextIntl = createNextIntlPlugin("./i18n.ts");
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// PWA is disabled - next-pwa can cause service worker initialization errors
// If PWA is needed in the future, requires careful service worker configuration
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const withPWA = (config: NextConfig) => config;

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  // Required by the /ingest PostHog proxy below: its API paths end in a slash
  // and Next would otherwise redirect them away before the rewrite applies.
  skipTrailingSlashRedirect: true,
  // NOTE: viewTransition is experimental and was causing navigation to fail
  // (links would preventDefault but navigation wouldn't complete)
  // Disabled until the feature is stable in Next.js
  experimental: {
    // viewTransition: true,
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  // Empty turbopack config to satisfy Next.js 16 when using webpack-based plugins (next-pwa)
  // Production builds use --webpack flag via package.json
  turbopack: {
    root: path.join(__dirname, "../../"),
  },
  outputFileTracingRoot: path.join(__dirname, "../../"),
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      {
        module: /@opentelemetry\/instrumentation|require-in-the-middle/,
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
      {
        module: /require-in-the-middle/,
        message:
          /require function is used in a way in which dependencies cannot be statically extracted/,
      },
    ];
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "collectionapi.metmuseum.org",
        pathname: "/api/collection/v1/iiif/**/main-image",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for static images
  },
  async rewrites() {
    // These are the rewrite targets, so they must stay absolute origins. Reading them from
    // NEXT_PUBLIC_POSTHOG_HOST was a trap: that variable is what the browser points at, and
    // setting it to "/ingest" would have made this rewrite forward /ingest to itself.
    const absolute = (value: string | undefined, fallback: string) =>
      value && /^https?:\/\//.test(value) ? value : fallback;
    const posthogHost = absolute(
      process.env.POSTHOG_INGEST_ORIGIN,
      "https://us.i.posthog.com",
    );
    const posthogAssetHost = absolute(
      process.env.NEXT_PUBLIC_POSTHOG_ASSET_HOST,
      "https://us-assets.i.posthog.com",
    );

    return [
      // Same-origin ingest path. Content blockers drop requests to known
      // analytics hostnames, which silently deletes the data the roadmap is
      // decided from; proxying keeps the traffic first-party and keeps the CSP
      // connect-src at 'self'.
      {
        source: "/ingest/static/:path*",
        destination: `${posthogAssetHost}/static/:path*`,
      },
      {
        // The recorder, surveys and toolbar bundles load from /array, not /static.
        source: "/ingest/array/:path*",
        destination: `${posthogAssetHost}/array/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${posthogHost}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          // Content-Security-Policy is set per request in src/proxy.ts: build-time
          // SHA-256 hashes for prerendered pages plus a per-request nonce for
          // dynamic ones (see src/lib/csp.ts). Reporting-Endpoints stays here
          // since it is static.
          {
            key: "Reporting-Endpoints",
            value: 'csp-endpoint="/api/csp-report"',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      ...CONSOLIDATION_REDIRECTS,
      ...Object.entries(STORY_ALIASES).flatMap(([from, to]) => [
        {
          source: `/stories/${from}`,
          destination: `/stories/${to}`,
          permanent: true,
        },
        {
          source: `/stories/${from}/read`,
          destination: `/stories/${to}/read`,
          permanent: true,
        },
      ]),
      ...Object.entries(CREATURE_ALIASES).map(([from, to]) => ({
        source: `/creatures/${from}`,
        destination: `/creatures/${to}`,
        permanent: true,
      })),
      ...Object.entries(ARTIFACT_ALIASES).map(([from, to]) => ({
        source: `/artifacts/${from}`,
        destination: `/artifacts/${to}`,
        permanent: true,
      })),
      ...Object.entries(LOCATION_ALIASES).map(([from, to]) => ({
        source: `/locations/${from}`,
        destination: `/locations/${to}`,
        permanent: true,
      })),
      ...Object.entries(getReversedComparisonSlugs()).map(([from, to]) => ({
        source: `/compare/${from}`,
        destination: `/compare/${to}`,
        permanent: true,
      })),
    ];
  },
};

// Wrap with all plugins (PWA disabled entirely to prevent service worker initialization errors)
const configWithPlugins = withBundleAnalyzer(withNextIntl(nextConfig));

const hasSentryAuthToken = Boolean(process.env.SENTRY_AUTH_TOKEN);

const sentryOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,
  // Source maps configuration
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: "/monitoring",
  telemetry: false,
};

export default hasSentryAuthToken
  ? withSentryConfig(configWithPlugins, sentryOptions)
  : configWithPlugins;
