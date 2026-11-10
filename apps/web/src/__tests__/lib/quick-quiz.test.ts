import { describe, expect, it } from "vitest";
import deities from "@/data/deities.json";
import { matchesDomainFilter } from "@/lib/domain-categories";
import { generateQuickQuizQuestion } from "@/lib/quick-quiz";

const pool = [
  { id: "ares", name: "Ares", domain: ["war"] },
  { id: "mars", name: "Mars", domain: [" Warfare "] },
  { id: "ra", name: "Ra", domain: ["sun"] },
  { id: "luna", name: "Luna", domain: ["moon"] },
  { id: "poseidon", name: "Poseidon", domain: ["sea"] },
];

describe("quick quiz questions", () => {
  it("does not mark another figure with the same domain or its alias wrong", () => {
    const question = generateQuickQuizQuestion(pool, () => 0.999);
    expect(question?.correctAnswer).toBe("Ares");
    expect(question?.options).not.toContain("Mars");
    expect(question?.options).toHaveLength(4);
  });

  it("deduplicates visible answers across catalogue records", () => {
    const question = generateQuickQuizQuestion(
      [
        ...pool,
        { id: "other-mars", name: " MARS ", domain: ["agriculture"] },
        { id: "other-ra", name: " RA ", domain: ["creation"] },
      ],
      () => 0.999,
    );
    const names = question!.options.map((name) => name.trim().toLowerCase());
    expect(names).not.toContain("mars");
    expect(new Set(names).size).toBe(4);
  });

  it("skips blank and uncertain domains", () => {
    const question = generateQuickQuizQuestion(
      [
        {
          id: "uncertain",
          name: "Uncertain figure",
          domain: ["", "uncertain; origin debated"],
        },
        ...pool,
      ],
      () => 0.999,
    );
    expect(question?.domain).toBe("war");
  });

  it("returns no question when four unambiguous answers are impossible", () => {
    expect(generateQuickQuizQuestion([])).toBeNull();
    expect(generateQuickQuizQuestion(pool.slice(0, 3))).toBeNull();
    expect(
      generateQuickQuizQuestion(
        pool.map((deity) => ({ ...deity, domain: ["sky"] })),
      ),
    ).toBeNull();
  });

  it("produces unambiguous options from the real catalog without mutating it", () => {
    const before = JSON.stringify(deities);
    let seed = 1701;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 2 ** 32;
    };
    for (let i = 0; i < 250; i++) {
      const question = generateQuickQuizQuestion(deities, random)!;
      expect(question).not.toBeNull();
      expect(new Set(question.options).size).toBe(4);
      const matches = question.options.filter((name) =>
        deities.some(
          (deity) =>
            deity.name === name &&
            matchesDomainFilter(
              deity.domain.map((domain) => domain.trim().toLowerCase()),
              question.domain.toLowerCase(),
            ),
        ),
      );
      expect(matches).toEqual([question.correctAnswer]);
    }
    expect(JSON.stringify(deities)).toBe(before);
  });
});

describe("quick quiz hedged domains", () => {
  it("never asks about a parenthetically qualified domain", () => {
    const pool = [
      { id: "a", name: "Cronus", domain: ["time (later folk association)"] },
      { id: "b", name: "Tlaloc", domain: ["rain"] },
      { id: "c", name: "Midir", domain: ["kingship"] },
      { id: "d", name: "Centeotl", domain: ["maize"] },
      { id: "e", name: "Ra", domain: ["sun"] },
    ];
    for (let i = 0; i < 50; i += 1) {
      const question = generateQuickQuizQuestion(pool, () => (i % 10) / 10);
      expect(question?.domain).not.toMatch(/[()]/);
      expect(question?.question).not.toContain('"');
    }
  });
});
