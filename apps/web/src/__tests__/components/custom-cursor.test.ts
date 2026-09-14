import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("CustomCursor", () => {
  it("does not hide the system pointer", () => {
    const src = readFileSync(
      join(__dirname, "../../components/effects/CustomCursor.tsx"),
      "utf8",
    );
    expect(src).not.toMatch(/cursor:\s*none/);
    expect(src).not.toMatch(/style\.cursor\s*=\s*["']none["']/);
  });
});
