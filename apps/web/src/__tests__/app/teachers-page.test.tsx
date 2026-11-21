import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/teachers" }));

import TeachersPage from "@/app/teachers/page";

describe("/teachers", () => {
  it("offers the weekly email after the resources, as an option", () => {
    render(<TeachersPage />);
    const form = screen.getByTestId("newsletter-teachers");
    expect(
      within(form).getByRole("heading", {
        level: 2,
        name: "One myth a week, by email",
      }),
    ).toBeVisible();
    expect(
      within(form).getByText(/separate from the worksheets/),
    ).toBeVisible();
    expect(within(form).getByRole("checkbox")).not.toBeChecked();

    // Below every resource section, so the free material comes first.
    const lastSection = screen.getByRole("heading", { name: "Study guides" });
    expect(
      lastSection.compareDocumentPosition(form) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
