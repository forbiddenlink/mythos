import { expect, test } from "@playwright/test";

const getBrowserLocalDate = async (
  page: import("@playwright/test").Page,
  offsetDays = 0,
) =>
  page.evaluate((offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, offsetDays);

test.describe("Progress Tracking", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.clear());
  });

  test("should track deity views in localStorage", async ({ page }) => {
    await page.goto("/deities/zeus", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: /Zeus/ }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const saved = localStorage.getItem("mythos-atlas-progress");
          return saved ? JSON.parse(saved).deitiesViewed : [];
        }),
      )
      .toContain("zeus");
  });

  test("should track story reads", async ({ page }) => {
    await page.goto("/stories/abduction-of-persephone", {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "The Abduction of Persephone",
        exact: true,
      }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const saved = localStorage.getItem("mythos-atlas-progress");
          return saved ? JSON.parse(saved).storiesRead : [];
        }),
      )
      .toContain("abduction-of-persephone");
  });

  test("should persist progress across page reloads", async ({ page }) => {
    await page.goto("/deities/athena", { waitUntil: "domcontentloaded" });
    const heading = page.getByRole("heading", {
      level: 1,
      name: "Athena",
      exact: true,
    });
    await expect(heading).toBeVisible();
    const viewedDeities = () =>
      page.evaluate(() => {
        const saved = localStorage.getItem("mythos-atlas-progress");
        return saved ? JSON.parse(saved).deitiesViewed : [];
      });
    await expect.poll(viewedDeities).toContain("athena");
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(heading).toBeVisible();
    await expect.poll(viewedDeities).toContain("athena");
  });

  test("should maintain streak on consecutive days", async ({ page }) => {
    // This test simulates streak behavior by checking localStorage handling
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });

    // Set up initial progress with yesterday's visit
    const yesterdayStr = await getBrowserLocalDate(page, -1);

    const seededProgress = {
      deitiesViewed: [],
      storiesRead: [],
      pantheonsExplored: [],
      locationsVisited: [],
      quizScores: {},
      achievements: [],
      dailyStreak: 5,
      lastVisit: yesterdayStr,
      totalXP: 0,
      streakFreezes: 2,
    };

    // Seed before the next document's scripts run. Writing into an already
    // hydrated page can be overwritten by its pending provider persistence.
    await page.addInitScript((progress) => {
      localStorage.setItem("mythos-atlas-progress", JSON.stringify(progress));
    }, seededProgress);

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

    const today = await getBrowserLocalDate(page);

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

test.describe("First reading visit", () => {
  test.use({
    viewport: { width: 360, height: 800 },
    contextOptions: { reducedMotion: "reduce" },
  });

  test("saves a first entry and keeps it after returning to bookmarks", async ({
    page,
  }) => {
    await page.goto("/bookmarks");
    await expect(
      page.getByRole("heading", { name: "Keep a reading list" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Find a story to save" }),
    ).toBeInViewport();
    await page
      .getByRole("link", { name: "Browse figures", exact: true })
      .click();
    await expect(page).toHaveURL(/\/deities$/);
    await page
      .getByRole("textbox", { name: "Search deities by name", exact: true })
      .fill("Athena");
    await page.locator('main a[href="/deities/athena"]').first().click();
    await page
      .getByRole("button", { name: "Add deity to bookmarks", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Remove deity from bookmarks",
        exact: true,
      }),
    ).toBeVisible();
    await page.goto("/bookmarks");
    await expect(
      page.locator('main a[href="/deities/athena"]').first(),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.locator('main a[href="/deities/athena"]').first(),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Keep a reading list" }),
    ).toHaveCount(0);
  });

  test("builds a review deck after the first figure visit", async ({
    page,
  }) => {
    await page.goto("/review");
    await expect(
      page.getByRole("link", { name: "Start with Athena", exact: true }),
    ).toBeInViewport();
    await expect(page.getByText("Cards Due", { exact: true })).toHaveCount(0);
    await page
      .getByRole("link", { name: "Start with Athena", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Athena", exact: true }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("mythos-atlas-progress") || "{}")
              .deitiesViewed || [],
        ),
      )
      .toContain("athena");
    await page.goto("/review");
    await page
      .getByRole("button", { name: "Start Review Session", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Exit Session", exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/Card 1 of/)).toBeVisible();
  });

  test("offers a first destination and keeps backup restore available", async ({
    page,
  }) => {
    await page.goto("/progress");
    await expect(
      page.getByRole("link", { name: "Choose a tradition", exact: true }),
    ).toBeInViewport();
    await expect(
      page.getByRole("region", {
        name: "Learning backup and restore",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByText("0 XP Total", { exact: true })).toHaveCount(0);
    await page
      .getByRole("link", { name: "Choose a tradition", exact: true })
      .click();
    await expect(page).toHaveURL(/\/pantheons$/);
    await page.locator('main a[href="/pantheons/greek"]').first().click();
    await page.locator('main a[href="/deities/athena"]').first().click();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("mythos-atlas-progress") || "{}")
              .deitiesViewed || [],
        ),
      )
      .toContain("athena");
    await page.goto("/progress");
    await expect(
      page.getByText("Discovery Progress", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Choose a tradition", exact: true }),
    ).toHaveCount(0);
  });
});
