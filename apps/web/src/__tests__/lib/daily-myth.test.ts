import { describe, expect, it } from "vitest";
import { buildDailyMythPool } from "@/lib/data/daily-myths";
import {
  DAILY_MYTH_QUESTIONS,
  dailyMythXp,
  localDayNumber,
  pickDailyMyth,
} from "@/lib/daily-myth";
import { getDateSeed, seededShuffle } from "@/lib/seeded";

const pool = buildDailyMythPool();

describe("daily myth pool", () => {
  it("offers a large rotation", () => {
    expect(pool.version).toBe(1);
    expect(pool.myths.length).toBeGreaterThan(30);
  });

  it("gives every myth three answerable, unambiguous questions", () => {
    for (const myth of pool.myths) {
      expect(myth.questions, myth.id).toHaveLength(DAILY_MYTH_QUESTIONS);
      for (const q of myth.questions) {
        expect(q.options, `${myth.id}: ${q.prompt}`).toHaveLength(4);
        expect(new Set(q.options).size, q.prompt).toBe(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(4);
      }
      expect(myth.questions[0].options[myth.questions[0].answer]).toBe(
        myth.tradition,
      );
    }
  });

  it("is deterministic", () => {
    expect(buildDailyMythPool()).toEqual(pool);
  });
});

describe("pickDailyMyth", () => {
  it("is stable within a day and changes on the next day", () => {
    const morning = new Date("2026-09-26T08:00:00Z");
    const evening = new Date("2026-09-26T20:00:00Z");
    const tomorrow = new Date("2026-09-27T08:00:00Z");
    const today = pickDailyMyth(pool.myths, morning);
    expect(pickDailyMyth(pool.myths, evening)).toBe(today);
    expect(pickDailyMyth(pool.myths, tomorrow)).not.toBe(today);
  });

  it("visits every myth once before repeating", () => {
    const seen = new Set<string>();
    const start = Date.UTC(2026, 0, 1);
    for (let i = 0; i < pool.myths.length; i++) {
      seen.add(pickDailyMyth(pool.myths, new Date(start + i * 86_400_000))!.id);
    }
    expect(seen.size).toBe(pool.myths.length);
  });

  it("handles an empty pool", () => {
    expect(pickDailyMyth([], new Date())).toBeNull();
  });

  it("counts local days", () => {
    expect(localDayNumber(new Date("1970-01-02T00:00:00Z"))).toBe(1);
  });

  it("rewards correct answers", () => {
    expect(dailyMythXp(0)).toBeLessThan(dailyMythXp(3));
  });
});

describe("seeded helpers", () => {
  it("shuffle without losing items and seed dates stably", () => {
    const items = [1, 2, 3, 4, 5];
    expect(seededShuffle(items, 7).toSorted()).toEqual(items);
    expect(seededShuffle(items, 7)).toEqual(seededShuffle(items, 7));
    const d = new Date("2026-09-26T00:00:00Z");
    expect(getDateSeed(d)).toBe(getDateSeed(new Date(d)));
  });
});
