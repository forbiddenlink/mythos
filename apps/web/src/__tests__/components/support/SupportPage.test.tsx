import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/support" }));

import SupportPage from "@/app/support/page";
import { SUPPORT_CHECKOUT_URL } from "@/components/support/SupportButton";
import { getPatronLink } from "@/lib/support-links";

const PATRON = "https://buy.stripe.com/test_patron";

describe("getPatronLink", () => {
  it("accepts only https Stripe links", () => {
    expect(getPatronLink(undefined)).toBeNull();
    expect(getPatronLink("")).toBeNull();
    expect(getPatronLink(PATRON)).toBe(PATRON);
    expect(getPatronLink("http://buy.stripe.com/x")).toBeNull();
    expect(getPatronLink("https://evil.example/x")).toBeNull();
    expect(getPatronLink("not a url")).toBeNull();
  });
});

describe("support page", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("offers only the one-time link when no patron link is set", () => {
    vi.stubEnv("NEXT_PUBLIC_STRIPE_PATRON_LINK", "");
    render(<SupportPage />);
    expect(
      screen.getByRole("link", { name: /Support through Stripe/ }),
    ).toHaveAttribute("href", SUPPORT_CHECKOUT_URL);
    expect(screen.queryByRole("link", { name: /Become a patron/ })).toBeNull();
    expect(screen.getByText(/no subscription/)).toBeInTheDocument();
  });

  it("adds the patron tier when configured", () => {
    vi.stubEnv("NEXT_PUBLIC_STRIPE_PATRON_LINK", PATRON);
    render(<SupportPage />);
    expect(
      screen.getByRole("link", { name: /Become a patron/ }),
    ).toHaveAttribute("href", PATRON);
    expect(
      screen.getByRole("link", { name: /Support through Stripe/ }),
    ).toHaveAttribute("href", SUPPORT_CHECKOUT_URL);
    expect(screen.queryByText(/no subscription/)).toBeNull();
  });
});
