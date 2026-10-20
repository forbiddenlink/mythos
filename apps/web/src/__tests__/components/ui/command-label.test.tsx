import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  CommandDialog,
  CommandInput,
  CommandList,
} from "@/components/ui/command";

describe("command palette accessible name", () => {
  it("points the input's aria-labelledby at a label that has text", () => {
    render(
      <CommandDialog open onOpenChange={() => {}}>
        <CommandInput placeholder="Search deities, stories, creatures..." />
        <CommandList />
      </CommandDialog>,
    );
    const input = screen.getByRole("combobox");
    const labelId = input.getAttribute("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId as string)?.textContent).toBe(
      "Search mythology content",
    );
    expect(screen.getByRole("combobox", { name: "Search mythology content" }))
      .toBeTruthy();
  });

  it("uses the dialog title as the label when one is given", () => {
    render(
      <CommandDialog open onOpenChange={() => {}} title="Search Mythos Atlas">
        <CommandInput />
        <CommandList />
      </CommandDialog>,
    );
    const labelId = screen.getByRole("combobox").getAttribute("aria-labelledby");
    expect(document.getElementById(labelId as string)?.textContent).toBe(
      "Search Mythos Atlas",
    );
  });
});
