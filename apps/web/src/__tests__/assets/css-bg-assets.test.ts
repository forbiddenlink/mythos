import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The home hero is the LCP element. As a CSS background it was discovered late
// (after CSS parsed) at low priority: LCP 4.84s on main vs 2.12s once it became
// a real priority image. These tests fail if a CSS-background hero comes back.

const srcRoot = join(__dirname, "..", "..");
const read = (rel: string): string => readFileSync(join(srcRoot, rel), "utf8");

const HERO_FILES = [
  "components/home/AtlasOpensHero.tsx",
  "app/page.tsx",
] as const;

/** A hero image is a priority <Image>/<img> that is not just a CSS background. */
function heroImageProblems(source: string): string[] {
  const problems: string[] = [];
  const tags = [...source.matchAll(/<(Image|img)\b[\s\S]*?\/>/g)].map(
    (m) => m[0],
  );
  const priority = tags.filter(
    (tag) =>
      /\bpriority\b/.test(tag) || /fetchPriority\s*=\s*["']high["']/.test(tag),
  );
  if (priority.length === 0) problems.push("no priority <Image>/<img>");
  if (/bg-\[url\(/.test(source)) problems.push("Tailwind bg-url-class in hero");
  if (/background(-image)?\s*:\s*[^;]*url\(/.test(source))
    problems.push("inline background url() in hero");
  if (/backgroundImage\s*:/.test(source))
    problems.push("inline backgroundImage style in hero");
  return problems;
}

describe("home hero is a priority image, not a CSS background", () => {
  it("AtlasOpensHero renders a priority next/image", () => {
    const src = read("components/home/AtlasOpensHero.tsx");
    expect(src).toMatch(/import Image from "next\/image"/);
    expect(heroImageProblems(src)).toEqual([]);
  });

  it("no hero file uses a CSS background image", () => {
    for (const file of HERO_FILES) {
      const src = read(file);
      expect(src, file).not.toMatch(/bg-\[url\(/);
      expect(src, file).not.toMatch(/backgroundImage\s*:/);
    }
  });

  it("globals.css has no hero rule with a background url()", () => {
    const css = read("app/globals.css");
    const heroRules = [...css.matchAll(/([^{}]*hero[^{}]*)\{([^}]*)\}/gi)];
    const offenders = heroRules
      .filter(([, , body]) => /url\(/.test(body))
      .map(([, selector]) => selector.trim());
    expect(offenders).toEqual([]);
  });

  describe("detector catches regressions", () => {
    it("flags a Tailwind CSS-background hero", () => {
      const bad = `<section className="bg-[url('/hero-columns.webp')] bg-cover"><h1>x</h1></section>`;
      expect(heroImageProblems(bad)).toEqual(
        expect.arrayContaining([
          "no priority <Image>/<img>",
          "Tailwind bg-url-class in hero",
        ]),
      );
    });

    it("flags an inline backgroundImage hero", () => {
      const bad = `<div style={{ backgroundImage: "url(/h.webp)" }} />`;
      expect(heroImageProblems(bad)).toContain(
        "inline backgroundImage style in hero",
      );
    });

    it("flags a non-priority image", () => {
      expect(
        heroImageProblems(`<Image src="/h.webp" alt="" fill />`),
      ).toContain("no priority <Image>/<img>");
    });

    it("accepts a priority next/image", () => {
      expect(
        heroImageProblems(`<Image src="/h.webp" alt="" fill priority />`),
      ).toEqual([]);
    });
  });
});
