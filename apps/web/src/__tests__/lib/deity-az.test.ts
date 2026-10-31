import { describe, expect, it } from "vitest";
import { getDeityListItems } from "@/lib/data/catalog";
import { groupDeitiesAlphabetically } from "@/lib/deity-az";

describe("groupDeitiesAlphabetically", () => {
  it("groups by first letter, ignoring diacritics and case", () => {
    const groups = groupDeitiesAlphabetically([
      {
        name: "Ōkuninushi",
        slug: "okuninushi",
        pantheonId: "japanese-pantheon",
      },
      { name: "odin", slug: "odin", pantheonId: "norse-pantheon" },
      { name: "Anubis", slug: "anubis", pantheonId: "egyptian-pantheon" },
    ]);
    expect(groups.map((g) => g.letter)).toEqual(["A", "O"]);
    expect(groups[1].entries.map((e) => e.slug)).toEqual([
      "odin",
      "okuninushi",
    ]);
  });

  it("sorts entries inside a letter by name", () => {
    const [group] = groupDeitiesAlphabetically([
      { name: "Zeus", slug: "zeus", pantheonId: "greek-pantheon" },
      { name: "Zephyrus", slug: "zephyrus", pantheonId: "greek-pantheon" },
    ]);
    expect(group.entries.map((e) => e.name)).toEqual(["Zephyrus", "Zeus"]);
  });

  it("keeps every deity in the catalog exactly once", () => {
    const all = getDeityListItems();
    const grouped = groupDeitiesAlphabetically(all).flatMap((g) => g.entries);
    expect(grouped).toHaveLength(all.length);
    expect(new Set(grouped.map((e) => e.slug)).size).toBe(all.length);
  });

  it("puts a name that does not start with a letter under #", () => {
    const groups = groupDeitiesAlphabetically([
      { name: "'Oro", slug: "oro", pantheonId: "polynesian-pantheon" },
    ]);
    expect(groups[0].letter).toBe("O");
    const odd = groupDeitiesAlphabetically([
      { name: "123", slug: "x", pantheonId: "p" },
    ]);
    expect(odd[0].letter).toBe("#");
  });
});
