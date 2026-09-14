import { describe, expect, it } from "vitest";
import {
  canonicalCreatureSlug,
  CREATURE_ALIASES,
} from "@/lib/creature-aliases";

describe("creature aliases", () => {
  it("sends duplicate Aztec/Mesoamerican slugs to one canonical creature", () => {
    expect(canonicalCreatureSlug("ahuizotl-aztec")).toBe("ahuizotl");
    expect(canonicalCreatureSlug("cipactli-aztec")).toBe("cipactli");
    expect(canonicalCreatureSlug("itzpapalotl-obsidian")).toBe(
      "itzpapalotl-obsidian-host",
    );
    expect(canonicalCreatureSlug("ahuizotl")).toBe("ahuizotl");
  });

  it("does not alias unrelated creatures", () => {
    expect(Object.keys(CREATURE_ALIASES).length).toBe(3);
  });
});
