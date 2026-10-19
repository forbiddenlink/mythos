import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VersionMatrix } from "@/components/stories/VersionMatrix";
import { getMythVersions } from "@/lib/myth-versions";

function renderComparison(): void {
  const versions = getMythVersions("prometheus-fire");
  if (!versions) throw new Error("Missing researched comparison");
  render(<VersionMatrix versions={versions} />);
}

describe("VersionMatrix", () => {
  it("gives coincident dates separate, ordered source labels", () => {
    renderComparison();
    const chronology = screen.getByRole("list", {
      name: "Sources in chronological order",
    });
    const items = within(chronology).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("1 · 700 BCE");
    expect(items[0]).toHaveTextContent("Theogony");
    expect(items[1]).toHaveTextContent("2 · 700 BCE");
    expect(items[1]).toHaveTextContent("Works and Days");
    expect(chronology.querySelector('[style*="left"]')).toBeNull();
  });

  it("provides every moment, state, and passage link in mobile source cards", () => {
    renderComparison();
    const cards = screen.getAllByRole("article");
    const versions = getMythVersions("prometheus-fire")!;
    cards.forEach((card, index) => {
      const source = versions.sources[index];
      expect(within(card).getAllByRole("term")).toHaveLength(
        versions.beats.length,
      );
      for (const beat of versions.beats) {
        expect(within(card).getByText(beat.label)).toBeInTheDocument();
        expect(card).toHaveTextContent(source.cells[beat.id].note!);
      }
      expect(within(card).getByRole("link")).toHaveAttribute(
        "href",
        source.readingUrl,
      );
    });
    expect(cards[0]).toHaveTextContent("Not narrated here");
    expect(cards[0]).toHaveTextContent("comparison baseline");
  });

  it("retains desktop table row and column headers", () => {
    renderComparison();
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("columnheader")).toHaveLength(3);
    const rows = within(table).getAllByRole("rowheader");
    expect(rows).toHaveLength(5);
    rows.forEach((row) => {
      expect(row).toHaveAttribute("scope", "row");
    });
    expect(table).toHaveAccessibleName(/Rows are moments in the story/);
  });
});
