import { describe, expect, it } from "vitest";
import { citedWorkHref } from "@/lib/citation-links";

describe("citedWorkHref", () => {
  it.each([
    ["Prose Edda - Gylfaginning", undefined, "prose-edda"],
    ["Kalevala, Rune 1", undefined, "kalevala"],
    // A translator credit is not the work's author.
    ["Avesta, Yasht 8 (Tir Yasht)", "trans. James Darmesteter", "avesta"],
    ["Bundahishn, chs. 1-4", "trans. E. W. West", "bundahishn"],
    // English title in the catalog's parentheses.
    [
      "Narrative of the Errors, False Gods, and Other Superstitions, ch. II",
      "Francisco de Ávila; trans. Clements Markham",
      "avila-tratado-huarochiri",
    ],
    // Editions and parts filed under the work.
    ["Papyrus of Ani", undefined, "book-of-the-dead"],
    ["Plutarch - De Iside et Osiride", undefined, "plutarch-isis-osiris"],
    [
      "Franz Boas, The Central Eskimo (Sixth Annual Report of the Bureau of Ethnology)",
      "Franz Boas",
      "boas-central-eskimo",
    ],
    ["Homeric Hymn to Demeter (Hymn 2)", "Anonymous", "homeric-hymns"],
    ["Song of Ullikummi (CTH 345)", undefined, "kumarbi-cycle"],
    // Works added to the catalog.
    ["Atrahasis Epic", undefined, "atrahasis"],
    ["Bhagavata Purana", undefined, "bhagavata-purana"],
    ["Ab Urbe Condita", "Livy", "ab-urbe-condita"],
    ["Gesta Danorum, Book 14", "Saxo Grammaticus", "gesta-danorum"],
    [
      "Shan Hai Jing (Classic of Mountains and Seas)",
      undefined,
      "shan-hai-jing",
    ],
    ["Descent of Inanna to the Underworld", undefined, "descent-of-inanna"],
    ["The Kumulipo (Hawaiian Creation Chant)", undefined, "kumulipo"],
    ["Hawaiian Mythology", "Martha Beckwith", "hawaiian-mythology-beckwith"],
    [
      "Ugaritic Narrative Poetry (SBL Writings from the Ancient World 9), ed. Simon B. Parker",
      "Mark S. Smith (translator of the Baal Cycle)",
      "ugaritic-narrative-poetry",
    ],
  ])("links %s", (title, author, id) => {
    expect(citedWorkHref(title, author)).toBe(`/sources/${id}`);
  });

  it.each([
    ["Metamorphoses (The Golden Ass)", "Apuleius"],
    [
      "Songlines: The Power and Promise (First Knowledges series)",
      "Margo Neale and Lynne Kelly",
    ],
    ["Maori Oral Tradition", undefined],
    ["History", "Onondaga Nation"],
  ])("leaves %s unlinked", (title, author) => {
    expect(citedWorkHref(title, author)).toBeUndefined();
  });
});
