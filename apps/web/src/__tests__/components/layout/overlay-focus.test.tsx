import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CookieConsent } from "@/components/privacy/CookieConsent";

vi.mock("@/hooks/use-progress", () => ({
  useProgress: () => ({ progress: { dailyStreak: 0 } }),
}));
vi.mock("@/providers/review-provider", () => ({
  useReview: () => ({ dueCount: 0 }),
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("mobile menu focus", () => {
  it("returns focus to the menu button when Escape closes it", async () => {
    const user = userEvent.setup();
    render(
      <MobileNav
        sections={[
          { title: "Explore", links: [{ href: "/deities", label: "Deities" }] },
        ]}
      />,
    );
    const opener = screen.getByRole("button", { name: "Open Menu" });
    await user.click(opener);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});

describe("cookie preferences focus", () => {
  it("moves focus into the banner on reopen, and Escape returns it to the opener", () => {
    localStorage.setItem("mythos-cookie-consent", "accepted");
    render(
      <>
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new Event("mythos-cookie-consent-open"))
          }
        >
          Cookie Settings
        </button>
        <CookieConsent />
      </>,
    );
    const opener = screen.getByRole("button", { name: "Cookie Settings" });
    opener.focus();
    act(() => {
      fireEvent.click(opener);
    });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(localStorage.getItem("mythos-cookie-consent")).toBe("rejected");
  });
});
