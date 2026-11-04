import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/newsletter" }));

import NewsletterPage from "@/app/newsletter/page";

describe("/newsletter", () => {
  it("has its own sign-up form instead of pointing at the footer", () => {
    render(<NewsletterPage />);
    expect(
      screen.getByTestId("newsletter-newsletter_page"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/just below/)).toBeNull();
    const form = screen.getByTestId("newsletter-newsletter_page");
    expect(form.querySelector('a[href="/newsletter"]')).toBeNull();
  });
});
