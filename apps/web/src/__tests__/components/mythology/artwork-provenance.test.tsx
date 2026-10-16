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
    it("uses the museum object and keeps its source separate from the entry link", () => {
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

it("credits real museum images in the homepage comparison strip", () => {
  const container = markup(<SyncretismStrip />);
  const museumImages = [...container.querySelectorAll("img.object-contain")];
  expect(museumImages.length).toBeGreaterThan(0);
  for (const image of museumImages) {
    const item = image.closest("li")!;
    expect(item.querySelector("a[title]")).not.toBeNull();
    expect(item.querySelectorAll("a")).toHaveLength(2);
    expect(image.getAttribute("alt")).toBeTruthy();
  }
});
