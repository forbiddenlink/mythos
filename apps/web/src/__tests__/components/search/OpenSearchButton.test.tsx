import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OpenSearchButton } from "@/components/search/OpenSearchButton";

describe("OpenSearchButton shortcut hint", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows Ctrl outside Apple platforms", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Windows NT 10.0");
    render(<OpenSearchButton />);
    expect(screen.getByRole("button").textContent).toContain("CtrlK");
  });

  it("does not show Ctrl on a Mac", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Macintosh");
    render(<OpenSearchButton />);
    expect(screen.getByRole("button").textContent).not.toContain("Ctrl");
  });
});
