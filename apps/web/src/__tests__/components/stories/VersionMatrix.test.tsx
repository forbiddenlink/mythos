import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VersionMatrix } from "@/components/stories/VersionMatrix";
import { getMythVersions } from "@/lib/myth-versions";

function renderComparison(slug = "prometheus-fire"): void {
  const versions = getMythVersions(slug);
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

  it("groups the mobile comparison by moment and keeps edition links available", () => {
    renderComparison();
    const versions = getMythVersions("prometheus-fire")!;
    fireEvent.click(
      screen.getByText("Source editions", { selector: "summary" }),
    );
    const editions = within(
      screen.getByRole("list", { name: "Source editions" }),
    );
    const links = editions.getAllByRole("link");
    versions.sources.forEach((source, index) => {
      expect(links[index]).toHaveAttribute("href", source.readingUrl);
    });
    expect(editions.getByText(/comparison baseline/)).toBeInTheDocument();

    for (const beat of versions.beats) {
      const scene = within(screen.getByRole("article", { name: beat.label }));
      const terms = scene.getAllByRole("term");
      versions.sources.forEach((source, index) => {
        expect(terms[index]).toHaveTextContent(source.name);
        expect(
          scene.getByText(source.cells[beat.id].note!),
        ).toBeInTheDocument();
      });
    }
  });

  it("keeps Inanna and Ishtar's passage locators with the right edition on both layouts", () => {
    renderComparison("inanna-descent");
    fireEvent.click(
      screen.getByText("Source editions", { selector: "summary" }),
    );
    const editions = within(
      screen.getByRole("list", { name: "Source editions" }),
    );
    expect(
      editions.getByRole("link", { name: /Oxford translation/ }),
    ).toHaveAttribute(
      "href",
      "https://etcsl.orinst.ox.ac.uk/section1/tr141.htm",
    );
    expect(
      editions.getByRole("link", { name: /SOAS translation and audio/ }),
    ).toHaveAttribute(
      "href",
      expect.stringContaining("www.soas.ac.uk/baplar/"),
    );

    const scene = within(
      screen.getByRole("article", { name: "Stripped at seven gates" }),
    );
    const [sumerian, akkadian] = scene.getAllByRole("definition");
    expect(sumerian).toHaveTextContent("Lines 129–163");
    expect(akkadian).toHaveTextContent("Lines 42–62");

    const row = within(
      screen.getByRole("row", { name: /Stripped at seven gates/ }),
    );
    expect(row.getByText("Lines 129–163")).toBeInTheDocument();
    expect(row.getByText("Lines 42–62")).toBeInTheDocument();
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
