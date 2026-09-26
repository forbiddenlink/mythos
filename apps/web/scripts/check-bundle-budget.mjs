#!/usr/bin/env node
/**
 * Bundle-size budget for key routes.
 *
 * Reads the output of `next build --webpack` (no extra build) and computes
 * each route's first-load JavaScript: the shared root chunks from
 * .next/build-manifest.json plus every chunk its client-reference manifest
 * (server/app/<route>/page_client-reference-manifest.js) loads up front.
 * Chunks behind next/dynamic are not in that manifest, so they do not count.
 * The manifest lists every client component the route can render, so this is
 * an upper bound for any single page of a dynamic route (a given slug may
 * skip some components). Sizes are gzip, like the old "First Load JS" column
 * in `next build`.
 *
 * Fails (exit 1) when a route is over budget or its manifest is missing.
 * Budgets and how to change them: docs/ops/bundle-budget.md.
 *
 * Usage: node scripts/check-bundle-budget.mjs   (from apps/web, after build)
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { gzipSync } from "node:zlib";

// First-load JS budgets in KiB (gzip). Measured 2026-09-26 + ~10% headroom:
// / 319.0, /deities/[slug] 895.9, /stories/[slug] 592.9. Lower these when a
// bundle reduction lands so the gain is locked in.
const BUDGETS_KIB = {
  "/": 350,
  "/deities/[slug]": 985,
  "/stories/[slug]": 650,
};

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const nextDir = join(webRoot, ".next");

function fail(message) {
  console.error(`bundle budget: ${message}`);
  process.exit(1);
}

const buildManifestPath = join(nextDir, "build-manifest.json");
if (!existsSync(buildManifestPath)) {
  fail(`${buildManifestPath} not found; run "pnpm --filter web build" first.`);
}
const buildManifest = JSON.parse(readFileSync(buildManifestPath, "utf8"));
const rootFiles = buildManifest.rootMainFiles ?? [];

function routeChunks(route) {
  const dir = route === "/" ? "" : route.slice(1);
  const manifestPath = join(
    nextDir,
    "server",
    "app",
    dir,
    "page_client-reference-manifest.js",
  );
  if (!existsSync(manifestPath)) {
    fail(`no client reference manifest for ${route} (${manifestPath}).`);
  }
  const sandbox = { globalThis: {} };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(readFileSync(manifestPath, "utf8"), sandbox);
  const key = route === "/" ? "/page" : `${route}/page`;
  const manifest = sandbox.__RSC_MANIFEST?.[key];
  if (!manifest) fail(`manifest for ${route} has no "${key}" entry.`);

  const files = new Set();
  for (const mod of Object.values(manifest.clientModules ?? {})) {
    if (mod.async) continue;
    for (const chunk of mod.chunks ?? []) {
      if (typeof chunk === "string" && chunk.endsWith(".js")) files.add(chunk);
    }
  }
  return files;
}

const gzipCache = new Map();
function gzipBytes(file) {
  if (!gzipCache.has(file)) {
    const path = join(nextDir, decodeURIComponent(file));
    if (!existsSync(path)) fail(`chunk ${file} listed but missing on disk.`);
    gzipCache.set(file, gzipSync(readFileSync(path)).length);
  }
  return gzipCache.get(file);
}

const kib = (bytes) => bytes / 1024;
let failed = false;
const rows = [];
for (const [route, budget] of Object.entries(BUDGETS_KIB)) {
  const files = new Set([...rootFiles, ...routeChunks(route)]);
  let total = 0;
  for (const file of files) total += gzipBytes(file);
  const over = kib(total) > budget;
  if (over) failed = true;
  rows.push({
    route,
    "first-load JS (KiB gz)": kib(total).toFixed(1),
    "budget (KiB gz)": budget,
    chunks: files.size,
    status: over ? "OVER" : "ok",
  });
}

console.table(rows);
if (failed) {
  fail(
    "one or more routes exceed their first-load JS budget. Trim the bundle " +
      "or, if the growth is intended, raise the budget in " +
      "scripts/check-bundle-budget.mjs and docs/ops/bundle-budget.md.",
  );
}
console.log("bundle budget: all routes within budget.");
