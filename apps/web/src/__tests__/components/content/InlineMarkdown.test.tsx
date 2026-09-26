import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InlineMarkdown } from "@/components/content/reading-prose";

describe("InlineMarkdown", () => {
  it("renders *emphasis* and **strong** without raw asterisks", () => {
    const { container } = render(
      <p>
        <InlineMarkdown text="Burkert, Walter. *Greek Religion* (Harvard, 1985) — **key**." />
      </p>,
    );
    expect(container.querySelector("em")?.textContent).toBe("Greek Religion");
    expect(container.querySelector("strong")?.textContent).toBe("key");
    expect(container.textContent).not.toContain("*");
  });

  it("leaves a lone asterisk as text", () => {
    const { container } = render(<InlineMarkdown text="5 * 3 = 15" />);
    expect(container.textContent).toBe("5 * 3 = 15");
    expect(container.querySelector("em")).toBeNull();
  });
});
