import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import deities from "@/data/deities.json";
import provenance from "@/data/image-provenance.json";
import { IllustrativeImageCaption } from "@/components/content/IllustrativeImageCaption";
import {
  countImagesByKind,
  getIllustrativeImageNote,
} from "@/lib/image-provenance";

describe("getIllustrativeImageNote", () => {
  it("returns a slim note for an illustrated entity", () => {
    const deity = deities.find((d) =>
      Boolean(
        (provenance.entities.deity as Record<string, string>)[d.id] &&
        d.imageUrl,
      ),
    );
    expect(deity).toBeDefined();
    const note = getIllustrativeImageNote("deity", deity!.id);
    expect(note).toBeDefined();
    expect(Object.keys(note!).sort()).toEqual(["kind", "label"]);
    expect(note!.kind).toMatch(/^illustration-/);
  });

  it("returns undefined for an unknown entity", () => {
    expect(getIllustrativeImageNote("deity", "no-such-deity")).toBeUndefined();
  });

  it("counts every recorded image once", () => {
    const counts = countImagesByKind();
    const recorded = Object.values(provenance.entities).reduce(
      (sum, byId) => sum + Object.keys(byId).length,
      0,
    );
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(recorded);
    expect(counts["illustration-ai"]).toBeGreaterThan(0);
  });
});

describe("IllustrativeImageCaption", () => {
  it("labels the image as illustrative in visible text and links to the explanation", () => {
    render(
      <figure>
        <IllustrativeImageCaption
          note={{ kind: "illustration-ai", label: "AI-generated illustration" }}
          subject="Illustration of Athena"
        />
      </figure>,
    );
    const caption = screen.getByTestId("illustrative-image-caption");
    expect(caption.tagName).toBe("FIGCAPTION");
    expect(caption).toHaveTextContent("Illustrative image");
    expect(caption).toHaveTextContent("Generated with an AI image model");
    expect(caption).toHaveTextContent("not a historical artifact");
    expect(
      screen.getByRole("link", { name: "About our images" }),
    ).toHaveAttribute("href", "/about#images");
  });

  it("still marks the image when no provenance record is passed", () => {
    render(
      <figure>
        <IllustrativeImageCaption subject="Illustration of Mount Olympus" />
      </figure>,
    );
    expect(screen.getByTestId("illustrative-image-caption")).toHaveTextContent(
      "Illustrative image",
    );
  });
});
