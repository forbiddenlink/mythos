import { describe, expect, it } from "vitest";
import artifacts from "@/data/artifacts.json";
import creatures from "@/data/creatures.json";
import locations from "@/data/locations.json";
import stories from "@/data/stories.json";
import { aliasRedirects, SLUG_ALIASES } from "@/lib/slug-aliases";

// The exact list next.config.ts produced before the four alias modules were
// merged. Public redirect behaviour must stay identical.
const EXPECTED = [
  ["/stories/five-suns-mesoamerican", "/stories/five-suns"],
  ["/stories/five-suns-mesoamerican/read", "/stories/five-suns/read"],
  ["/stories/birth-huitzilopochtli", "/stories/birth-of-huitzilopochtli"],
  [
    "/stories/birth-huitzilopochtli/read",
    "/stories/birth-of-huitzilopochtli/read",
  ],
  ["/stories/birth-huitzilopochtli-full", "/stories/birth-of-huitzilopochtli"],
  [
    "/stories/birth-huitzilopochtli-full/read",
    "/stories/birth-of-huitzilopochtli/read",
  ],
  ["/stories/fall-of-quetzalcoatl-tula", "/stories/quetzalcoatl-fall-exile"],
  [
    "/stories/fall-of-quetzalcoatl-tula/read",
    "/stories/quetzalcoatl-fall-exile/read",
  ],
  ["/creatures/ahuizotl-aztec", "/creatures/ahuizotl"],
  ["/creatures/cipactli-aztec", "/creatures/cipactli"],
  ["/creatures/itzpapalotl-obsidian", "/creatures/itzpapalotl-obsidian-host"],
  ["/artifacts/shangos-oshe", "/artifacts/oshe-of-shango"],
  ["/artifacts/me", "/artifacts/the-me"],
  ["/locations/coatepec-aztec", "/locations/coatepec"],
  ["/locations/tamoanchan-aztec", "/locations/tamoanchan"],
].map(([source, destination]) => ({ source, destination, permanent: true }));

describe("slug aliases", () => {
  it("produces the same redirects next.config.ts did before the merge", () => {
    expect(aliasRedirects()).toEqual(EXPECTED);
  });

  const catalogs = {
    stories: new Set(stories.map((s: { slug: string }) => s.slug)),
    creatures: new Set(creatures.map((c: { slug: string }) => c.slug)),
    artifacts: new Set(artifacts.map((a: { slug: string }) => a.slug)),
    locations: new Set(locations.map((l: { id: string }) => l.id)),
  };

  for (const [kind, aliases] of Object.entries(SLUG_ALIASES)) {
    it(`${kind}: every alias target exists and no alias is still a page`, () => {
      const known = catalogs[kind as keyof typeof catalogs];
      for (const [from, to] of Object.entries(aliases)) {
        expect(known.has(to), `${kind} target ${to}`).toBe(true);
        expect(known.has(from), `${kind} alias ${from}`).toBe(false);
      }
    });
  }
});
