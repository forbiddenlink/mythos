import { describe, expect, it } from "vitest";
import { creatureFaq, storyFaq } from "@/lib/entry-faq";

describe("creatureFaq", () => {
  it("answers what, where and abilities from the entry's fields", () => {
    const faq = creatureFaq({
      name: "Minotaur",
      description: "A creature with the head of a bull.",
      habitat: "The Labyrinth of Crete",
      abilities: ["Superhuman Strength", "Labyrinth Navigation"],
    });
    expect(faq.map((f) => f.question)).toEqual([
      "What is Minotaur?",
      "Where does Minotaur live?",
      "What abilities does Minotaur have?",
    ]);
    expect(faq[0]?.answer).toBe("A creature with the head of a bull.");
    expect(faq[1]?.answer).toBe(
      "The atlas lists Minotaur's habitat as The Labyrinth of Crete.",
    );
    expect(faq[2]?.answer).toBe(
      "The atlas lists these abilities for Minotaur: Superhuman Strength and Labyrinth Navigation.",
    );
  });

  it("skips questions whose field is empty or missing", () => {
    expect(creatureFaq({ name: "X", description: "  ", habitat: "" })).toEqual(
      [],
    );
    expect(
      creatureFaq({ name: "X", description: "d", abilities: [] }).map(
        (f) => f.question,
      ),
    ).toEqual(["What is X?"]);
  });
});

describe("storyFaq", () => {
  it("answers summary and themes", () => {
    const faq = storyFaq({
      title: "Titanomachy",
      summary: "A ten-year war.",
      moralThemes: ["justice", "power", "cosmic order"],
    });
    expect(faq.map((f) => f.question)).toEqual([
      "What is the story of Titanomachy about?",
      "What themes does Titanomachy explore?",
    ]);
    expect(faq[1]?.answer).toBe(
      "The atlas lists these themes for Titanomachy: justice, power, and cosmic order.",
    );
  });

  it("skips what has no data", () => {
    expect(storyFaq({ title: "T", summary: null, moralThemes: [] })).toEqual(
      [],
    );
    expect(
      storyFaq({ title: "T", summary: "s", moralThemes: null }),
    ).toHaveLength(1);
  });
});
