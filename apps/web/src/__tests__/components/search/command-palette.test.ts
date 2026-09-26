import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("command palette navigation", () => {
  it("disables cmdk's built-in filter so search results stay clickable", () => {
    const src = readFileSync(
      join(__dirname, "../../../components/ui/command.tsx"),
      "utf8",
    );
    expect(src).toMatch(/shouldFilter=\{false\}/);
  });

  it("defers router.push until after the dialog starts closing", () => {
    const src = readFileSync(
      join(__dirname, "../../../components/search/GlobalSearch.tsx"),
      "utf8",
    );
    expect(src).toMatch(/event\.preventDefault\(\)/);
    expect(src).toMatch(/router\.push\(href\)/);
  });
});
