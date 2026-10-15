import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  resolve(process.cwd(), "src/components/audio/AudioContext.tsx"),
  "utf8",
);

const block = source.match(/PANTHEON_TRACKS[^=]*=\s*\{([\s\S]*?)\n\};/);
const tracks = new Map<string, string>(
  [
    ...(block?.[1] ?? "").matchAll(
      /"?([\w-]+)"?:\s*"\/audio\/ambient\/([\w-]+\.mp3)"/g,
    ),
  ].map((m) => [m[1], m[2]] as [string, string]),
);

describe("PANTHEON_TRACKS", () => {
  it("parses the track table", () => {
    expect(tracks.size).toBeGreaterThan(20);
  });

  it("never plays another culture's music under a tradition", () => {
    for (const [key, file] of tracks) {
      if (key === "default" || file === "default.mp3") continue;
      const culture = key.replace("-pantheon", "");
      const owner = file.replace("-ambiance.mp3", "");
      // Mesoamerican is the one regional umbrella that shares the Aztec track.
      if (culture === "mesoamerican" && owner === "aztec") continue;
      expect(owner, `${key} -> ${file}`).toBe(culture);
    }
  });

  it("gives each generated pantheon its own bespoke track", () => {
    for (const id of [
      "mesopotamian",
      "slavic",
      "hittite",
      "canaanite",
      "inca",
      "persian",
      "finnish",
      "korean",
    ]) {
      expect(tracks.get(`${id}-pantheon`)).toBe(`${id}-ambiance.mp3`);
    }
  });

  it("keeps the neutral default for living-tradition pantheons", () => {
    for (const id of [
      "african",
      "yoruba",
      "akan",
      "polynesian",
      "haudenosaunee",
      "tlingit-haida",
      "inuit",
      "aboriginal-australian",
      "dine",
    ]) {
      expect(tracks.get(`${id}-pantheon`)).toBe("default.mp3");
    }
  });

  it("references only files that exist on disk", () => {
    for (const file of new Set(tracks.values())) {
      expect(
        existsSync(resolve(process.cwd(), "public/audio/ambient", file)),
        file,
      ).toBe(true);
    }
  });
});
