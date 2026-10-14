import { describe, expect, it } from "vitest";
import {
  findEntryMentions,
  getEntryMentions,
  type MentionTarget,
} from "@/lib/entry-mentions";

function target(
  kind: MentionTarget["kind"],
  id: string,
  name: string,
): MentionTarget {
  return { kind, id, name, href: `/${kind}/${id}`, meta: `${kind} · Greek` };
}

const TARGETS: MentionTarget[] = [
  target("hero", "theseus", "Theseus"),
  target("deity", "zeus", "Zeus"),
  target("deity", "pasiphae", "Pasiphae"),
  target("location", "olympus", "Olympus"),
  target("location", "mount-olympus", "Mount Olympus"),
  target("deity", "ra", "Ra"),
  target("deity", "set", "Set"),
];

describe("findEntryMentions", () => {
  it("matches exact names on word boundaries, in order of first appearance", () => {
    const out = findEntryMentions(
      ["Born to Pasiphae and slain by Theseus, then judged by Zeus."],
      TARGETS,
    );
    expect(out.map((m) => m.id)).toEqual(["pasiphae", "theseus", "zeus"]);
  });

  it("does not match inside a longer word", () => {
    expect(findEntryMentions(["Zeusville and Theseusian"], TARGETS)).toEqual(
      [],
    );
  });

  it("matches possessives and punctuation neighbours", () => {
    const out = findEntryMentions(["Zeus's bolt, (Theseus)."], TARGETS);
    expect(out.map((m) => m.id)).toEqual(["zeus", "theseus"]);
  });

  it("is case-sensitive, so common words do not link", () => {
    expect(findEntryMentions(["a zeus and THESEUS"], TARGETS)).toEqual([]);
  });

  it("skips a name that is also an ordinary word in the same text", () => {
    expect(findEntryMentions(["Set up camp, then set out."], TARGETS)).toEqual(
      [],
    );
    expect(
      findEntryMentions(["Set was the god of storms."], TARGETS).map(
        (m) => m.id,
      ),
    ).toEqual(["set"]);
  });

  it("ignores markdown headings, where capitalised ordinary words read as names", () => {
    const targets = [...TARGETS, target("deity", "sin", "Sin")];
    expect(
      findEntryMentions(
        ["## The Sin of Athens\n\nTheseus sailed to Crete."],
        targets,
      ).map((m) => m.id),
    ).toEqual(["theseus"]);
  });

  it("ignores names shorter than three characters", () => {
    expect(findEntryMentions(["Ra and Set"], TARGETS).map((m) => m.id)).toEqual(
      ["set"],
    );
  });

  it("prefers the longest name at the same position", () => {
    const out = findEntryMentions(["On Mount Olympus the gods met."], TARGETS);
    expect(out.map((m) => m.id)).toEqual(["mount-olympus"]);
  });

  it("skips names shared by more than one entry", () => {
    const targets = [
      target("deity", "a", "Hermes"),
      target("hero", "b", "Hermes"),
    ];
    expect(findEntryMentions(["Hermes ran."], targets)).toEqual([]);
  });

  it("skips the entry itself by id and by name", () => {
    expect(
      findEntryMentions(["Theseus and Zeus"], TARGETS, {
        self: { kind: "hero", id: "theseus" },
      }).map((m) => m.id),
    ).toEqual(["zeus"]);
    expect(
      findEntryMentions(["Theseus and Zeus"], TARGETS, {
        self: { kind: "artifact", id: "x", name: "Zeus" },
      }).map((m) => m.id),
    ).toEqual(["theseus"]);
  });

  it("lists each entry once and caps the list", () => {
    const text = "Zeus Zeus Theseus Pasiphae Olympus";
    expect(findEntryMentions([text], TARGETS).map((m) => m.id)).toEqual([
      "zeus",
      "theseus",
      "pasiphae",
      "olympus",
    ]);
    expect(findEntryMentions([text], TARGETS, { limit: 2 })).toHaveLength(2);
  });

  it("is deterministic and tolerates empty or missing text", () => {
    const texts = ["Theseus met Zeus", undefined, null, ""];
    expect(findEntryMentions(texts, TARGETS)).toEqual(
      findEntryMentions(texts, TARGETS),
    );
    expect(findEntryMentions([undefined, null], TARGETS)).toEqual([]);
    expect(findEntryMentions(["Zeus"], [])).toEqual([]);
  });

  it("escapes regex characters in names", () => {
    const targets = [target("location", "x", "Land (West)")];
    expect(
      findEntryMentions(["the Land (West) lay far"], targets),
    ).toHaveLength(1);
  });
});

describe("getEntryMentions (catalog)", () => {
  it("links the Minotaur entry to Theseus and never to itself", () => {
    const out = getEntryMentions(
      { kind: "creature", id: "minotaur", name: "Minotaur" },
      [
        "A creature with the body of a man and head of a bull. Slain by Theseus.",
      ],
    );
    expect(out.map((m) => m.href)).toContain("/heroes/theseus");
    expect(out.map((m) => m.name)).not.toContain("Minotaur");
  });
});
