import { expect, test } from "@playwright/test";

const BACKUP_NAME = "mythos-learning-backup.json";

function progress() {
  return {
    deitiesViewed: ["zeus"],
    storiesRead: ["iliad"],
    pantheonsExplored: ["greek-pantheon"],
    locationsVisited: [],
    quizScores: { quick: 80 },
    achievements: ["first-step"],
    dailyStreak: 2,
    lastVisit: "2026-09-18",
    totalXP: 120,
    streakFreezes: 1,
    quickQuizHighScore: 8,
    dailyChallengeStreak: 1,
    lastDailyChallengeDate: "2026-09-18",
    claimedDailyChallenges: ["2026-09-18:zeus"],
    todayActivity: {
      date: "2026-09-18",
      deitiesViewed: ["zeus"],
      storiesRead: [],
      pantheonsViewed: [],
      quizCompleted: true,
      quizScore: 80,
    },
  };
}

function review() {
  return {
    cards: {
      "domain-match:zeus": {
        interval: 2,
        nextReview: "2026-09-20",
        easeFactor: 2.5,
        reviews: 1,
        lapses: 0,
      },
    },
    todayReviewed: ["domain-match:zeus"],
    lastReviewDate: "2026-09-18",
    stats: {
      totalReviewed: 1,
      currentStreak: 1,
      longestStreak: 1,
      averageAccuracy: 100,
      correctToday: 1,
      incorrectToday: 0,
    },
  };
}

function backupFile() {
  return JSON.stringify({
    format: "mythos-atlas-learning-backup",
    version: 1,
    exportedAt: "2026-09-18T12:00:00.000Z",
    data: {
      "mythos-atlas-bookmarks": JSON.stringify([
        { type: "deity", id: "zeus", timestamp: 1 },
      ]),
      "mythos-atlas-reading-progress": JSON.stringify({
        iliad: { storyId: "iliad", percentage: 50, updatedAt: 1 },
      }),
      "mythos-atlas-progress": JSON.stringify(progress()),
      "mythos-atlas-review": JSON.stringify(review()),
    },
  });
}

test.describe("Learning backup", () => {
  test("stages and restores a valid backup across reload without changing unrelated storage", async ({
    page,
  }) => {
    await page.goto("/progress", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem("theme", "dark");
      localStorage.setItem("locale", "de");
      localStorage.setItem("mythos-atlas-bookmarks", "[]");
      localStorage.setItem("mythos-atlas-reading-progress", "{}");
    });
    await page.reload({ waitUntil: "domcontentloaded" });

    // Open the picker through the visible client control first. This ensures
    // its React change handler has hydrated before dispatching a file event.
    const chooseBackup = page.getByRole("button", {
      name: "Choose backup to review",
    });
    await expect(chooseBackup).toBeEnabled();
    const chooser = page.waitForEvent("filechooser");
    await chooseBackup.click();
    await (
      await chooser
    ).setFiles({
      name: BACKUP_NAME,
      mimeType: "application/json",
      buffer: Buffer.from(backupFile()),
    });

    await expect(page.getByText("Ready to restore")).toBeVisible();
    await expect(page.getByText("4 categories")).toBeVisible();
    await expect(page.getByText("1 viewed")).toBeVisible();

    const reloaded = page.waitForEvent("framenavigated");
    await page.getByRole("button", { name: "Restore this backup" }).click();
    await reloaded;
    await expect(
      page.getByRole("heading", { level: 1, name: "Your Stats" }),
    ).toBeVisible();

    const restored = await page.evaluate(() => ({
      bookmarks: localStorage.getItem("mythos-atlas-bookmarks"),
      reading: localStorage.getItem("mythos-atlas-reading-progress"),
      progress: localStorage.getItem("mythos-atlas-progress"),
      review: localStorage.getItem("mythos-atlas-review"),
      theme: localStorage.getItem("theme"),
      locale: localStorage.getItem("locale"),
    }));

    expect(JSON.parse(restored.bookmarks ?? "[]")).toEqual([
      { type: "deity", id: "zeus", timestamp: 1 },
    ]);
    expect(JSON.parse(restored.reading ?? "{}").iliad.percentage).toBe(50);
    expect(JSON.parse(restored.progress ?? "{}").deitiesViewed).toEqual([
      "zeus",
    ]);
    expect(Object.keys(JSON.parse(restored.review ?? "{}").cards)).toEqual([
      "domain-match:zeus",
    ]);
    expect(restored.theme).toBe("dark");
    expect(restored.locale).toBe("de");
  });
});
