import { afterEach, describe, expect, it, vi } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

afterEach(() => vi.useRealTimers());

describe("sitemap", () => {
  it("does not report unchanged content as modified when generated later", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-22T00:00:00Z"));
    const first = sitemap();
    vi.setSystemTime(new Date("2026-09-23T00:00:00Z"));

    expect(first.length).toBeGreaterThan(0);
    expect(first.every((entry) => entry.lastModified === undefined)).toBe(true);
    expect(sitemap()).toEqual(first);
  });
});

it("allows crawlers to fetch the resources required to render public pages", () => {
  const rules = robots().rules;
  const entries = Array.isArray(rules) ? rules : [rules];
  for (const rule of entries) {
    const blocked = [rule.disallow].flat().filter(Boolean) as string[];
    for (const resource of [
      "/_next/static/chunks/app.js",
      "/_next/static/css/app.css",
      "/_next/image?url=story.webp",
    ]) {
      expect(blocked.some((prefix) => resource.startsWith(prefix))).toBe(false);
    }
  }
});
