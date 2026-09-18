import { describe, expect, it } from "vitest";
import {
  createLearningBackup,
  LEARNING_STORAGE_KEYS,
  parseLearningBackup,
  restoreLearningBackup,
} from "@/lib/learning-backup";

function progress() {
  return {
    deitiesViewed: ["zeus"], storiesRead: ["iliad"], pantheonsExplored: ["greek-pantheon"], locationsVisited: [], quizScores: { quick: 80 }, achievements: ["first-step"], dailyStreak: 2, lastVisit: "2026-09-18", totalXP: 120, streakFreezes: 1, quickQuizHighScore: 8, dailyChallengeStreak: 1, lastDailyChallengeDate: "2026-09-18", claimedDailyChallenges: ["2026-09-18:zeus"], todayActivity: { date: "2026-09-18", deitiesViewed: ["zeus"], storiesRead: [], pantheonsViewed: [], quizCompleted: true, quizScore: 80 },
  };
}

function review() {
  return { cards: { "domain-match:zeus": { interval: 2, nextReview: "2026-09-20", easeFactor: 2.5, reviews: 1, lapses: 0 } }, todayReviewed: ["domain-match:zeus"], lastReviewDate: "2026-09-18", stats: { totalReviewed: 1, currentStreak: 1, longestStreak: 1, averageAccuracy: 100, correctToday: 1, incorrectToday: 0 } };
}

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
    key: () => null,
    get length() { return values.size; },
  } as Storage;
}

function seed(storage: Storage) {
  storage.setItem("mythos-atlas-bookmarks", JSON.stringify([{ type: "deity", id: "zeus", timestamp: 1 }]));
  storage.setItem("mythos-atlas-reading-progress", JSON.stringify({ iliad: { storyId: "iliad", percentage: 50, updatedAt: 1 } }));
  storage.setItem("mythos-atlas-progress", JSON.stringify(progress()));
  storage.setItem("mythos-atlas-review", JSON.stringify(review()));
}

describe("learning backup", () => {
  it("round-trips only the four learning data categories", () => {
    const storage = memoryStorage();
    seed(storage);
    storage.setItem("locale", "fr");
    const exported = JSON.stringify(createLearningBackup(storage));
    const parsed = parseLearningBackup(exported);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.preview.reviewCards).toBe(1);
    storage.setItem("mythos-atlas-bookmarks", "[]");
    expect(restoreLearningBackup(storage, parsed.backup).success).toBe(true);
    expect(JSON.parse(storage.getItem("mythos-atlas-bookmarks")!)).toHaveLength(1);
    expect(storage.getItem("locale")).toBe("fr");
  });

  it("rejects malformed data and unknown backup versions before any restore", () => {
    const storage = memoryStorage();
    seed(storage);
    expect(parseLearningBackup("not json").success).toBe(false);

    const badVersion = createLearningBackup(storage);
    const versioned = { ...badVersion, version: 2 };
    expect(parseLearningBackup(JSON.stringify(versioned)).success).toBe(false);

    const invalidProgress = createLearningBackup(storage);
    invalidProgress.data["mythos-atlas-progress"] = JSON.stringify({ nope: true });
    expect(parseLearningBackup(JSON.stringify(invalidProgress)).success).toBe(false);

    const extraNestedField = createLearningBackup(storage);
    extraNestedField.data["mythos-atlas-bookmarks"] = JSON.stringify([
      { type: "source", id: "iliad", timestamp: 1, unexpected: true },
    ]);
    expect(parseLearningBackup(JSON.stringify(extraNestedField)).success).toBe(false);

    const invalidReviewDate = createLearningBackup(storage);
    invalidReviewDate.data["mythos-atlas-review"] = JSON.stringify({
      ...review(),
      cards: {
        "domain-match:zeus": {
          ...review().cards["domain-match:zeus"],
          nextReview: "2026-02-30",
        },
      },
    });
    expect(parseLearningBackup(JSON.stringify(invalidReviewDate)).success).toBe(false);
  });

  it("accepts source bookmarks", () => {
    const storage = memoryStorage();
    seed(storage);
    const backup = createLearningBackup(storage);
    backup.data["mythos-atlas-bookmarks"] = JSON.stringify([
      { type: "source", id: "iliad", timestamp: 1 },
    ]);
    expect(parseLearningBackup(JSON.stringify(backup)).success).toBe(true);
  });

  it("does not touch unrelated storage keys", () => {
    const storage = memoryStorage();
    seed(storage);
    storage.setItem("theme", "dark");
    const backup = createLearningBackup(storage);
    storage.setItem("theme", "light");
    restoreLearningBackup(storage, backup);
    expect(storage.getItem("theme")).toBe("light");
  });

  it("restores the same valid backup deterministically more than once", () => {
    const storage = memoryStorage();
    seed(storage);
    const parsed = parseLearningBackup(JSON.stringify(createLearningBackup(storage)));
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    storage.setItem("mythos-atlas-bookmarks", "[]");
    expect(restoreLearningBackup(storage, parsed.backup).success).toBe(true);
    const afterFirstRestore = LEARNING_STORAGE_KEYS.map((key) => storage.getItem(key));

    expect(restoreLearningBackup(storage, parsed.backup).success).toBe(true);
    expect(LEARNING_STORAGE_KEYS.map((key) => storage.getItem(key))).toEqual(
      afterFirstRestore,
    );
  });

  it("rolls back all learning keys when a storage write fails", () => {
    const values = new Map<string, string>();
    const replacement = JSON.stringify({ ...progress(), totalXP: 999 });
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (key === "mythos-atlas-progress" && value === replacement) throw new Error("quota");
        values.set(key, value);
      },
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
      key: () => null,
      get length() { return values.size; },
    } as Storage;
    seed(storage);
    const backup = createLearningBackup(storage);
    backup.data["mythos-atlas-progress"] = replacement;
    const original = storage.getItem("mythos-atlas-bookmarks");

    expect(restoreLearningBackup(storage, backup).success).toBe(false);
    expect(storage.getItem("mythos-atlas-bookmarks")).toBe(original);
  });

  it("validates a restore candidate before it can change storage", () => {
    const storage = memoryStorage();
    seed(storage);
    const backup = createLearningBackup(storage);
    const unsafeBackup = { ...backup, unexpected: true } as unknown as typeof backup;
    const original = storage.getItem("mythos-atlas-bookmarks");

    expect(restoreLearningBackup(storage, unsafeBackup).success).toBe(false);
    expect(storage.getItem("mythos-atlas-bookmarks")).toBe(original);
  });

  it("reports when storage cannot be read before restore", () => {
    const storage = memoryStorage();
    seed(storage);
    const backup = createLearningBackup(storage);
    let writes = 0;
    const unreadableStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        writes += 1;
      },
      removeItem: () => {
        writes += 1;
      },
      clear: () => undefined,
      key: () => null,
      get length() {
        return 0;
      },
    } as Storage;

    const result = restoreLearningBackup(unreadableStorage, backup);
    expect(result.success).toBe(false);
    expect(writes).toBe(0);
  });

  it("does not claim rollback succeeded when rollback itself fails", () => {
    const values = new Map<string, string>();
    const originalBookmarks = JSON.stringify([
      { type: "deity", id: "zeus", timestamp: 1 },
    ]);
    const replacement = JSON.stringify({ ...progress(), totalXP: 999 });
    let restoreFailed = false;
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (key === "mythos-atlas-progress" && value === replacement) {
          restoreFailed = true;
          throw new Error("quota");
        }
        if (
          restoreFailed &&
          key === "mythos-atlas-bookmarks" &&
          value === originalBookmarks
        ) {
          throw new Error("rollback blocked");
        }
        values.set(key, value);
      },
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
      key: () => null,
      get length() {
        return values.size;
      },
    } as Storage;
    seed(storage);
    const backup = createLearningBackup(storage);
    backup.data["mythos-atlas-bookmarks"] = JSON.stringify([
      { type: "source", id: "iliad", timestamp: 2 },
    ]);
    backup.data["mythos-atlas-progress"] = replacement;

    const result = restoreLearningBackup(storage, backup);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toContain("could not be fully restored");
  });
});
