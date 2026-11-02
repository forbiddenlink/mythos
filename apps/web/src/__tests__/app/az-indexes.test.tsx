import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import ArtifactsAzPage from "@/app/artifacts/a-z/page";
import CreaturesAzPage from "@/app/creatures/a-z/page";
import DeitiesAzPage from "@/app/deities/a-z/page";
import LocationsAzPage from "@/app/locations/a-z/page";
import sitemap from "@/app/sitemap";
import StoriesAzPage from "@/app/stories/a-z/page";
import artifacts from "@/data/artifacts.json";
import creatures from "@/data/creatures.json";
import deities from "@/data/deities.json";
import locations from "@/data/locations.json";
import stories from "@/data/stories.json";

vi.mock("next/navigation", () => ({ usePathname: () => "/deities/a-z" }));

const SITE_PATHS = new Set(
  sitemap().map((entry) => new URL(entry.url).pathname),
);

const INDEXES: [string, () => ReactElement, string[]][] = [
  ["deities", DeitiesAzPage, deities.map((d) => `/deities/${d.slug}`)],
  ["stories", StoriesAzPage, stories.map((s) => `/stories/${s.slug}`)],
  ["locations", LocationsAzPage, locations.map((l) => `/locations/${l.id}`)],
  ["creatures", CreaturesAzPage, creatures.map((c) => `/creatures/${c.slug}`)],
  ["artifacts", ArtifactsAzPage, artifacts.map((a) => `/artifacts/${a.slug}`)],
];

describe.each(INDEXES)("/%s/a-z", (kind, Page, expected) => {
  it("links every entry once, with no JavaScript needed", () => {
    const { container } = render(Page());
    const hrefs = [...container.querySelectorAll("section[id^='letter-'] a")].map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs.sort()).toEqual([...expected].sort());
  });

  it("links only to pages in the sitemap, and is listed there itself", () => {
    expect(SITE_PATHS.has(`/${kind}/a-z`)).toBe(true);
    expect(expected.filter((path) => !SITE_PATHS.has(path))).toEqual([]);
  });
});
