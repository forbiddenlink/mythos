import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CitationSourcesList } from "@/components/sources/CitationSourcesList";

describe("CitationSourcesList", () => {
  it("renders titles and authors", () => {
    render(
      <CitationSourcesList
        variant="story"
        sources={[
          {
            title: "Theogony",
            author: "Hesiod",
            lines: "617-735",
            type: "primary",
          },
          { title: "Library", author: "Apollodorus", book: "1.2.1" },
        ]}
      />,
    );
    expect(screen.getByText("Theogony")).toBeInTheDocument();
    expect(screen.getByText(/Hesiod/)).toBeInTheDocument();
    expect(screen.getByText("Library")).toBeInTheDocument();
    expect(screen.getByText("primary")).toBeInTheDocument();
  });

  it("returns null for empty sources", () => {
    const { container } = render(
      <CitationSourcesList variant="deity" sources={[]} />,
    );
    expect(container.firstChild).toBeNull();
  });
  it("labels two citation sections independently without duplicate heading ids", () => {
    const { container } = render(
      <>
        <CitationSourcesList
          title="Relationship sources"
          headingId="relationship-sources-heading"
          sources={[
            { title: "Theogony — Rhea parent of Zeus", lines: "453–506" },
          ]}
        />
        <CitationSourcesList sources={[{ title: "Iliad", author: "Homer" }]} />
      </>,
    );
    const relationship = screen.getByRole("region", {
      name: "Relationship sources",
    });
    const works = screen.getByRole("region", { name: "Works cited" });
    expect(relationship).not.toBe(works);
    expect(relationship).toHaveAttribute(
      "aria-labelledby",
      "relationship-sources-heading",
    );
    expect(works).toHaveAttribute("aria-labelledby", "works-cited-heading");
    const headingIds = [...container.querySelectorAll("h3")].map(
      (heading) => heading.id,
    );
    expect(new Set(headingIds).size).toBe(headingIds.length);
    expect(relationship).toContainElement(
      screen.getByText("Theogony — Rhea parent of Zeus"),
    );
    expect(works).toContainElement(screen.getByText("Iliad"));
  });
});
