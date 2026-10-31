import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import changelogData from "@/data/changelog.json";
import {
  ChangelogEntry,
  type ChangelogEntryData,
} from "@/components/changelog/ChangelogEntry";

const entries = changelogData as ChangelogEntryData[];

describe("changelog entry anchors", () => {
  it("gives every entry a unique, URL-safe id", () => {
    const ids = entries.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[A-Za-z0-9][A-Za-z0-9._-]*$/);
  });

  it("renders the id as the element id and links to it without a type filter", () => {
    const entry = entries[0];
    const { container } = render(<ChangelogEntry entry={entry} />);
    expect(container.querySelector(`#${CSS.escape(entry.id)}`)).not.toBeNull();
    const link = screen.getByRole("link", { name: "Link to this entry" });
    expect(link.getAttribute("href")).toBe(`/changelog#${entry.id}`);
  });
});
