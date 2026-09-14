import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const header = readFileSync(
  join(__dirname, "../../../components/layout/header.tsx"),
  "utf8",
);

describe("header hydration", () => {
  it("does not wrap the logo in framer-motion", () => {
    expect(header).not.toMatch(/from ["']framer-motion["']/);
    expect(header).not.toMatch(/<motion\./);
  });
});
