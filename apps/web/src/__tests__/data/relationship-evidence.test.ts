import { describe, expect, it } from "vitest";
import deities from "@/data/deities.json";
import relationships from "@/data/relationships.json";
import review from "@/data/relationship-review.json";
import sources from "@/data/sources.json";
import { getDeityRelationships } from "@/lib/relationships";
import {
  DeitiesArraySchema,
  RelationshipEvidenceSchema,
  RelationshipsArraySchema,
} from "@/lib/schemas";

describe("passage-backed relationship review", () => {
  const parsed = RelationshipsArraySchema.parse(relationships);
  const sourceIds = new Set(sources.map((source) => source.id));

  it("requires a source, passage, edition, and usable URL for evidence", () => {
    expect(
      RelationshipEvidenceSchema.safeParse({
        sourceId: "theogony",
        sourceUrl: "https://www.gutenberg.org/files/348/348-h/348-h.htm",
      }).success,
    ).toBe(false);
    for (const relationship of parsed) {
      for (const evidence of relationship.evidence ?? []) {
        expect(sourceIds.has(evidence.sourceId), relationship.id).toBe(true);
        expect(evidence.locator.trim(), relationship.id).not.toBe("");
        expect(evidence.edition.trim(), relationship.id).not.toBe("");
        expect(new URL(evidence.sourceUrl).protocol).toMatch(/^https?:$/);
      }
    }
  });

  const addedPassages = [
    ["r2", "zeus", "sibling_of", "hera", "theogony", "Theogony 453–458"],
    ["r3", "zeus", "sibling_of", "poseidon", "theogony", "Theogony 453–458"],
    ["r4", "zeus", "sibling_of", "hades", "theogony", "Theogony 453–458"],
    ["r5", "zeus", "sibling_of", "demeter", "theogony", "Theogony 453–458"],
    ["r6", "zeus", "sibling_of", "hestia", "theogony", "Theogony 453–458"],
    [
      "greek-helios-selene",
      "helios",
      "sibling_of",
      "selene",
      "theogony",
      "Theogony 371–374",
    ],
    [
      "greek-helios-eos",
      "helios",
      "sibling_of",
      "eos",
      "theogony",
      "Theogony 371–374",
    ],
    [
      "greek-selene-eos",
      "selene",
      "sibling_of",
      "eos",
      "theogony",
      "Theogony 371–374",
    ],
    [
      "greek-cronus-tethys",
      "cronus",
      "sibling_of",
      "tethys",
      "theogony",
      "Theogony 134–138",
    ],
    [
      "greek-atlas-prometheus",
      "atlas",
      "sibling_of",
      "prometheus",
      "theogony",
      "Theogony 507–511",
    ],
    [
      "greek-demeter-plutus",
      "demeter",
      "parent_of",
      "plutus",
      "theogony",
      "Theogony 969–974",
    ],
    [
      "greek-nyx-nemesis",
      "nyx",
      "parent_of",
      "nemesis",
      "theogony",
      "Theogony 223–225",
    ],
    [
      "greek-nyx-thanatos",
      "nyx",
      "parent_of",
      "thanatos",
      "theogony",
      "Theogony 211–213",
    ],
    [
      "greek-apollo-asclepius",
      "apollo",
      "parent_of",
      "asclepius",
      "homeric-hymns",
      "Homeric Hymn 16 to Asclepius, lines 1–4",
    ],
    ["r19", "odin", "spouse_of", "frigg", "prose-edda", "Gylfaginning XX (20)"],
    ["r20", "odin", "parent_of", "thor", "prose-edda", "Gylfaginning IX (9)"],
    [
      "r21",
      "odin",
      "parent_of",
      "baldur",
      "prose-edda",
      "Gylfaginning XXII (22)",
    ],
    [
      "r22",
      "frigg",
      "parent_of",
      "baldur",
      "prose-edda",
      "Skáldskaparmál V (5)",
    ],
    ["r23", "thor", "spouse_of", "sif", "prose-edda", "Skáldskaparmál IV (4)"],
    [
      "r25",
      "loki",
      "parent_of",
      "hel",
      "prose-edda",
      "Gylfaginning XXXIV (34)",
    ],
    [
      "r26",
      "loki",
      "parent_of",
      "fenrir",
      "prose-edda",
      "Gylfaginning XXXIV (34)",
    ],
    [
      "r109",
      "njord",
      "parent_of",
      "freyja",
      "prose-edda",
      "Gylfaginning XXIV (24)",
    ],
    [
      "r110",
      "njord",
      "parent_of",
      "freyr",
      "prose-edda",
      "Gylfaginning XXIV (24)",
    ],
    [
      "r230",
      "idun",
      "spouse_of",
      "bragi",
      "prose-edda",
      "Gylfaginning XXVI (26)",
    ],
  ] as const;

  it.each(addedPassages)(
    "keeps reviewed edge %s connected to the supporting work and passage",
    (id, from, type, to, sourceId, locator) => {
      const relationship = parsed.find((record) => record.id === id);
      expect(relationship).toMatchObject({
        fromDeityId: from,
        relationshipType: type,
        toDeityId: to,
      });
      expect(relationship?.evidence).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ sourceId, locator }),
        ]),
      );
      const evidence = relationship!.evidence!.find(
        (entry) => entry.locator === locator,
      )!;
      expect(evidence.edition).toContain(
        sourceId === "prose-edda" ? "Brodeur" : "Evelyn-White",
      );
      expect(evidence.sourceUrl).toBe(
        sourceId === "prose-edda"
          ? `https://sacred-texts.com/book/the-prose-edda/${locator.startsWith("Gylfaginning") ? "gylfaginning" : "skaldskaparmal"}`
          : `https://www.theoi.com/Text/${sourceId === "theogony" ? "HesiodTheogony" : "HomericHymns3"}.html`,
      );
    },
  );

  const egyptianAndJapanesePassages = [
    [
      "r32",
      "osiris",
      "sibling_of",
      "isis",
      "plutarch-isis-osiris",
      "On Isis and Osiris 12 (355D–356A)",
      "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/A.html",
    ],
    [
      "r33",
      "osiris",
      "sibling_of",
      "set",
      "plutarch-isis-osiris",
      "On Isis and Osiris 12 (355D–356A)",
      "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/A.html",
    ],
    [
      "r34",
      "osiris",
      "sibling_of",
      "nephthys",
      "plutarch-isis-osiris",
      "On Isis and Osiris 12 (355D–356A)",
      "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/A.html",
    ],
    [
      "r35",
      "set",
      "spouse_of",
      "nephthys",
      "plutarch-isis-osiris",
      "On Isis and Osiris 12 (355D–356A)",
      "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/A.html",
    ],
    [
      "r36",
      "isis",
      "sibling_of",
      "nephthys",
      "plutarch-isis-osiris",
      "On Isis and Osiris 14 (356E–F)",
      "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/A.html",
    ],
    [
      "r39",
      "osiris",
      "parent_of",
      "anubis",
      "plutarch-isis-osiris",
      "On Isis and Osiris 14 (356E–F)",
      "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/A.html",
    ],
    [
      "r40",
      "nephthys",
      "parent_of",
      "anubis",
      "plutarch-isis-osiris",
      "On Isis and Osiris 14 (356E–F)",
      "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/A.html",
    ],
    [
      "r38",
      "isis",
      "parent_of",
      "horus",
      "plutarch-isis-osiris",
      "On Isis and Osiris 18 (357F–358A)",
      "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/A.html",
    ],
    [
      "r42",
      "osiris",
      "enemy_of",
      "set",
      "plutarch-isis-osiris",
      "On Isis and Osiris 13 (356B–D)",
      "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Moralia/Isis_and_Osiris*/A.html",
    ],
    [
      "r56",
      "amaterasu",
      "sibling_of",
      "susanoo",
      "kojiki",
      "Kojiki, Volume I, Section X (The Purification of the August Person)",
      "https://sacred-texts.com/book/the-kojiki-2/section-x-the-purification-of-the-august-person",
    ],
    [
      "r57",
      "amaterasu",
      "sibling_of",
      "tsukuyomi",
      "kojiki",
      "Kojiki, Volume I, Section X (The Purification of the August Person)",
      "https://sacred-texts.com/book/the-kojiki-2/section-x-the-purification-of-the-august-person",
    ],
    [
      "r112",
      "izanagi",
      "parent_of",
      "amaterasu",
      "kojiki",
      "Kojiki, Volume I, Section X (The Purification of the August Person)",
      "https://sacred-texts.com/book/the-kojiki-2/section-x-the-purification-of-the-august-person",
    ],
    [
      "r113",
      "izanagi",
      "parent_of",
      "tsukuyomi",
      "kojiki",
      "Kojiki, Volume I, Section X (The Purification of the August Person)",
      "https://sacred-texts.com/book/the-kojiki-2/section-x-the-purification-of-the-august-person",
    ],
    [
      "r114",
      "izanagi",
      "parent_of",
      "susanoo",
      "kojiki",
      "Kojiki, Volume I, Section X (The Purification of the August Person)",
      "https://sacred-texts.com/book/the-kojiki-2/section-x-the-purification-of-the-august-person",
    ],
    [
      "r55",
      "izanagi",
      "spouse_of",
      "izanami",
      "kojiki",
      "Kojiki, Volume I, Section V (Birth of the Eight Islands)",
      "https://sacred-texts.com/book/the-kojiki-2/section-v-birth-of-the-eight-islands",
    ],
    [
      "r115",
      "izanami",
      "parent_of",
      "kagutsuchi",
      "kojiki",
      "Kojiki, Volume I, Section VII (Retirement of Her Augustness The Princess-Who-Invites)",
      "https://sacred-texts.com/book/the-kojiki-2/section-vii-retirement-of-her-augustness-the-princess-who-invites",
    ],
    [
      "r116",
      "amaterasu",
      "ally_of",
      "ame-no-uzume",
      "kojiki",
      "Kojiki, Volume I, Section XVI (The Door of the Heavenly Rock-Dwelling)",
      "https://sacred-texts.com/book/the-kojiki-2/section-xvi-the-door-of-the-heavenly-rock-dwelling",
    ],
  ] as const;

  it.each(egyptianAndJapanesePassages)(
    "keeps Egyptian/Japanese edge %s tied to its checked passage",
    (id, from, type, to, sourceId, locator, sourceUrl) => {
      const relationship = parsed.find((record) => record.id === id);
      expect(relationship).toMatchObject({
        fromDeityId: from,
        relationshipType: type,
        toDeityId: to,
      });
      expect(relationship?.evidence).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ sourceId, locator, sourceUrl }),
        ]),
      );
      expect(relationship?.evidence?.[0].edition).toContain(
        sourceId === "kojiki" ? "Chamberlain" : "Babbitt",
      );
    },
  );

  it("does not extend the new review to unsupported details or disputed variants", () => {
    expect(parsed.find((record) => record.id === "r24")?.description).toBe(
      "Twin siblings",
    );
    expect(
      parsed.find((record) => record.id === "r24")?.evidence,
    ).toBeUndefined();
    expect(
      parsed.find((record) => record.id === "r28")?.evidence,
    ).toBeUndefined();
    expect(
      parsed.find((record) => record.id === "r13")?.evidence,
    ).toBeUndefined();
    expect(parsed.find((record) => record.id === "r13")?.isDisputed).toBe(true);
  });

  it("keeps the explicit 20-entry review connected to passage-backed claims", () => {
    expect(new Set(review.deityIds).size).toBe(20);
    const deityIds = new Set(deities.map((deity) => deity.id));
    const covered = new Set<string>();
    for (const id of review.relationshipIds) {
      const relationship = parsed.find((record) => record.id === id);
      expect(relationship, id).toBeDefined();
      expect(relationship?.evidence?.length, id).toBeGreaterThan(0);
      covered.add(relationship!.fromDeityId);
      covered.add(relationship!.toDeityId);
    }
    for (const id of review.deityIds) {
      expect(deityIds.has(id), id).toBe(true);
      expect(covered.has(id), id).toBe(true);
    }
  });

  it("preserves both attested parents of all six children of Rhea and Cronus", () => {
    expect(DeitiesArraySchema.safeParse(deities).success).toBe(true);
    for (const child of [
      "zeus",
      "hera",
      "poseidon",
      "hades",
      "demeter",
      "hestia",
    ]) {
      const parents = parsed.filter(
        (relationship) =>
          relationship.toDeityId === child &&
          relationship.relationshipType === "parent_of",
      );
      expect(parents.map((parent) => parent.fromDeityId).sort(), child).toEqual(
        ["cronus", "rhea"],
      );
      for (const parent of parents) {
        expect(parent.evidence?.[0].sourceId, child).toBe("theogony");
        expect(parent.evidence?.[0].locator, child).toBe("Theogony 453–491");
      }
      expect(
        getDeityRelationships(child)
          .filter(
            (relationship) => relationship.relationshipType === "child_of",
          )
          .map((relationship) => relationship.deityId)
          .sort(),
        child,
      ).toEqual(["cronus", "rhea"]);
    }
  });

  it("does not treat Hesiod's mother-only Hephaestus account as Zeus paternity evidence", () => {
    expect(
      parsed.find((relationship) => relationship.id === "r13")?.isDisputed,
    ).toBe(true);
    const mother = parsed.find((relationship) => relationship.id === "r15");
    expect(mother?.evidence?.[0].locator).toBe("Theogony 924–929");
    expect(review.relationshipIds).not.toContain("r13");
  });

  it("attributes Athena's intervention with Achilles to the Iliad while flagging unverified wording", () => {
    const athena = DeitiesArraySchema.parse(deities).find(
      (deity) => deity.id === "athena",
    );
    const passage = athena?.primarySources?.find((citation) =>
      citation.text.includes("stay your fury"),
    );
    expect(passage?.sourceId).toBe("iliad");
    expect(passage?.locator).toBe("Book 1, lines 207–211");
    expect(passage?.source).toContain("translation wording unverified");
  });
});
