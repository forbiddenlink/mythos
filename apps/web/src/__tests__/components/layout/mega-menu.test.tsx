import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import { MegaMenu } from "@/components/layout/mega-menu";
import enMessages from "../../../../messages/en.json";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

function renderMenu() {
  render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <MegaMenu />
    </NextIntlClientProvider>,
  );
  return screen.getByRole("button", { name: /explore/i });
}

describe("MegaMenu", () => {
  it("stays open when a mouse user clicks the trigger they are hovering", () => {
    const trigger = renderMenu();
    fireEvent.mouseEnter(trigger.parentElement as HTMLElement);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("closes on a later, deliberate click", () => {
    vi.useFakeTimers();
    try {
      const trigger = renderMenu();
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      vi.advanceTimersByTime(1000);
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    } finally {
      vi.useRealTimers();
    }
  });
});
