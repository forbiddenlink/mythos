import { describe, it, expect } from "vitest";
import { searchAll } from "@/lib/search";
import { foldForSearch } from "@/lib/search-fold";

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
