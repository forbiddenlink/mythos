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
export function normalizeCspPath(pathname: string): {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.replace(/\/+$/, "") || "/";
  }
  return pathname;
}
