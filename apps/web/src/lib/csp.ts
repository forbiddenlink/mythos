/**
 * Content-Security-Policy construction (pure; used by src/proxy.ts).
 *
 * Production script policy, per HTML response:
 *
 *   script-src 'self' 'nonce-<per request>' <sha256 hashes> blob: <vercel>
 *
 * - Statically generated pages carry fixed inline scripts (Next's RSC flight
 *   data, the theme bootstrap). Their SHA-256 hashes come from the build
 *   manifest written by scripts/csp-hashes.mjs, keyed by pathname.
 * - Dynamically rendered responses get Next's per-request nonce, which Next
 *   reads from this header and stamps on its own scripts.
 * - No 'unsafe-inline' and no 'strict-dynamic': external scripts must come
 *   from this origin (served with nosniff) or the one allowlisted host, and
 *   every inline script must match a nonce or a build-time hash.
 *
 * If the manifest cannot be loaded, `buildCsp` degrades to 'unsafe-inline'
 * (without a nonce, which would disable it) so static pages still hydrate;
 * the proxy logs that and marks the response with `x-csp-mode: degraded`.
 */

export interface CspManifest {
  version: 1;
  buildId: string;
  /** Hashes present on every prerendered page. */
  common: string[];
  /** Pathname → hashes for that page beyond `common`. */
  routes: Record<string, string[]>;
}

export type CspMode = "development" | "strict" | "degraded";

const VERCEL_SCRIPTS = "https://va.vercel-scripts.com";

/** "/deities/zeus/" → "/deities/zeus"; "/" stays "/". */
export function normalizeCspPath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.replace(/\/+$/, "") || "/";
  }
  return pathname;
}

/** Hashes allowed for a pathname: common ones plus the page's own, if prerendered. */
export function hashesForPath(
  manifest: CspManifest,
  pathname: string,
): string[] {
  const own = manifest.routes[normalizeCspPath(pathname)];
  // Unknown paths may render the static not-found page.
  const extra = own ?? manifest.routes["/_not-found"] ?? [];
  return [...manifest.common, ...extra];
}

export function buildScriptSrc(options: {
  mode: CspMode;
  nonce: string;
  hashes?: readonly string[];
}): string {
  const { mode, nonce, hashes = [] } = options;
  if (mode === "development") {
    return `'self' 'unsafe-inline' 'unsafe-eval' blob: ${VERCEL_SCRIPTS}`;
  }
  if (mode === "degraded") {
    return `'self' 'unsafe-inline' blob: ${VERCEL_SCRIPTS}`;
  }
  const hashSources = hashes.map((hash) => `'${hash}'`).join(" ");
  return [`'self'`, `'nonce-${nonce}'`, hashSources, "blob:", VERCEL_SCRIPTS]
    .filter(Boolean)
    .join(" ");
}

export function buildCsp(options: {
  mode: CspMode;
  nonce: string;
  hashes?: readonly string[];
}): string {
  // Analytics beacons + Anthropic/Oracle + optional Sentry/Upstash in prod.
  // cdn.jsdelivr.net: browser speechSynthesis voice data / unicode font resolver
  const connectSrc = [
    "'self'",
    "https://va.vercel-scripts.com",
    "https://vitals.vercel-insights.com",
    "https://*.ingest.sentry.io",
    "https://*.upstash.io",
    "https://cdn.jsdelivr.net",
  ].join(" ");

  return [
    "default-src 'self'",
    `script-src ${buildScriptSrc(options)}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "worker-src 'self' blob:",
    "media-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    "report-to csp-endpoint",
  ].join("; ");
}
