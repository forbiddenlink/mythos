import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";
import { getReversedComparisonSlugs } from "./src/lib/comparisons";
import { CONSOLIDATION_REDIRECTS } from "./src/lib/route-redirects";
import { aliasRedirects } from "./src/lib/slug-aliases";

const withNextIntl = createNextIntlPlugin("./i18n.ts");
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// PWA is disabled - next-pwa can cause service worker initialization errors
// If PWA is needed in the future, requires careful service worker configuration
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const withPWA = (config: NextConfig) => config;

const nextConfig: NextConfig = {
  ...(process.env.NEXT_ADAPTER_PATH
    ? { adapterPath: path.join(__dirname, "scripts/csp-adapter.mjs") }
    : {}),
  devIndicators: false,
  poweredByHeader: false,
  // Required by the /ingest PostHog proxy (src/app/ingest/[...path]/route.ts, a route handler
  // rather than a rewrite so cookies are never forwarded): its API paths end in a slash and
  // Next would otherwise redirect them away.
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
  // lib/og/card.tsx reads the Cinzel font with readFileSync at request time. The tracer does
  // not follow that path, so functions shipped without the font and failed with ENOENT. Next
  // also bundles the card into ordinary pages (via metadata images), so every route gets it,
  // not only opengraph-image ones (/changelog failed the same way). It is 75 KB.
  outputFileTracingIncludes: {
    "/**": [
      "./src/app/fonts/cinzel-og-700.ttf",
      "./src/app/fonts/crimson-pro-og-400.woff",
    ],
  },
  webpack: (config) => {
    // Next 16.3.8 embeds this ID in font CSS but omits it from its cache version.
    // Restored builds must not reuse font URLs from a previous deployment.
    if (
      process.env.NEXT_DEPLOYMENT_ID &&
      config.cache &&
      config.cache.type === "filesystem"
    ) {
      config.cache.version = `${config.cache.version ?? ""}|deployment:${process.env.NEXT_DEPLOYMENT_ID}`;
    }
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
        hostname: "images.metmuseum.org",
        pathname: "/CRDImages/**",
      },
      {
        protocol: "https",
        hostname: "collectionapi.metmuseum.org",
        pathname: "/api/collection/v1/iiif/**/main-image",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for static images
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
      {
        // Static files skip src/proxy.ts (see its matcher), so they never get the
        // per-request CSP. Give them a locked-down policy instead: an SVG opened
        // directly can run script, and any page route that ends in one of these
        // extensions would otherwise be served with no CSP at all. Keep this
        // extension list in sync with the proxy matcher.
        source: "/:file(.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|mp3|woff2?))",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; frame-ancestors 'none'; sandbox",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      ...CONSOLIDATION_REDIRECTS,
      ...aliasRedirects(),
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
