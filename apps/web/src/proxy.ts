import { defaultLocale, isValidLocale } from "@/i18n/config";
import { canonicalEntityPath } from "@/lib/entity-redirects";
import {
  buildCsp,
  hashesForPath,
  type CspManifest,
  type CspMode,
} from "@/lib/csp";
import { NextResponse, type NextRequest } from "next/server";

let manifestPromise: Promise<CspManifest | null> | null = null;
let warnedDegraded = false;

/**
 * The build's inline-script hash manifest (scripts/csp-hashes.mjs), loaded
 * once per server instance: from the build directory when it is on this
 * filesystem (`next start`), otherwise from the copy served as a public file.
 */
function loadCspManifest(origin: string): Promise<CspManifest | null> {
  manifestPromise ??= (async () => {
    try {
      const { readFile } = await import("node:fs/promises");
      const { join } = await import("node:path");
      const text = await readFile(
        join(process.cwd(), ".next", "csp-manifest.json"),
        "utf8",
      );
      return JSON.parse(text) as CspManifest;
    } catch {
      // not on this filesystem; try the public copy
    }
    try {
      const res = await fetch(new URL("/csp-manifest.json", origin), {
        cache: "no-store",
      });
      if (res.ok) return (await res.json()) as CspManifest;
    } catch {
      // fall through
    }
    return null;
  })().then((manifest) => {
    // Retry on a later request rather than caching a failure forever.
    if (!manifest) manifestPromise = null;
    return manifest;
  });
  return manifestPromise;
}

async function cspFor(
  request: NextRequest,
  nonce: string,
): Promise<{ csp: string; mode: CspMode }> {
  if (process.env.NODE_ENV === "development") {
    return {
      csp: buildCsp({ mode: "development", nonce }),
      mode: "development",
    };
  }
  const manifest = await loadCspManifest(request.nextUrl.origin);
  if (!manifest) {
    if (!warnedDegraded) {
      warnedDegraded = true;
      console.error(
        "[csp] csp-manifest.json unavailable; serving degraded script-src with 'unsafe-inline'",
      );
    }
    return { csp: buildCsp({ mode: "degraded", nonce }), mode: "degraded" };
  }
  return {
    csp: buildCsp({
      mode: "strict",
      nonce,
      hashes: hashesForPath(manifest, request.nextUrl.pathname),
    }),
    mode: "strict",
  };
}

// Cookie-based locale detection + CSP (build-time hashes for static pages,
// per-request nonce for dynamically rendered ones).
export async function proxy(request: NextRequest) {
  // Entity aliases (ids, alternate names, casing) → canonical prerendered page.
  const canonical = canonicalEntityPath(request.nextUrl.pathname);
  if (canonical) {
    const url = request.nextUrl.clone();
    url.pathname = canonical;
    return NextResponse.redirect(url, 307);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const { csp, mode } = await cspFor(request, nonce);

  // Thread the nonce + CSP through the request headers so Next applies the
  // nonce to its own framework scripts, then also set the CSP on the response.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  if (mode === "degraded") response.headers.set("x-csp-mode", "degraded");

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
      secure: process.env.NODE_ENV === "production",
      // Not httpOnly: LanguageSwitcher rewrites this cookie via document.cookie,
      // and browsers reject script writes that would replace an HttpOnly cookie.
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|monitoring|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|manifest.json|csp-manifest.json|sw.js|workbox-.*|robots.txt|sitemap.xml).*)",
  ],
};
