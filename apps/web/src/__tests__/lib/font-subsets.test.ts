import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Source Sans 3 ships as unicode-range subsets so a Latin-only page does not
// download the Cyrillic, Greek and Vietnamese glyphs. These tests keep the
// declarations in src/app/fonts.ts honest: they match the files, never overlap,
// and still cover every non-Latin script the catalog actually uses.

const fontsDir = join(process.cwd(), "src/app/fonts");
const manifest = JSON.parse(
  readFileSync(join(fontsDir, "source-sans-3-subsets.json"), "utf8"),
) as Record<string, { file: string; range: string }>;
const fontsTs = readFileSync(join(process.cwd(), "src/app/fonts.ts"), "utf8");

function parseRange(spec: string): Array<[number, number]> {
  return spec.split(",").map((part) => {
    const [lo, hi] = part.replace("U+", "").split("-");
    return [Number.parseInt(lo, 16), Number.parseInt(hi ?? lo, 16)];
  });
}

const inRanges = (cp: number, ranges: Array<[number, number]>) =>
  ranges.some(([lo, hi]) => cp >= lo && cp <= hi);

// name -> unicode-range value declared in fonts.ts for that subset's file.
function declaredRanges(): Record<string, string> {
  const out: Record<string, string> = {};
  const block =
    /src:\s*"\.\/fonts\/(source-sans-3-[a-z-]+\.woff2)"[\s\S]*?value:\s*"([^"]+)"/g;
  for (const m of fontsTs.matchAll(block)) out[m[1]] = m[2];
  return out;
}

describe("Source Sans 3 unicode-range subsets", () => {
  it("declares every subset in fonts.ts with the range the split script wrote", () => {
    const declared = declaredRanges();
    expect(Object.keys(declared).sort()).toEqual(
      Object.values(manifest)
        .map((s) => s.file)
        .sort(),
    );
    for (const { file, range } of Object.values(manifest)) {
      expect(declared[file], file).toBe(range);
    }
  });

  it("keeps the subset files on disk, and the Latin one small", () => {
    for (const { file } of Object.values(manifest)) {
      expect(statSync(join(fontsDir, file)).size).toBeGreaterThan(1000);
    }
    // The old single file was 170 KB; Latin pages must stay far under that.
    expect(statSync(join(fontsDir, manifest.latin.file)).size).toBeLessThan(
      60 * 1024,
    );
  });

  it("never lets two subsets claim the same code point", () => {
    const seen = new Map<number, string>();
    for (const [name, { range }] of Object.entries(manifest)) {
      for (const [lo, hi] of parseRange(range)) {
        for (let cp = lo; cp <= hi; cp++) {
          expect(
            seen.get(cp),
            `U+${cp.toString(16)} in ${name}`,
          ).toBeUndefined();
          seen.set(cp, name);
        }
      }
    }
  });

  it("puts printable ASCII and Latin-1 in the preloaded Latin subset", () => {
    const latin = parseRange(manifest.latin.range);
    for (let cp = 0x20; cp <= 0x7e; cp++)
      expect(inRanges(cp, latin)).toBe(true);
    for (let cp = 0xa0; cp <= 0xff; cp++)
      expect(inRanges(cp, latin)).toBe(true);
  });

  it.each([
    ["\u03b9", "greek"],
    ["\u1f11", "greek-ext"],
    ["\u0436", "cyrillic"],
    ["\u1ea1", "vietnamese"],
    ["\u0101", "latin-ext"],
  ])(
    "routes %s to the %s subset, so a page using it still gets glyphs",
    (ch, name) => {
      const cp = ch.codePointAt(0) ?? 0;
      expect(inRanges(cp, parseRange(manifest[name].range))).toBe(true);
    },
  );

  it("keeps every Greek and Cyrillic character in the catalog served by a script subset", () => {
    const dataDir = join(process.cwd(), "src/data");
    const scriptSubsets = [
      "greek",
      "greek-ext",
      "cyrillic",
      "cyrillic-ext",
    ].flatMap((n) => parseRange(manifest[n].range));
    const seen = new Set<number>();
    for (const file of [
      "deities.json",
      "stories.json",
      "heroes.json",
      "creatures.json",
      "locations.json",
      "cosmologies.json",
    ]) {
      for (const ch of readFileSync(join(dataDir, file), "utf8")) {
        const cp = ch.codePointAt(0) ?? 0;
        if (
          (cp >= 0x370 && cp <= 0x3ff) ||
          (cp >= 0x1f00 && cp <= 0x1fff) ||
          (cp >= 0x400 && cp <= 0x4ff)
        )
          seen.add(cp);
      }
    }
    // The catalog really uses both scripts, so this is not vacuous.
    expect([...seen].some((cp) => cp >= 0x400 && cp <= 0x4ff)).toBe(true);
    expect([...seen].some((cp) => cp >= 0x370 && cp <= 0x3ff)).toBe(true);
    // Every one is either served by a script subset or absent from the font
    // altogether (then it was a system-font fallback before the split too).
    const all = Object.values(manifest).flatMap((s) => parseRange(s.range));
    for (const cp of seen) {
      if (inRanges(cp, all))
        expect(inRanges(cp, scriptSubsets), `U+${cp.toString(16)}`).toBe(true);
    }
  });
});
