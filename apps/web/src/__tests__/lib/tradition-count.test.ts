import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { metadata } from "@/app/pantheons/layout";
import pantheons from "@/data/pantheons.json";
import { getTraditionCount, getTraditions } from "@/lib/data/catalog";

const srcRoot = join(__dirname, "..", "..");

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (name === "__tests__" || name === "data") continue;
    if (statSync(path).isDirectory()) sourceFiles(path, out);
    else if (/\.(tsx?|mjs)$/.test(name)) out.push(path);
  }
  return out;
}

describe("tradition count", () => {
  it("counts pantheon records that are not collections", () => {
    const expected = (pantheons as Array<{ isCollection?: boolean }>).filter(
      (p) => !p.isCollection,
    ).length;
    expect(getTraditionCount()).toBe(expected);
    expect(getTraditions().some((p) => p.isCollection)).toBe(false);
  });

  it("uses the same count in the pantheon index metadata", () => {
    expect(metadata.title).toMatchObject({
      default: expect.stringContaining(`${getTraditionCount()} Traditions`),
    });
    expect(metadata.description).toContain(
      `${getTraditionCount()} mythological traditions`,
    );
  });

  it("is never hardcoded in page copy", () => {
    const offenders = sourceFiles(srcRoot)
      .filter((file) =>
        /\b\d{1,2} (?:pantheons|traditions|civilizations|world cultures)\b/.test(
          readFileSync(file, "utf8"),
        ),
      )
      .map((file) => relative(srcRoot, file));
    expect(offenders).toEqual([]);
  });
});
