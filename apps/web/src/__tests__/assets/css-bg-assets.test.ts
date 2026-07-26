import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

// Scan all component source for Tailwind CSS bg-[url('/...')] refs and assert the
// referenced asset exists in public/. Guards against regressions like the live
// cta-ruins.webp 404 (data references an asset that was never generated).

function walk(dir: string, exts: string[]): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === ".next" ||
        entry.name === "__tests__"
      )
        continue;
      out.push(...walk(full, exts));
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

const srcRoot = join(__dirname, "..", ".."); // apps/web/src
const webRoot = join(srcRoot, ".."); // apps/web
const publicRoot = join(webRoot, "public");

const refs: { file: string; asset: string }[] = [];
for (const file of walk(srcRoot, [".tsx", ".ts"])) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/bg-\[url\('(\/[^']+)'\)\]/g)) {
    refs.push({ file: file.replace(webRoot + "/", ""), asset: m[1] });
  }
}

describe("CSS background-image assets exist in public/", () => {
  it("finds at least the known references", () => {
    expect(refs.length).toBeGreaterThanOrEqual(2); // cta-ruins + hero-columns
  });

  it.each(refs)("$asset (in $file) exists in public/", ({ asset }) => {
    expect(existsSync(join(publicRoot, asset))).toBe(true);
  });
});
