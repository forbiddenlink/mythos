import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DeityHero } from "@/app/deities/[slug]/_components/DeityHero";
import museumObjects from "@/data/museum-objects.json";
import type { DeityRecord } from "@/lib/data/types";
import type { MuseumObject } from "@/lib/museum";

vi.mock("@/components/navigation/Breadcrumbs", () => ({
  Breadcrumbs: () => null,
}));
vi.mock("@/components/sharing/ShareButton", () => ({
  ShareButton: () => null,
}));
vi.mock("@/components/ui/bookmark-button", () => ({
  BookmarkButton: () => null,
}));
vi.mock("@/components/ui/export-button", () => ({
  ExportIconButton: () => null,
}));

const deity: DeityRecord = {
  id: "osiris",
  slug: "osiris",
  name: "Osiris",
  pantheonId: "egyptian",
  gender: "male",
  domain: ["afterlife"],
  symbols: ["crook", "flail"],
  description: "Egyptian deity of the afterlife.",
  importanceRank: 1,
  alternateNames: [],
  imageUrl: "/images/deities/osiris.png",
};

const museumPortrait = museumObjects.find(
  (object) => object.id === "met-545802",
) as MuseumObject;

function renderHero(portrait: MuseumObject | null): HTMLDivElement {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(
    <DeityHero
      deity={deity}
      museumPortrait={portrait}
      imageNote={{ kind: "illustration-ai", label: "AI illustration" }}
    />,
  );
  return container;
}

describe("deity hero artwork provenance", () => {
  it("keeps the illustration as the portrait when a museum object also exists", () => {
    const container = renderHero(museumPortrait);
    expect(container.querySelector("figure img")).toHaveAttribute(
      "src",
      expect.stringContaining("osiris.png"),
    );
    expect(
      container.querySelector('[data-testid="illustrative-image-caption"]'),
    ).not.toBeNull();
    expect(container).not.toHaveTextContent(museumPortrait.institution);
  });

  it("falls back to documented museum art and credits its record when there is no illustration", () => {
    const container = document.createElement("div");
    container.innerHTML = renderToStaticMarkup(
      <DeityHero
        deity={{ ...deity, imageUrl: "" }}
        museumPortrait={museumPortrait}
      />,
    );
    const image = container.querySelector("figure img");
    expect(image).toHaveAttribute("src", museumPortrait.imageUrl);
    expect(image).toHaveAttribute("alt", museumPortrait.imageAlt);
    expect(image).toHaveClass("object-contain");
    expect(container.querySelector("figcaption")).toHaveTextContent(
      `${museumPortrait.title}, ${museumPortrait.date}`,
    );
    const credit = container.querySelector("figcaption a");
    expect(credit).toHaveTextContent(museumPortrait.institution);
    expect(credit).toHaveAttribute("href", museumPortrait.url);
  });

  it.each([null, { ...museumPortrait, imageUrl: undefined }])(
    "keeps the illustrative disclosure when no usable museum image exists (%s)",
    (portrait) => {
      const container = renderHero(portrait);
      expect(container.querySelector("figure img")).toHaveAttribute(
        "src",
        expect.stringContaining("osiris.png"),
      );
      expect(
        container.querySelector('[data-testid="illustrative-image-caption"]'),
      ).toHaveTextContent(
        "Illustrative imageIllustration of Osiris. Generated with an AI image model; not a historical artifact.",
      );
      expect(container.querySelector("figcaption a")).toHaveAttribute(
        "href",
        "/about#images",
      );
      expect(container).not.toHaveTextContent(museumPortrait.institution);
    },
  );
});
