import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CONSOLIDATION_REDIRECTS } from "@/lib/route-redirects";

const appDir = join(__dirname, "..", "..", "app");

/** True when a static or dynamic App Router page serves `pathname`. */
function pageExists(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  function walk(dir: string, rest: string[]): boolean {
    if (rest.length === 0) return existsSync(join(dir, "page.tsx"));
    const [head, ...tail] = rest;
    if (existsSync(join(dir, head)) && walk(join(dir, head), tail)) return true;
    return ["[slug]", "[pair]", "[domain]"].some(
      (dynamic) =>
        existsSync(join(dir, dynamic)) && walk(join(dir, dynamic), tail),
    );
  }
  return walk(appDir, segments);
}

describe("consolidation redirects", () => {
  it("are all permanent", () => {
    for (const redirect of CONSOLIDATION_REDIRECTS) {
      expect(redirect.permanent).toBe(true);
    }
  });

  it("have unique sources", () => {
    const sources = CONSOLIDATION_REDIRECTS.map((r) => r.source);
    expect(new Set(sources).size).toBe(sources.length);
  });

  it("point at pages that exist", () => {
    for (const { destination } of CONSOLIDATION_REDIRECTS) {
      const path = destination.split(/[?#]/)[0];
      expect(pageExists(path), destination).toBe(true);
    }
  });

  it("retire the source pages", () => {
    for (const { source } of CONSOLIDATION_REDIRECTS) {
      if (source.includes(":")) continue;
      expect(existsSync(join(appDir, source, "page.tsx")), source).toBe(false);
    }
  });

  it("send the old leaderboard to Your Stats", () => {
    expect(CONSOLIDATION_REDIRECTS).toContainEqual({
      source: "/leaderboard",
      destination: "/progress",
      permanent: true,
    });
  });
});
