import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CurrentYear } from "@/components/layout/CurrentYear";

describe("CurrentYear", () => {
  it("replaces a stale build year with the visitor's current year", async () => {
    render(
      <p>
        © <CurrentYear buildYear={2000} /> Mythos Atlas
      </p>,
    );
    expect(
      await screen.findByText(`© ${new Date().getFullYear()} Mythos Atlas`),
    ).toBeInTheDocument();
  });
});
