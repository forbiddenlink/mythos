import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const themeState = vi.hoisted(() => ({
  theme: "system",
  resolvedTheme: "dark",
  setTheme: vi.fn(),
}));

vi.mock("next-themes", () => ({ useTheme: () => themeState }));

describe("ThemeToggle", () => {
  beforeEach(() => themeState.setTheme.mockClear());

  it.each([
    ["dark", "light"],
    ["light", "dark"],
  ])("switches a system %s theme to %s", (current, target) => {
    themeState.resolvedTheme = current;
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: `Switch to ${target} mode` }));
    expect(themeState.setTheme).toHaveBeenCalledWith(target);
  });
});
