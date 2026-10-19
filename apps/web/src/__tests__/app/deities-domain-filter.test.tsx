import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DivineDomainsPageClient } from "@/app/divine-domains/DivineDomainsPageClient";
import { DeitiesPageClient } from "@/app/deities/DeitiesPageClient";
import type { DeityListItem } from "@/lib/data/types";

vi.mock("next/navigation", () => ({ usePathname: () => "/deities" }));

vi.mock("@/components/ui/bookmark-button", () => ({
  BookmarkButton: () => null,
}));
vi.mock("@/components/entities/EntityCard", () => ({
  EntityCard: ({ title }: { title: string }) => <h2>{title}</h2>,
  EntityGrid: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  EntityBadge: () => null,
}));

const deities = [
  { id: "helios", name: "Helios", pantheonId: "greek", domain: ["sun"] },
  { id: "ra", name: "Ra", pantheonId: "egyptian", domain: ["the sun"] },
  {
    id: "khors",
    name: "Khors",
    pantheonId: "slavic",
    domain: ["uncertain; possibly the sun or moon"],
  },
].map((deity) => ({
  ...deity,
  slug: deity.id,
  description: "A catalog description",
  imageUrl: null,
  gender: "male",
})) as DeityListItem[];

function renderAt(query: string): void {
  window.history.replaceState(null, "", `/deities?${query}`);
  Object.assign(window.location, {
    search: `?${query}`,
    href: `http://localhost/deities?${query}`,
  });
  render(
    <DeitiesPageClient
      deities={deities}
      traditionCount={3}
      traditionNames={{
        greek: "Greek",
        egyptian: "Egyptian",
        slavic: "Slavic",
      }}
    />,
  );
}

afterEach(cleanup);

describe("deity catalog domain URLs", () => {
  it("shows sun aliases together while retaining the tradition filter", () => {
    renderAt("domain=sun&pantheon=egyptian");
    expect(screen.getByRole("heading", { name: "Ra" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Helios" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Khors" })).toBeNull();
  });

  it("accepts old article-valued domain links", () => {
    renderAt("domain=the%20sun");
    expect(screen.getByRole("heading", { name: "Helios" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Ra" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Khors" })).toBeNull();
  });

  it("accepts old scholarly prose links and the explicit uncertain group", () => {
    renderAt("domain=uncertain%3B%20possibly%20the%20sun%20or%20moon");
    expect(screen.getByRole("heading", { name: "Khors" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Ra" })).toBeNull();
    cleanup();
    renderAt("domain=unclassified-or-uncertain");
    expect(screen.getByRole("heading", { name: "Khors" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Ra" })).toBeNull();
  });
});

describe("divine domain browsing", () => {
  it("uses the same sun group and leaves the scholarly uncertainty intact", () => {
    render(
      <DivineDomainsPageClient
        deities={deities}
        pantheonNames={{
          greek: "Greek",
          egyptian: "Egyptian",
          slavic: "Slavic",
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Sun/ }));
    expect(screen.getByRole("heading", { name: "Helios" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Ra" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Khors" })).toBeNull();
  });
});
