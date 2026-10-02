/**
 * Fold text for forgiving search: lower-case, strip combining diacritics and
 * map the Latin letters that do not decompose (ð, ł, ø, æ ...) and the
 * apostrophe look-alikes to what a visitor types on a plain keyboard.
 * "Cú Chulainn" and "Väinämöinen" must be findable as "cu chulainn" and
 * "vainamoinen".
 */
const SPECIAL: Record<string, string> = {
  ð: "d",
  đ: "d",
  þ: "th",
  ł: "l",
  ø: "o",
  æ: "ae",
  œ: "oe",
  ß: "ss",
  ı: "i",
  "’": "'",
  "‘": "'",
  ʼ: "'",
  ʻ: "'",
  "`": "'",
};

const SPECIAL_RE = new RegExp(`[${Object.keys(SPECIAL).join("")}]`, "g");

export function foldForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .replace(SPECIAL_RE, (c) => SPECIAL[c] ?? c)
    .normalize("NFC");
}
