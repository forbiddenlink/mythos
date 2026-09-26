import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { RandomDiscoveryButton } from "@/components/discovery/RandomDiscoveryButton";

const catalogLoaded = vi.fn(
  async (_input: RequestInfo | URL, _init?: RequestInit) =>
    new Response(
      JSON.stringify([
        {
          id: "zeus",
          name: "Zeus",
          slug: "zeus",
          pantheonId: "greek-pantheon",
        },
        {
          id: "odin",
          name: "Odin",
          slug: "odin",
          pantheonId: "norse-pantheon",
        },
      ]),
      { headers: { "Content-Type": "application/json" } },
    ),
);
vi.stubGlobal("fetch", catalogLoaded);

afterEach(() => {
  catalogLoaded.mockClear();
});

it("loads the catalog on discovery intent and reuses it for another result", async () => {
  render(<RandomDiscoveryButton />);
  expect(catalogLoaded).not.toHaveBeenCalled();

  fireEvent.click(
    screen.getByRole("button", { name: "Discover a random deity" }),
  );
  const firstLink = await screen.findByRole("link", { name: "Explore" });
  const firstHref = firstLink.getAttribute("href");
  expect(catalogLoaded).toHaveBeenCalledTimes(1);
  expect(String(catalogLoaded.mock.calls[0][0])).toBe("/api/catalog/deities");

  fireEvent.click(screen.getByRole("button", { name: "Another" }));
  await vi.waitFor(() => {
    expect(screen.getByRole("link", { name: "Explore" })).not.toHaveAttribute(
      "href",
      firstHref,
    );
  });
  expect(catalogLoaded).toHaveBeenCalledTimes(1);
});
