import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EntitySources } from "@/components/sources/EntitySources";
import type { PrimarySourceExcerpt } from "@/components/sources/SourceExcerpt";

const excerpt: PrimarySourceExcerpt = {
  text: "Checked original",
  translation: "Checked translation",
  source: "Homer, Iliad",
  sourceId: "iliad",
  quoteStatus: "editorial-paraphrase",
  verification: "verified",
  sourceUrl: "https://example.com/iliad",
  edition: "Named edition",
};

describe("EntitySources", () => {
  it("preserves additional catalog works beside excerpts without publishing unchecked text", () => {
    render(
      <EntitySources
        provenance={false}
        primarySourceExcerpts={[excerpt]}
        primarySources={[
          {
            sourceId: "iliad",
            source: "Different label for the Iliad",
            text: "Unchecked Iliad",
          },
          {
            sourceId: "odyssey",
            source: "Homer, Odyssey",
            date: "c. 700 BCE",
            text: "Unchecked Odyssey",
          },
        ]}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Ancient sources" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Homer, Odyssey")).toBeInTheDocument();
    expect(screen.getByText("Catalog date: c. 700 BCE")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Their passage wording and translation have not been checked/,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Different label for the Iliad")).toBeNull();
    expect(screen.queryByText("Unchecked Iliad")).toBeNull();
    expect(screen.queryByText("Unchecked Odyssey")).toBeNull();
  });

  it("matches legacy labels without IDs but preserves works with distinct IDs", () => {
    render(
      <EntitySources
        provenance={false}
        primarySourceExcerpts={[excerpt]}
        primarySources={[
          { source: "  HOMER,   ILIAD ", text: "Legacy unchecked" },
          {
            sourceId: "another-work",
            source: "Homer, Iliad",
            text: "Other unchecked",
          },
        ]}
      />,
    );
    expect(screen.getAllByText("Homer, Iliad")).toHaveLength(2);
    expect(screen.queryByText("Legacy unchecked")).toBeNull();
    expect(screen.queryByText("Other unchecked")).toBeNull();
  });

  it("omits catalog notes when all works have visible excerpts", () => {
    render(
      <EntitySources
        provenance={false}
        primarySourceExcerpts={[excerpt]}
        primarySources={[
          { sourceId: "iliad", source: "Homer, Iliad", text: "Unchecked" },
        ]}
      />,
    );
    expect(screen.queryByRole("heading", { name: "Source notes" })).toBeNull();
  });
});
