import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { GUIDES, guidesFeaturing, type GuideEntityKind } from "@/lib/guides";

// Server-render without the router: Link and Image are not what is under test.
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string | { pathname?: string };
    children?: React.ReactNode;
  }) => <a href={typeof href === "string" ? href : ""}>{children}</a>,
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/guides",
  useRouter: () => ({ push: () => {}, replace: () => {} }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("next/image", () => ({ default: () => null }));

// Record every entity a guide page links through guideEntity / routeStop while
// the real implementation still resolves it.
const linked = vi.hoisted(() => new Set<string>());
vi.mock("@/lib/guide-entities", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/guide-entities")>();
  return {
    ...actual,
    guideEntity: (kind: GuideEntityKind, id: string) => {
      linked.add(`${kind}:${id}`);
      return actual.guideEntity(kind, id);
    },
    routeStop: (id: string) => {
      linked.add(`location:${id}`);
      return actual.routeStop(id);
    },
  };
});

const PAGES: Record<string, () => Promise<{ default: () => React.ReactNode }>> =
  {
    "percy-jackson-titans-curse": () =>
      import("@/app/guides/percy-jackson-titans-curse/page"),
    odyssey: () => import("@/app/guides/odyssey/page"),
    "hades-ii": () => import("@/app/guides/hades-ii/page"),
    "greek-gods-family-tree": () =>
      import("@/app/guides/greek-gods-family-tree/page"),
    "greek-roman-gods-chart": () =>
      import("@/app/guides/greek-roman-gods-chart/page"),
    "valhalla-vs-folkvangr": () =>
      import("@/app/guides/valhalla-vs-folkvangr/page"),
  };

// The first import of a page pulls in the whole catalog, which is slow cold.
const PAGE_TIMEOUT_MS = 60_000;

describe("guide registry vs guide pages", () => {
  it("has a page loader for every registered guide", () => {
    expect(Object.keys(PAGES).sort()).toEqual(GUIDES.map((g) => g.slug).sort());
  });

  it.each(GUIDES.map((g) => g.slug))(
    "%s: every entity the page links is in the registry (so it gets a Featured in backlink)",
    async (slug) => {
      linked.clear();
      const { default: Page } = await PAGES[slug]();
      renderToStaticMarkup(<Page />);
      expect(linked.size, "page linked no entities").toBeGreaterThan(0);

      const guide = GUIDES.find((g) => g.slug === slug)!;
      const missing = [...linked].filter((key) => {
        const [kind, id] = key.split(":") as [GuideEntityKind, string];
        return !guide.featured[kind]?.includes(id);
      });
      expect(missing.sort().join(", ")).toBe("");
      for (const key of linked) {
        const [kind, id] = key.split(":") as [GuideEntityKind, string];
        expect(guidesFeaturing(kind, id).map((g) => g.slug)).toContain(slug);
      }
    },
    PAGE_TIMEOUT_MS,
  );
});
