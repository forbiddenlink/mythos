import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { RandomDiscoveryButton } from "@/components/discovery/RandomDiscoveryButton";

const catalogLoaded = vi.hoisted(() => vi.fn());

vi.mock("@/data/deities.json", () => {
  catalogLoaded();
  return {
    default: [
      { id: "zeus", name: "Zeus", slug: "zeus", pantheonId: "greek-pantheon" },
      { id: "odin", name: "Odin", slug: "odin", pantheonId: "norse-pantheon" },
    ],
  };
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

  fireEvent.click(screen.getByRole("button", { name: "Another" }));
  await vi.waitFor(() => {
    expect(screen.getByRole("link", { name: "Explore" })).not.toHaveAttribute(
      "href",
      firstHref,
    );
  });
  expect(catalogLoaded).toHaveBeenCalledTimes(1);
});
