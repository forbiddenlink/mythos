import { describe, expect, it } from "vitest";
import de from "../../../messages/de.json";
import en from "../../../messages/en.json";
import es from "../../../messages/es.json";
import fr from "../../../messages/fr.json";

/** Every leaf key as a dotted path ("nav.explore"). */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("translation messages", () => {
  const english = keyPaths(en).sort();

  it.each([
    ["es", es],
    ["fr", fr],
    ["de", de],
  ])("%s has exactly the English keys", (_locale, messages) => {
    const keys = keyPaths(messages).sort();
    expect(keys.filter((key) => !english.includes(key))).toEqual([]);
    expect(english.filter((key) => !keys.includes(key))).toEqual([]);
  });
});
