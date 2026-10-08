#!/usr/bin/env node
/**
 * Post-build: hash every inline <script> in the prerendered HTML so the proxy
 * can serve a strict, hash-based Content-Security-Policy for static pages.
 *
 * Why: a per-request nonce only works for dynamically rendered pages (the
 * nonce must be injected at render time), and requiring one had turned every
 * route dynamic. Static HTML is fixed at build time, so its inline scripts
 * (Next's RSC flight data, the theme bootstrap) can be allowlisted by SHA-256
 * instead. Runs as part of `pnpm build`; see src/lib/csp.ts and src/proxy.ts.
 *
 * Output: { version, buildId, common, routes } written to
 *   .next/csp-manifest.json   (read by the proxy from disk)
 *   public/csp-manifest.json  (fallback the proxy fetches when the build
 *                              directory is not on the proxy's filesystem)
 * `common` holds hashes present on every page (also allowed on routes not in
 * the manifest, e.g. dynamically rendered pages); `routes` maps each
 * prerendered pathname to its remaining hashes.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, "..");

const EXECUTABLE_TYPES = new Set([
  "",
  "text/javascript",
  "application/javascript",
  "module",
]);

/** Inline, executable script bodies in document order. */
export function inlineScripts(html) {
  const out = [];
  // Browsers end a script at "</script" followed by whitespace, "/" or ">",
  // so accept any end tag of that shape, e.g. "</script >".
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script\b[^>]*>/gi;
  for (const match of html.matchAll(re)) {
    const attrs = match[1];
    if (/\bsrc\s*=/.test(attrs)) continue;
    const type = /\btype\s*=\s*["']?([^"'\s>]+)/i.exec(attrs)?.[1] ?? "";
    if (!EXECUTABLE_TYPES.has(type.toLowerCase())) continue;
    out.push(match[2]);
  }
  return out;
}

export function sha256(source) {
  return `sha256-${createHash("sha256").update(source, "utf8").digest("base64")}`;
}

function htmlFileFor(route, nextDir, sourceRoute, appPaths) {
  const rel =
    route === "/"
      ? "/index"
      : /^\/index(?:\/|$)/.test(route)
        ? `/index${route}`
        : route;
  const classic = path.join(nextDir, "server", "app", `${rel}.html`);
  if (existsSync(classic)) return classic;
  // Next 16.3 adapter builds scope cached HTML by its source module.
  for (const [module, pathname] of Object.entries(appPaths)) {
    if (pathname !== sourceRoute || !module.endsWith("/page")) continue;
    const owner = createHash("sha256").update(module).digest("hex");
    const scoped = path.join(
      nextDir,
      "server",
      "route-cache",
      "APP_PAGE",
      owner,
      `$${rel}.html`,
    );
    if (existsSync(scoped)) return scoped;
  }
  return classic;
}

export function generateCspManifest({
  projectDir = webRoot,
  distDir = path.join(projectDir, ".next"),
  outputs,
} = {}) {
  const nextDir = distDir;
  const prerender = JSON.parse(
    readFileSync(path.join(nextDir, "prerender-manifest.json"), "utf8"),
  );
  const buildId = readFileSync(path.join(nextDir, "BUILD_ID"), "utf8").trim();

  const appPathsFile = path.join(nextDir, "app-path-routes-manifest.json");
  const appPaths = existsSync(appPathsFile)
    ? JSON.parse(readFileSync(appPathsFile, "utf8"))
    : {};
  const adapterHtml = new Map(
    (outputs?.prerenders ?? [])
      .filter((output) => output.fallback?.filePath?.endsWith(".html"))
      .map((output) => [output.pathname, output.fallback.filePath]),
  );
  const perRoute = new Map();
  for (const [route, info] of Object.entries(prerender.routes)) {
    if (info.routeType && info.routeType !== "page") continue;
    const file =
      adapterHtml.get(route) ??
      htmlFileFor(route, nextDir, info.srcRoute ?? route, appPaths);
    if (!existsSync(file)) continue;
    const hashes = [
      ...new Set(inlineScripts(readFileSync(file, "utf8")).map(sha256)),
    ];
    perRoute.set(route, hashes);
  }
  // Pages Next may serve for unmatched URLs.
  for (const special of ["/_not-found", "/_global-error"]) {
    const file =
      adapterHtml.get(special) ??
      htmlFileFor(special, nextDir, special, appPaths);
    if (!perRoute.has(special) && existsSync(file)) {
      perRoute.set(special, [
        ...new Set(inlineScripts(readFileSync(file, "utf8")).map(sha256)),
      ]);
    }
  }
  if (perRoute.size === 0) {
    throw new Error(
      "csp-hashes: no prerendered HTML found; run next build first",
    );
  }

  const lists = [...perRoute.values()];
  const common = lists[0].filter((h) =>
    lists.every((list) => list.includes(h)),
  );
  const commonSet = new Set(common);
  const routes = {};
  let maxHashes = 0;
  for (const [route, hashes] of perRoute) {
    const own = hashes.filter((h) => !commonSet.has(h));
    routes[route] = own;
    maxHashes = Math.max(maxHashes, own.length + common.length);
  }

  const manifest = { version: 1, buildId, common, routes };
  const json = JSON.stringify(manifest);
  writeFileSync(path.join(nextDir, "csp-manifest.json"), json);
  writeFileSync(path.join(projectDir, "public", "csp-manifest.json"), json);
  console.log(
    `csp-hashes: ${perRoute.size} prerendered pages, ${common.length} common hashes, max ${maxHashes} hashes per page (${(json.length / 1024).toFixed(0)} KB manifest)`,
  );
  return manifest;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  generateCspManifest();
}
