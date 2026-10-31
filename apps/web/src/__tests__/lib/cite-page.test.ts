import { describe, expect, it } from "vitest";
import { formatCitations } from "@/lib/cite-page";

const base = {
  title: "Zeus",
  url: "https://mythosatlas.com/deities/zeus",
  siteName: "Mythos Atlas",
  accessed: { year: 2026, month: 10, day: 31 },
};

describe("formatCitations", () => {
  it("formats MLA with n.d. and the accessed date, no author", () => {
    expect(formatCitations(base).mla).toBe(
      '"Zeus." Mythos Atlas, n.d., https://mythosatlas.com/deities/zeus. Accessed 31 Oct. 2026.',
    );
  });

  it("formats APA with n.d. and a retrieved date", () => {
    expect(formatCitations(base).apa).toBe(
      "Zeus. (n.d.). Mythos Atlas. Retrieved October 31, 2026, from https://mythosatlas.com/deities/zeus",
    );
  });

  it("formats Chicago with the site as corporate author", () => {
    expect(formatCitations(base).chicago).toBe(
      'Mythos Atlas. "Zeus." n.d. Accessed October 31, 2026. https://mythosatlas.com/deities/zeus.',
    );
  });

  it("uses the MLA abbreviations for May, June, July and Sept.", () => {
    const at = (month: number) =>
      formatCitations({ ...base, accessed: { year: 2026, month, day: 2 } }).mla;
    expect(at(5)).toContain("Accessed 2 May 2026.");
    expect(at(6)).toContain("Accessed 2 June 2026.");
    expect(at(7)).toContain("Accessed 2 July 2026.");
    expect(at(9)).toContain("Accessed 2 Sept. 2026.");
  });

  it("does not double the terminal punctuation of a title", () => {
    const out = formatCitations({ ...base, title: "Who Is Hel?" });
    expect(out.mla).toContain('"Who Is Hel?" Mythos Atlas');
    expect(out.apa.startsWith("Who Is Hel? (n.d.).")).toBe(true);
    expect(out.chicago).toContain('"Who Is Hel?" n.d.');
  });

  it("never emits a fabricated publication year or a person without an author", () => {
    const all = Object.values(formatCitations(base)).join("\n");
    expect(all).not.toMatch(/2026-0[12]|Elizabeth|Stein/);
    expect(all.match(/2026/g)).toHaveLength(3);
  });

  describe("with an author", () => {
    const withAuthor = {
      ...base,
      author: { given: "Elizabeth", family: "Stein" },
    };

    it("formats MLA", () => {
      expect(formatCitations(withAuthor).mla).toBe(
        'Stein, Elizabeth. "Zeus." Mythos Atlas, n.d., https://mythosatlas.com/deities/zeus. Accessed 31 Oct. 2026.',
      );
    });

    it("formats APA", () => {
      expect(formatCitations(withAuthor).apa).toBe(
        "Stein, E. (n.d.). Zeus. Mythos Atlas. Retrieved October 31, 2026, from https://mythosatlas.com/deities/zeus",
      );
    });

    it("formats Chicago", () => {
      expect(formatCitations(withAuthor).chicago).toBe(
        'Stein, Elizabeth. "Zeus." Mythos Atlas. n.d. Accessed October 31, 2026. https://mythosatlas.com/deities/zeus.',
      );
    });

    it("still records no publication date", () => {
      const all = Object.values(formatCitations(withAuthor)).join("\n");
      expect(all).not.toMatch(/2026-0[12]/);
      expect(all.match(/2026/g)).toHaveLength(3);
    });
  });
});
