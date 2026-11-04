/**
 * Optional Bookshop.org affiliate links for the editorial guides. The numeric
 * affiliate id comes from NEXT_PUBLIC_BOOKSHOP_AFFILIATE_ID; without a valid
 * id no reading list renders, so nothing links out untagged by accident.
 *
 * ISBNs were checked against their Bookshop.org listings on 2026-11-04.
 */

export interface GuideBook {
  title: string;
  author: string;
  /** ISBN-13 of the edition linked. */
  isbn: string;
  note: string;
}

const HESIOD_WEST: GuideBook = {
  title: "Theogony and Works and Days",
  author: "Hesiod, translated by M. L. West",
  isbn: "9780199538317",
  note: "The oldest Greek account of how the gods were born, including the Titans and their war with Zeus.",
};

export const GUIDE_READING: Readonly<Record<string, readonly GuideBook[]>> = {
  odyssey: [
    {
      title: "The Odyssey",
      author: "Homer, translated by Emily Wilson",
      isbn: "9780393356250",
      note: "A plain, fast verse translation with the same number of lines as the Greek.",
    },
  ],
  "percy-jackson-titans-curse": [
    {
      title: "The Titan's Curse",
      author: "Rick Riordan",
      isbn: "9781368051484",
      note: "The novel this guide reads against the myths.",
    },
    HESIOD_WEST,
  ],
  "greek-gods-family-tree": [HESIOD_WEST],
  "valhalla-vs-folkvangr": [
    {
      title: "The Poetic Edda",
      author: "Translated by Carolyne Larrington",
      isbn: "9780199675340",
      note: "Includes Grimnismal, the poem that names both Valhalla and Folkvangr.",
    },
  ],
};

export function getBookshopAffiliateId(
  value: string | undefined = process.env.NEXT_PUBLIC_BOOKSHOP_AFFILIATE_ID,
): string | null {
  const trimmed = value?.trim();
  return trimmed && /^\d{1,10}$/.test(trimmed) ? trimmed : null;
}

export function bookshopUrl(affiliateId: string, isbn: string): string {
  return `https://bookshop.org/a/${affiliateId}/${isbn}`;
}
