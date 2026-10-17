import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ParallelFigures } from "@/components/mythology/ParallelFigures";
import { SyncretismStrip } from "@/components/mythology/SyncretismStrip";
import { getMuseumObjectsFor, getMuseumPortrait } from "@/lib/museum";

function markup(element: React.ReactNode): HTMLDivElement {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(element);
  return container;
}

const portrait = getMuseumPortrait(getMuseumObjectsFor({ deity: "osiris" }))!;

for (const variant of ["annotated", "portraits"] as const) {
  describe(`${variant} artwork`, () => {
    it("keeps the illustration when a museum object also exists", () => {
      const container = markup(
        <ParallelFigures
          label="Figures across pantheons"
          variant={variant}
          figures={[
            {
              name: "Osiris",
              href: "/deities/osiris",
              pantheonId: "egyptian",
              imageUrl: "/images/deities/osiris.png",
              museumPortrait: portrait,
            },
          ]}
        />,
      );
      expect(container.querySelector("img")).toHaveAttribute(
        "src",
        expect.stringContaining("osiris.png"),
      );
      expect(container).toHaveTextContent("Illustration");
      expect(container.querySelector(`a[href="${portrait.url}"]`)).toBeNull();
    });

    it("falls back to the museum object and keeps its source separate from the entry link", () => {
      const container = markup(
        <ParallelFigures
          label="Figures across pantheons"
          variant={variant}
          figures={[
            {
              name: "Osiris",
              href: "/deities/osiris",
              pantheonId: "egyptian",
              imageUrl: null,
              museumPortrait: portrait,
            },
          ]}
        />,
      );
      expect(container.querySelector("img")).toHaveAttribute(
        "src",
        portrait.imageUrl,
      );
      expect(container.querySelector("img")).toHaveClass("object-contain");
      const credit = container.querySelector(`a[href="${portrait.url}"]`);
      expect(credit).toHaveTextContent(portrait.institution);
      expect(credit?.parentElement?.closest("a")).toBeNull();
      expect(
        container.querySelector('a[href="/deities/osiris"]'),
      ).not.toContainElement(credit as HTMLElement);
    });

    it("labels illustration fallbacks without inventing a museum attribution", () => {
      const container = markup(
        <ParallelFigures
          label="Figures across pantheons"
          variant={variant}
          figures={[
            {
              name: "Osiris",
              href: "/deities/osiris",
              pantheonId: "egyptian",
              imageUrl: "/images/deities/osiris.png",
              museumPortrait: null,
            },
          ]}
        />,
      );
      expect(container).toHaveTextContent("Illustration");
      expect(container.querySelectorAll("a")).toHaveLength(1);
      expect(container.querySelector("img")).toHaveClass("object-cover");
    });
  });
}

it("shows the illustrations in the homepage comparison strip", () => {
  const container = markup(<SyncretismStrip />);
  const images = [...container.querySelectorAll("img")];
  expect(images.length).toBeGreaterThan(0);
  // Every member of the strip has an illustration, so no museum object
  // replaces a portrait there.
  expect(container.querySelectorAll("img.object-contain")).toHaveLength(0);
});
