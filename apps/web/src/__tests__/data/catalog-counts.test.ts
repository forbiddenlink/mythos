import { readFileSync } from "node:fs";
import { join } from "node:path";
import deities from "../../data/deities.json";
import stories from "../../data/stories.json";
import creatures from "../../data/creatures.json";
import artifacts from "../../data/artifacts.json";
import locations from "../../data/locations.json";

const { describe, it, expect } = await import("vitest");

const webRoot = join(__dirname, "..", "..", "..");
const repoRoot = join(webRoot, "..", "..");

function catalogLine(readme: string): string | undefined {
  return readme.split("\n").find((line) => /\d+ deities/.test(line));
}

describe("README catalog counts", () => {
  const expected = {
    deities: deities.length,
    stories: stories.length,
    creatures: creatures.length,
    artifacts: artifacts.length,
    locations: locations.length,
  };

  it.each([
    ["root README", join(repoRoot, "README.md")],
    ["web README", join(webRoot, "README.md")],
  ])("%s matches the JSON catalogs", (_label, path) => {
    const line = catalogLine(readFileSync(path, "utf8"));
    expect(line, path).toBeTruthy();
    expect(line).toMatch(new RegExp(`\\b${expected.deities} deities\\b`));
    expect(line).toMatch(new RegExp(`\\b${expected.stories} stories\\b`));
    expect(line).toMatch(new RegExp(`\\b${expected.creatures} creatures\\b`));
    expect(line).toMatch(new RegExp(`\\b${expected.artifacts} artifacts\\b`));
    expect(line).toMatch(
      new RegExp(`\\b${expected.locations}(?: mythological)? locations\\b`),
    );
  });
});
