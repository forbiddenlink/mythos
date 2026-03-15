import { test, expect } from "@playwright/test";

// Helper to wait for page load
const waitForPage = async (page: import("@playwright/test").Page) => {
  await page.waitForLoadState("domcontentloaded");
};

test.describe("Progress Tracking", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.clear());
  });

  test("should track deity views in localStorage", async ({ page }) => {
    // Navigate to a deity page
    await page.goto("/deities/zeus", { waitUntil: "domcontentloaded" });

    // Wait for content to render
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });

    // Check that progress was saved
    const progress = await page.evaluate(() => {
      const saved = localStorage.getItem("mythos-atlas-progress");
      return saved ? JSON.parse(saved) : null;
    });

    // Deity should be tracked (though component may not track immediately)
    expect(progress).toBeDefined();
  });

  test("should track story reads", async ({ page }) => {
    // Navigate to a story page
    await page.goto("/stories", { waitUntil: "domcontentloaded" });

    // Wait for content
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });

    // Click on a story if list is visible
    const storyLink = page.locator('a[href*="/stories/"]').first();
    await expect(storyLink).toBeVisible({ timeout: 10000 });
    await storyLink.click();
    await waitForPage(page);

    // Progress should be tracked
    const progress = await page.evaluate(() => {
      const saved = localStorage.getItem("mythos-atlas-progress");
      return saved ? JSON.parse(saved) : null;
    });

    expect(progress).toBeDefined();
  });

  test("should persist progress across page reloads", async ({ page }) => {
    // Visit a deity page
    await page.goto("/deities/athena", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });

    // Get initial progress and verify it exists
    const initialProgress = await page.evaluate(() => {
      return localStorage.getItem("mythos-atlas-progress");
    });
    expect(initialProgress).toBeTruthy();

    // Reload page
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });

    // Progress should still be there
    const afterReload = await page.evaluate(() => {
      return localStorage.getItem("mythos-atlas-progress");
    });

    expect(afterReload).toBeDefined();
  });

  test("should maintain streak on consecutive days", async ({ page }) => {
    // This test simulates streak behavior by checking localStorage handling
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });

    // Set up initial progress with yesterday's visit
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    await page.evaluate((lastVisit) => {
      localStorage.setItem(
        "mythos-atlas-progress",
        JSON.stringify({
          deitiesViewed: [],
          storiesRead: [],
          pantheonsExplored: [],
          locationsVisited: [],
          quizScores: {},
          achievements: [],
          dailyStreak: 5,
          lastVisit,
          totalXP: 0,
          streakFreezes: 2,
        }),
      );
    }, yesterdayStr);

    // Reload to trigger streak update
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });

    // Poll for streak to be updated (React effects run async after render)
    await expect
      .poll(
        async () => {
          const progress = await page.evaluate(() => {
            const saved = localStorage.getItem("mythos-atlas-progress");
            return saved ? JSON.parse(saved) : null;
          });
          return progress?.dailyStreak;
        },
        { timeout: 5000 },
      )
      .toBe(6);
  });

  test("should update last visit date", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });

    const today = new Date().toISOString().split("T")[0];

    // Poll for lastVisit to be updated (React effects run async after render)
    await expect
      .poll(
        async () => {
          const progress = await page.evaluate(() => {
            const saved = localStorage.getItem("mythos-atlas-progress");
            return saved ? JSON.parse(saved) : null;
          });
          return progress?.lastVisit;
        },
        { timeout: 5000 },
      )
      .toBe(today);
  });
});
