import { readFileSync } from "node:fs";
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

  it("uses the neutral default for Mesopotamian", () => {
    expect(tracks.get("mesopotamian-pantheon")).toBe("default.mp3");
  });
});
