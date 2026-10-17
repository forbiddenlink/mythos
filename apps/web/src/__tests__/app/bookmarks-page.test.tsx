import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { BookmarksProvider } from "@/providers/bookmarks-provider";
import { BookmarksPageClient } from "@/app/bookmarks/BookmarksPageClient";

vi.mock("next/navigation", () => ({
  usePathname: () => "/bookmarks",
}));

const entry = (id: string, name: string) => ({
  id,
  name,
  slug: id,
  pantheonId: "greek-pantheon",
  description: `${name} description`,
  imageUrl: null,
});

function renderPage() {
  return render(
    <BookmarksProvider>
      <BookmarksPageClient
        deitiesData={[]}
        storiesData={[]}
        pantheonsData={[]}
        heroesData={[]}
        sourcesData={[]}
        creaturesData={[entry("hydra", "Hydra")]}
        artifactsData={[entry("aegis", "Aegis")]}
        locationsData={[
          {
            id: "olympus",
            name: "Mount Olympus",
            pantheonId: "greek-pantheon",
            description: "Home of the gods",
            imageUrl: null,
            locationType: "sacred_mountain",
          },
        ]}
        traditionNames={{ "greek-pantheon": "Greek" }}
      />
    </BookmarksProvider>,
  );
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("/bookmarks page", () => {
  it("shows the empty state when nothing is saved", async () => {
    renderPage();
    expect(await screen.findByText("Keep a reading list")).toBeTruthy();
  });

  it("groups saved creatures, artifacts and places with working links", async () => {
    localStorage.setItem(
      "mythos-atlas-bookmarks",
      JSON.stringify([
        { type: "creature", id: "hydra", timestamp: Date.now() },
        { type: "artifact", id: "aegis", timestamp: Date.now() },
        { type: "location", id: "olympus", timestamp: Date.now() },
        { type: "creature", id: "gone", timestamp: Date.now() },
      ]),
    );
    renderPage();
    expect(
      await screen.findByRole("heading", { name: "Creatures" }),
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Artifacts" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Places" })).toBeTruthy();
    const hrefs = screen
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/creatures/hydra");
    expect(hrefs).toContain("/artifacts/aegis");
    expect(hrefs).toContain("/locations/olympus");
    expect(screen.queryByText("Keep a reading list")).toBeNull();
  });
});
