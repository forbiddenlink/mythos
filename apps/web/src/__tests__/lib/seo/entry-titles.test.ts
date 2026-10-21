import { describe, expect, it } from "vitest";
import {
  creatureTitle,
  deityKind,
  deityTitle,
  godsOfPageTitle,
  heroTitle,
  locationTitle,
  mythologyName,
  TITLE_BUDGET,
} from "@/lib/seo/entry-titles";

describe("deityKind", () => {
  it.each([
    ["male", "God"],
    ["female", "Goddess"],
    ["androgynous", "Deity"],
    ["none", "Deity"],
    [undefined, "Deity"],
  ])("%s -> %s", (gender, expected) => {
    expect(deityKind(gender)).toBe(expected);
  });
});

describe("deityTitle", () => {
  it("builds a query-shaped title from gender and the first domains", () => {
    expect(
      deityTitle(
        {
          name: "Zeus",
          gender: "male",
          domain: ["sky", "thunder", "lightning", "law", "order"],
        },
        "Greek",
      ),
    ).toBe("Zeus: Greek God of Sky, Thunder and Lightning");
  });

  it("uses Goddess for female deities", () => {
    expect(
      deityTitle(
        { name: "Hera", gender: "female", domain: ["marriage"] },
        "Greek",
      ),
    ).toBe("Hera: Greek Goddess of Marriage");
  });

  it("degrades to Deity with no domains", () => {
    expect(deityTitle({ name: "Nameless" }, "Norse")).toBe(
      "Nameless: Norse Deity",
    );
  });

  it("drops domains until the title fits the budget", () => {
    const title = deityTitle(
      {
        name: "Quetzalcoatl",
        gender: "male",
        domain: ["wind and learning", "the morning star", "priesthood"],
      },
      "Aztec",
    );
    expect(title.length).toBeLessThanOrEqual(TITLE_BUDGET);
    expect(title.startsWith("Quetzalcoatl: Aztec God of ")).toBe(true);
  });

  it("merges domain spellings and skips duplicates", () => {
    expect(
      deityTitle(
        { name: "Ares", gender: "male", domain: ["war", "Warfare", "courage"] },
        "Greek",
      ),
    ).toBe("Ares: Greek God of War and Courage");
  });
});

describe("creatureTitle", () => {
  it("appends a short habitat", () => {
    expect(
      creatureTitle({ name: "Hydra", habitat: "Lake Lerna" }, "Greek"),
    ).toBe("Hydra: Greek Mythological Creature of Lake Lerna");
  });

  it("omits a habitat that would overflow the budget", () => {
    expect(
      creatureTitle(
        { name: "Minotaur", habitat: "The Labyrinth of Crete" },
        "Greek",
      ),
    ).toBe("Minotaur: Greek Mythological Creature");
  });

  it("omits a parenthetical habitat", () => {
    expect(
      creatureTitle(
        { name: "Apep", habitat: "The Duat (Underworld)" },
        "Egyptian",
      ),
    ).toBe("Apep: Egyptian Mythological Creature");
  });

  it("works with no habitat", () => {
    expect(creatureTitle({ name: "Sphinx" }, "Greek")).toBe(
      "Sphinx: Greek Mythological Creature",
    );
  });
});

describe("heroTitle", () => {
  it("names the tradition", () => {
    expect(heroTitle({ name: "Theseus" }, "Greek")).toBe("Theseus: Greek Hero");
  });
});

describe("mythologyName", () => {
  it.each([
    ["Roman Pantheon", "Roman Mythology"],
    ["Persian (Iranian) Tradition", "Persian Mythology"],
    ["Finnish Tradition (Kalevala)", "Finnish Mythology"],
    ["Canaanite Pantheon (Ugarit)", "Canaanite Mythology"],
    ["African Traditions", "African Traditions"],
  ])("%s -> %s", (name, expected) => {
    expect(mythologyName({ name })).toBe(expected);
  });
  it("falls back for a missing tradition", () => {
    expect(mythologyName(undefined)).toBe("Ancient Mythology");
  });
});

describe("locationTitle", () => {
  const finnish = { name: "Finnish Tradition (Kalevala)" };
  it("adds the place type when the name does not carry it", () => {
    expect(
      locationTitle({ name: "Pohjola", locationType: "realm" }, finnish),
    ).toBe("Pohjola: Realm in Finnish Mythology");
  });
  it("skips the type when the name already says it", () => {
    expect(
      locationTitle(
        { name: "Mount Damavand", locationType: "mountain" },
        { name: "Persian (Iranian) Tradition" },
      ),
    ).toBe("Mount Damavand in Persian Mythology");
    expect(
      locationTitle(
        { name: "Lake Avernus", locationType: "lake" },
        { name: "Roman Pantheon" },
      ),
    ).toBe("Lake Avernus in Roman Mythology");
  });
  it("stays within the title budget", () => {
    const title = locationTitle(
      { name: "Sacred Grove of the Wood", locationType: "sacred_site" },
      { name: "Aboriginal Australian Traditions" },
    );
    expect(title.length).toBeLessThanOrEqual(TITLE_BUDGET);
  });
});

describe("godsOfPageTitle", () => {
  it("leads with the query phrase and a concrete count", () => {
    expect(godsOfPageTitle("Gods of Wisdom", 19, 14)).toBe(
      "Gods of Wisdom in World Mythology: 19 Deities",
    );
  });
  it("shortens a long label to fit", () => {
    const title = godsOfPageTitle("Gods of Agriculture and Fertility", 40, 20);
    expect(title.length).toBeLessThanOrEqual(TITLE_BUDGET);
  });
});
