import { defaultLocale, isValidLocale } from "@/i18n/config";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Build the per-request Content-Security-Policy.
 *
 * Production locks scripts to a per-request nonce plus 'strict-dynamic'
 * (browsers then ignore 'unsafe-inline' and the host allowlist, trusting
 * only nonced scripts and what they load). 'unsafe-eval' is kept for now
 * (see note below). Development stays permissive because Next's HMR /
 * react-refresh need inline + eval.
 */
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  // Production: nonce + 'strict-dynamic' removes 'unsafe-inline' (the primary
  // XSS lever). 'unsafe-eval' is kept for now because some third-party libs
  // (Sentry, particle/animation engines) may use eval internally; dropping it
  // needs a browser check first. Dev keeps inline for HMR.
  //
  // Allow Vercel Analytics / Speed Insights script hosts in both envs so the
  // injected <Script> tags are not blocked by CSP (seen as console errors).
  const vercelScripts = "https://va.vercel-scripts.com";
  const scriptSrc = isDev
    ? `'self' 'unsafe-inline' 'unsafe-eval' blob: ${vercelScripts}`
    : `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' blob: ${vercelScripts}`;

  // Analytics beacons + Anthropic/Oracle + optional Sentry/Upstash in prod.
  const connectSrc = [
    "'self'",
    "https://va.vercel-scripts.com",
    "https://vitals.vercel-insights.com",
    "https://*.ingest.sentry.io",
    "https://*.upstash.io",
  ].join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
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

// Cookie-based locale detection + per-request nonce CSP.
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  // Thread the nonce + CSP through the request headers so Next applies the
  // nonce to its own framework scripts, then also set the CSP on the response.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);

  const localeCookie = request.cookies.get("locale")?.value;

  if (!localeCookie || !isValidLocale(localeCookie)) {
    const acceptLanguage = request.headers.get("accept-language");
    let detectedLocale = defaultLocale;

    if (acceptLanguage) {
      const languages = acceptLanguage
        .split(",")
        .map((lang) => {
          const [code, q = "q=1"] = lang.trim().split(";");
          return {
            code: code.split("-")[0].toLowerCase(),
            quality: Number.parseFloat(q.replace("q=", "")) || 1,
          };
        })
        .sort((a, b) => b.quality - a.quality);

      for (const lang of languages) {
        if (isValidLocale(lang.code)) {
          detectedLocale = lang.code;
          break;
        }
      }
    }

    response.cookies.set("locale", detectedLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|monitoring|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|manifest.json|sw.js|workbox-.*|robots.txt|sitemap.xml).*)",
  ],
};
