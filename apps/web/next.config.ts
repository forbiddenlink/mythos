import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";

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
  // Pass through NEXT_PUBLIC_ORACLE_ENABLED from environment, defaulting to "true" in CI
  env: {
    NEXT_PUBLIC_ORACLE_ENABLED:
      process.env.NEXT_PUBLIC_ORACLE_ENABLED ||
      (process.env.CI === "true" ? "true" : "false"),
  },
  // NOTE: viewTransition is experimental and was causing navigation to fail
  // (links would preventDefault but navigation wouldn't complete)
  // Disabled until the feature is stable in Next.js
  // experimental: {
  //   viewTransition: true,
  // },
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
        hostname: "images.unsplash.com",
        pathname: "/**",
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
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Some production-only analytics/vitals dependencies bootstrap via
              // blob-backed worker scripts. Keep worker support explicit rather
              // than broadening other resource directives.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https:",
              "worker-src 'self' blob:",
              "media-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
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
