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
});
