import { describe, it, expect } from "vitest";
import { searchAll } from "@/lib/search";
import { foldForSearch } from "@/lib/search-fold";
import { capPerType } from "@/lib/search-engine";

describe("foldForSearch", () => {
  it("strips diacritics and lower-cases", () => {
    expect(foldForSearch("Cú Chulainn")).toBe("cu chulainn");
    expect(foldForSearch("Väinämöinen")).toBe("vainamoinen");
    expect(foldForSearch("Šauška")).toBe("sauska");
  });

  it("maps letters that do not decompose", () => {
    expect(foldForSearch("Höðr")).toBe("hodr");
    expect(foldForSearch("Áłtsé")).toBe("altse");
  });

  it("treats curly and modifier apostrophes as a plain one", () => {
    expect(foldForSearch("Chang’e")).toBe("chang'e");
    expect(foldForSearch("Naayéʼ")).toBe("naaye'");
  });
});

describe("search ranking", () => {
  it("ranks whole-word matches above mid-word substrings", () => {
    const titles = searchAll("thor", 20).map((r) => r.title);
    const hathor = titles.indexOf("Hathor");
    // Entries about Thor mention him as a word; Hathor only contains "thor".
    for (const related of ["Sif", "Mjolnir", "Megingjord"]) {
      expect(titles.indexOf(related), related).toBeGreaterThan(-1);
      if (hathor > -1) {
        expect(titles.indexOf(related), related).toBeLessThan(hathor);
      }
    }
  });

  it.each([
    ["Hera", "deity", "hera"],
    ["Prometheus", "deity", "prometheus"],
    ["Thor", "deity", "thor"],
  ])("puts the entry named %s first", (query, type, slug) => {
    const [top] = searchAll(query);
    expect({ type: top?.type, slug: top?.slug }).toEqual({ type, slug });
  });

  it.each([
    ["Cu Chulainn", "hero", "cu-chulainn"],
    ["Vainamoinen", "deity", "vainamoinen"],
    ["Morrigan", "deity", "morrigan"],
    ["Manannan mac Lir", "deity", "manannan-mac-lir"],
    ["Hodr", "deity", "hodr"],
  ])("finds %s without typing the accents", (query, type, slug) => {
    const hit = searchAll(query).find(
      (r) => r.type === type && r.slug === slug,
    );
    expect(hit).toBeDefined();
  });
});

describe("natural-language queries", () => {
  it.each([
    ["norse god of war", "tyr"],
    ["greek goddess of wisdom", "athena"],
    ["egyptian god of the afterlife", "osiris"],
  ])("finds the figure for %s", (query, slug) => {
    const top = searchAll(query, 5).map((result) => result.slug);
    expect(top).toContain(slug);
  });

  it.each([
    ["egyptian god of the dead", ["anubis", "osiris"]],
    ["norse goddess of the dead", ["hel"]],
    ["greek gods of the sea", ["poseidon"]],
  ])("matches related words and plurals in %s", (query, slugs) => {
    const top = searchAll(query, 5).map((result) => result.slug);
    expect(top).toEqual(expect.arrayContaining(slugs));
  });

  it("still finds nothing for nonsense", () => {
    expect(searchAll("zzzznonexistent")).toEqual([]);
  });
});

describe("tradition labels", () => {
  it.each([
    ["Guan Yu", "Chinese Deity"],
    ["Mictlan", "Aztec"],
    ["Xibalba", "Mesoamerican"],
  ])("names the tradition of %s", (query, label) => {
    const hit = searchAll(query).find((result) =>
      result.title.startsWith(query),
    );
    expect(hit?.subtitle).toContain(label);
  });
});

describe("capPerType", () => {
  it("lets stories through on a topic query that one type would fill", () => {
    const capped = capPerType(searchAll("underworld", 60), 4, 15);
    const count = (type: string) =>
      capped.filter((result) => result.type === type).length;
    expect(count("location")).toBeLessThanOrEqual(4);
    expect(count("deity")).toBeLessThanOrEqual(4);
    expect(count("story")).toBeGreaterThan(0);
  });

  it("keeps score order and the overall limit", () => {
    const capped = capPerType(searchAll("creation", 60), 4, 6);
    expect(capped).toHaveLength(6);
    const scores = capped.map((result) => result.matchScore);
    expect(scores).toEqual(scores.toSorted((a, b) => b - a));
  });
});

describe("reader-intent search", () => {
  const top = (query: string, n = 3) =>
    searchAll(query, 10)
      .slice(0, n)
      .map((r) => r.title);

  it('reads "god of X" as a domain and ranks by prominence', () => {
    expect(top("god of the sea", 1)).toEqual(["Poseidon"]);
    expect(top("god of war", 1)).toEqual(["Ares"]);
    expect(top("goddess of love", 1)).toEqual(["Aphrodite"]);
    expect(top("egyptian god of the dead", 1)).toEqual(["Osiris"]);
  });

  it("answers the question in the result row", () => {
    const [poseidon] = searchAll("god of the sea", 1);
    expect(poseidon.subtitle).toBe("Greek god of the sea");
    const [aphrodite] = searchAll("goddess of love", 1);
    expect(aphrodite.subtitle).toBe("Greek goddess of love");
  });

  it("limits a domain query to the named tradition", () => {
    const titles = searchAll("norse god of war", 10)
      .filter((r) => r.type === "deity")
      .map((r) => r.title);
    expect(titles).toContain("Tyr");
    expect(titles).not.toContain("Ares");
  });

  it("finds Greek and Latin spellings and exact alternate names", () => {
    expect(top("herakles", 1)).toEqual(["Heracles"]);
    expect(top("hercules", 1)).toEqual(["Heracles"]);
    expect(top("kronos", 1)).toEqual(["Cronus"]);
  });

  it("tolerates one typo in a name", () => {
    expect(top("zues", 1)).toEqual(["Zeus"]);
    expect(top("posiedon", 1)).toEqual(["Poseidon"]);
    expect(top("quetzalcoatal", 1)).toEqual(["Quetzalcoatl"]);
  });

  it("matches symbols and question phrasing", () => {
    expect(top("athena owl", 1)).toEqual(["Athena"]);
    expect(top("who killed baldur", 1)).toEqual(["The Death of Baldur"]);
  });

  it("keeps exact names first", () => {
    expect(top("hera", 1)).toEqual(["Hera"]);
    expect(top("thor", 1)).toEqual(["Thor"]);
  });
});
