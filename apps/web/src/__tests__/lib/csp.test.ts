import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildCsp,
  buildScriptSrc,
  hashesForPath,
  normalizeCspPath,
  type CspManifest,
} from "@/lib/csp";
import { inlineScripts, sha256 } from "../../../scripts/csp-hashes.mjs";

const manifest: CspManifest = {
  version: 1,
  buildId: "test",
  common: ["sha256-common"],
  routes: {
    "/": ["sha256-home"],
    "/deities/zeus": ["sha256-zeus"],
    "/_not-found": ["sha256-404"],
  },
};

describe("page rendering modes", () => {
  it("has no ISR pages, whose regenerated HTML misses the build-time hashes", () => {
    const appDir = join(process.cwd(), "src/app");
    const isrPages = readdirSync(appDir, { recursive: true, encoding: "utf8" })
      .filter((file) => /(^|\/)(page|layout)\.tsx$/.test(file))
      .filter((file) =>
        /export const revalidate\b/.test(
          readFileSync(join(ppDir, file), "utf8"),
        ),
      );
    expect(isrPages).toEqual([]);
  }, 30_000);
});

describe("hashesForPath", () => {
  it("combines common hashes with the page's own", () => {
    expect(hashesForPath(manifest, "/deities/zeus")).toEqual([
      "sha256-common",
      "sha256-zeus",
    ]);
    expect(hashesForPath(manifest, "/deities/zeus/")).toEqual([
      "sha256-common",
      "sha256-zeus",
    ]);
  });

  it("falls back to the static not-found page for unknown paths", () => {
    expect(hashesForPath(manifest, "/nope")).toEqual([
      "sha256-common",
      "sha256-404",
    ]);
  });

  it("normalizes trailing slashes but keeps the root", () => {
    expect(normalizeCspPath("/")).toBe("/");
    expect(normalizeCspPath("/a//")).toBe("/a");
  });
});

describe("buildScriptSrc", () => {
  it("strict mode permits WebAssembly without permitting JavaScript eval", () => {
    const src = buildScriptSrc({
      mode: "strict",
      nonce: "abc",
      hashes: ["sha256-x"],
    });
    expect(src).toBe(
      "'self' 'nonce-abc' 'sha256-x' 'wasm-unsafe-eval' blob: https://va.vercel-scripts.com",
    );
    expect(src.split(" ")).toContain("'wasm-unsafe-eval'");
    expect(src.split(" ")).not.toContain("'unsafe-eval'");
    expect(src).not.toContain("strict-dynamic");
  });

  it("degraded mode drops the nonce so 'unsafe-inline' actually applies", () => {
    const src = buildScriptSrc({ mode: "degraded", nonce: "abc" });
    expect(src).toContain("'unsafe-inline'");
    expect(src).not.toContain("nonce-");
  });

  it("development keeps inline + eval for HMR", () => {
    expect(buildScriptSrc({ mode: "development", nonce: "n" })).toContain(
      "'unsafe-eval'",
    );
  });

  it("keeps the rest of the policy intact", () => {
    const csp = buildCsp({ mode: "strict", nonce: "n", hashes: [] });
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("connect-src 'self' https://va.vercel-scripts.com");
    expect(csp).toContain("report-to csp-endpoint");
  });

  it("lets the browser SDK reach the US Sentry ingest host", () => {
    // CSP "*.a.b" only matches hosts ending in ".a.b", so *.ingest.sentry.io  // silently blocked every client event sent to o<org>.ingest.us.sentry.io.
    const csp = buildCsp({ mode: "strict", nonce: "n", hashes: []JNВ€ЫЫњЭЫЫ›™XЭHЬЬ€њЬ]
ЋИЉB€›X\


HO€ќљ[J
JB€™љ[™


HO€њЭ\ќХЪ]
ЫЫ›™XЭ\ЬИЉJB€ЛњЬ]
€ЉB€њЫXЩJJHПИЧNВ€ЫЫњЭЬЭH›НLLMЊLLLLLЊNL‹љ[™Щ\Эќ\ЛњЩ[ќћKљ[ИЋВ€ЫЫњЭ[ЭЩYHЫЫ›™XЭњЫЫYJ
ЬКHO€В€ЫЫњЭHHЧљО—ЧЧ
—ЉЉКIЛ™^XКЬКNВ€™]\›€HИЬЭ™[™ХЪ]
‰ЫVМW_X
H€ЬИOOHО‹ЛЙЪЬЭXВ€JNВ€^XЭ
[ЭЩY
KќР™JќYJNВ€JNВџJNВ‚™\ШЬљX™JЬЬZ\Ъ\ИќZ[ШЬљ\‹

HO€В€]
љ\Ъ\И[›[™H^XЭ]X›HШЬљ\ИЫ›H‹

HO€В€ЫЫњЭ[HВ€	ПШЬљ\ЬПH‹ШKљњИЏЏЬШЬљ\‰Л€ЏШЬљ\њЩ[‹—ЧЫ™^Щ‹њ\Ъ
МWJOЬШЬљ\€‹€	ПШЬљ\\OH\XШ][Ы‹Ы
ЪњЫЫ€ЏћИђ\HЋ€•[™ИџOЬШЬљ\‰Л€	ПШЬљ\›ЫЩOHћЏЫЫњЫЫK›ЩКJOЬШЬљ\‰Л€Kљ›Ъ[Љ€ЉNВ€^XЭ
[›[™TШЬљ\К[
JKќС\]X[
В€њЩ[‹—ЧЫ™^Щ‹њ\Ъ
МWJH‹€ЫЫњЫЫK›ЩКJH‹€JNВ€JNВ‚€]
™љ[™ИШЬљ\ИЪЬЩH[™YИШ\њљY\ИЪ]\ЬXЩHЬ€]љXќ]\И‹

HO€В€ЫЫњЭ[B€ЏШЬљ\™љ\њЭ

OЬШЬљ\ЏШЬљ\њЩXЫЫ™

OЬШЬљ\€›ЫПЏћЬ€ЋВ€^XЭ
[›[™TШЬљ\К[
JKќС\]X[
И™љ\њЭ

H‹њЩXЫЫ™

H—JNВ€JNВ‚€]
њ›ЩXЩ\ИФФXЫЫ\]X›HТKLЌM€ЫЭ\Щ\И‹

HO€В€ЛИXЪИ[€[\ќ
JH€Ь[њЬЫЬЭ\ЪLЌM€Xљ[\ћH\ЩMЌ€^XЭ
ЪLЌMЉ[\ќ
JHЉJKќР™J€њЪLЌM‹XљЮЊќ‘Ю]МЩФSЬњњШЫYL–M\УНСЉЬOH‹€
NВ€JNВџJNВ