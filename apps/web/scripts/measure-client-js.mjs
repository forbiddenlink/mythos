#!/usr/bin/env node
/**
 * Measure the client JavaScript each route ships, and whether any of it embeds
 * the full deity/story catalog.
 *
 * Next 16 no longer prints "First Load JS" in the build table, so this script
 * reproduces it from a running production server:
 *
 *   pnpm --filter web build && pnpm --filter web start &
 *   node apps/web/scripts/measure-client-js.mjs [baseUrl] [--json]
 *
 * For each route it fetches the HTML, collects every `/_next/static/chunks/*.js`
 * referenced by a script tag or by the inline RSC payload (client component
 * chunks), reads those files from `.next/static`, and reports raw and gzip
 * bytes. "Full catalog" markers are the opening of every deity `detailedBio`
 * and every story `fullNarrative`: a chunk that contains many of them embeds the
 * whole JSON file rather than a slim projection. The final section lists every
 * chunk in the build (including lazy ones never referenced by the HTML) that
 * still contains those markers.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, "..");
const nextDir = path.join(webRoot, ".next");

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const baseUrl = args.find((a) => !a.startsWith("--")) ?? "http://localhost:3000";

const deities = JSON.parse(
  readFileSync(path.join(webRoot, "src/data/deities.json"), "utf8"),
);
const stories = JSON.parse(
  readFileSync(path.join(webRoot, "src/data/stories.json"), "utf8"),
);

/** Openings of long-form fields, escaped the way webpack embeds JSON strings. */
function markersFor(texts) {
  return texts
    .filter((t) => typeof t === "string" && t.length > 60)
    .map((t) => t.slice(0, 48))
    .map((t) => JSON.stringify(t).slice(1, -1));
}
const deityMarkers = markersFor(deities.map((d) => d.detailedBio));
const storyMarkers = markersFor(stories.map((s) => s.fullNarrative));

function countMarkers(source, markers) {
  let n = 0;
  for (const m of markers) {
    // webpack may double-escape inside JSON.parse('...') strings
    if (source.includes(m) || source.includes(m.replaceAll("\\", "\\\\"))) n++;
  }
  return n;
}

const DEFAULT_ROUTES = [
  "/",
  "/deities",
  "/deities/zeus",
  "/stories",
  "/stories/titanomachy",
  "/pantheons",
  "/pantheons/greek",
  "/heroes/achilles",
  "/creatures",
  "/creatures/fenrir",
  "/artifacts/aegis",
  "/timeline",
  "/story-timeline",
  "/family-tree",
  "/knowledge-graph",
  "/divine-domains",
  "/compare",
  "/compare/myths",
  "/compare/parallels",
  "/quiz/quick",
  "/quiz/relationships",
  "/learning-paths",
  "/bookmarks",
  "/progress",
  "/review",
  "/games/memory",
  "/facts",
  "/sources",
  "/atlas",
];

const chunkCache = new Map();
function readChunk(rel) {
  if (!chunkCache.has(rel)) {
    const file = path.join(nextDir, rel);
    try {
      const buf = readFileSync(file);
      const src = buf.toString("utf8");
      chunkCache.set(rel, {
        raw: buf.length,
        gzip: gzipSync(buf).length,
        deity: countMarkers(src, deityMarkers),
        story: countMarkers(src, storyMarkers),
      });
    } catch {
      chunkCache.set(rel, null);
    }
  }
  return chunkCache.get(rel);
}

async function measureRoute(route) {
  const res = await fetch(new URL(route, baseUrl), { redirect: "follow" });
  const html = await res.text();
  const chunks = new Set();
  for (const m of html.matchAll(/static\/chunks\/[A-Za-z0-9_\-./[\]%]+?\.js/g)) {
    chunks.add(decodeURIComponent(m[0]));
  }
  let raw = 0;
  let gzip = 0;
  let deity = 0;
  let story = 0;
  for (const c of chunks) {
    const info = readChunk(c);
    if (!info) continue;
    raw += info.raw;
    gzip += info.gzip;
    deity = Math.max(deity, info.deity);
    story = Math.max(story, info.story);
  }
  return {
    route,
    status: res.status,
    chunks: chunks.size,
    rawKB: +(raw / 1024).toFixed(1),
    gzipKB: +(gzip / 1024).toFixed(1),
    deityBios: deity,
    storyNarratives: story,
  };
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (full.endsWith(".js")) out.push(full);
  }
  return out;
}

const rows = [];
for (const route of DEFAULT_ROUTES) {
  try {
    rows.push(await measureRoute(route));
  } catch (error) {
    rows.push({ route, error: String(error) });
  }
}

const heavyChunks = walk(path.join(nextDir, "static/chunks"))
  .map((file) => {
    const rel = path.relative(nextDir, file);
    const info = readChunk(rel);
    return info ? { chunk: rel, ...info } : null;
  })
  .filter((c) => c && (c.deity > 0 || c.story > 0))
  .map((c) => ({
    chunk: c.chunk,
    rawKB: +(c.raw / 1024).toFixed(1),
    deityBios: c.deity,
    storyNarratives: c.story,
  }));

if (asJson) {
  console.log(JSON.stringify({ rows, heavyChunks }, null, 2));
} else {
  console.log(
    `Markers: ${deityMarkers.length} deity bios, ${storyMarkers.length} story narratives\n`,
  );
  console.log("| Route | Status | Chunks | JS raw (KB) | JS gzip (KB) | Deity bios | Story narratives |");
  console.log("| --- | --- | --- | --- | --- | --- | --- |");
  for (const r of rows) {
    if (r.error) {
      console.log(`| ${r.route} | error | | | | | |`);
      continue;
    }
    console.log(
      `| ${r.route} | ${r.status} | ${r.chunks} | ${r.rawKB} | ${r.gzipKB} | ${r.deityBios} | ${r.storyNarratives} |`,
    );
  }
  console.log("\nChunks anywhere in the build that embed catalog long-form text:");
  if (heavyChunks.length === 0) console.log("(none)");
  for (const c of heavyChunks) {
    console.log(
      `- ${c.chunk}: ${c.rawKB} KB, ${c.deityBios} deity bios, ${c.storyNarratives} story narratives`,
    );
  }
}
