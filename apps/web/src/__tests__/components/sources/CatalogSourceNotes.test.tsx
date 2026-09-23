import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CatalogSourceNotes } from "@/components/sources/CatalogSourceNotes";

describe("CatalogSourceNotes", () => {
  it("keeps bibliographic context without publishing unchecked quotation text", () => {
    const { container } = render(
      <CatalogSourceNotes
        sources={[
          {
            source: "A recorded work",
            date: "c. 700 BCE",
            text: "Unchecked wording",
          },
        ]}
      />,
    );
    expect(screen.getByText("A recorded work")).toBeInTheDocument();
    expect(screen.getByText("Catalog date: c. 700 BCE")).toBeInTheDocument();
    expect(
      screen.getByText(/quotations are not displayed/),
    ).toBeInTheDocument();
    expect(screen.queryByText("Unchecked wording")).not.toBeInTheDocument();
    expect(container.querySelector("blockquote")).toBeNull();
  });

  it("does not advertise sources when no records exist", () => {
    const { container } = render(<CatalogSourceNotes sources={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
