import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { useFocusTrap } from "@/hooks/use-focus-trap";

function TrapHarness({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(active, ref);
  return (
    <div ref={ref} data-testid="trap">
      <button type="button">first</button>
      <button type="button">second</button>
    </div>
  );
}

describe("useFocusTrap", () => {
  it("moves focus from last to first on Tab", async () => {
    const user = userEvent.setup();
    render(<TrapHarness active />);

    const second = screen.getByRole("button", { name: "second" });
    const first = screen.getByRole("button", { name: "first" });

    second.focus();
    expect(document.activeElement).toBe(second);

    await user.tab();

    expect(document.activeElement).toBe(first);
  });

  it("moves focus from first to last on Shift+Tab", async () => {
    const user = userEvent.setup();
    render(<TrapHarness active />);

    const second = screen.getByRole("button", { name: "second" });
    const first = screen.getByRole("button", { name: "first" });

    first.focus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");

    expect(document.activeElement).toBe(second);
  });
});
