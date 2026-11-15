import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/layout/FooterTools", () => ({ FooterTools: () => null }));
vi.mock("@/components/newsletter/NewsletterSignup", () => ({
  NewsletterSignup: () => null,
}));
vi.mock("@/components/layout/CorrectionLink", () => ({
  CorrectionLink: () => null,
}));

import { Footer } from "@/components/layout/footer";

// Tailwind classes are the only layout signal jsdom has, so assert on them:
// below the sm breakpoint every footer control must reserve a 44px target.
const hasMobileTarget = (el: HTMLElement) =>
  /(^|\s)min-h-11(\s|$)/.test(el.className) ||
  /(^|\s)size-11(\s|$)/.test(el.className);

describe("Footer tap targets (below sm)", () => {
  it("gives every column link a 44px minimum height on mobile", () => {
    render(<Footer />);
    const info = screen.getByRole("heading", { name: "Info" }).parentElement!;
    const links = within(info).getAllByRole("link");
    expect(links.length).toBeGreaterThan(5);
    for (const link of links) {
      expect(hasMobileTarget(link), link.textContent ?? "").toBe(true);
    }
  });

  it("gives the Cookie Settings control and the GitHub icon 44px targets", () => {
    render(<Footer />);
    expect(
      hasMobileTarget(screen.getByRole("button", { name: /cookie/i })),
    ).toBe(true);
    expect(
      hasMobileTarget(
        screen.getByRole("link", { name: "View source on GitHub" }),
      ),
    ).toBe(true);
  });
});
