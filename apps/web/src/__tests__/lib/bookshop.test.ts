import { describe, expect, it } from "vitest";
import {
  bookshopUrl,
  GUIDE_READING,
  getBookshopAffiliateId,
} from "@/lib/bookshop";
import { GUIDES } from "@/lib/guides";

/** ISBN-13 check digit: weights alternate 1 and 3. */
function validIsbn13(isbn: string): boolean {
  if (!/^97[89]\d{10}$/.test(isbn)) return false;
  const sum = [...isbn]
    .slice(0, 12)
    .reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10 === Number(isbn[12]);
}

describe("getBookshopAffiliateId", () => {
  it("returns null when unset or blank", () => {
    expect(getBookshopAffiliateId(undefined)).toBeNull();
    expect(getBookshopAffiliateId("  ")).toBeNull();
  });

  it("accepts a numeric id and trims it", () => {
    expect(getBookshopAffiliateId(" 12345 ")).toBe("12345");
  });

  it("rejects anything that is not a plain number", () => {
    expect(getBookshopAffiliateId("12a45")).toBeNull();
    expect(getBookshopAffiliateId("https://bookshop.org/a/1")).toBeNull();
    expect(getBookshopAffiliateId("../1")).toBeNull();
  });
});

describe("bookshopUrl", () => {
  it("builds the affiliate link", () => {
    expect(bookshopUrl("42", "9780393356250")).toBe(
      "https://bookshop.org/a/42/9780393356250",
    );
  });
});

describe("GUIDE_READING", () => {
  const slugs = new Set(GUIDES.map((g) => g.slug));

  it("only lists books for guides that exist", () => {
    for (const slug of Object.keys(GUIDE_READING)) {
      expect(slugs.has(slug), slug).toBe(true);
    }
  });

  it("uses valid ISBN-13s", () => {
    for (const books of Object.values(GUIDE_READING)) {
      for (const book of books) {
        expect(validIsbn13(book.isbn), book.isbn).toBe(true);
      }
    }
  });
});
