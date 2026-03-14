import { test, expect } from "@playwright/test";

// Helper to wait for page load
const waitForPage = async (page: import("@playwright/test").Page) => {
  await page.waitForLoadState("domcontentloaded");
};

test.describe("Content Browsing", () => {
  test("should display homepage", async ({ page }) => {
    await page.goto("/");
    await waitForPage(page);

    // Homepage should load successfully
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to pantheons list", async ({ page }) => {
    await page.goto("/pantheons");
    await waitForPage(page);

    // Should see pantheons content
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("should navigate from pantheons to deities", async ({ page }) => {
    // Start at pantheons
    await page.goto("/pantheons");
    await waitForPage(page);
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });

    // Click on a pantheon (e.g., Greek)
    const greekLink = page
      .locator('a[href*="greek"], a:has-text("Greek")')
      .first();
    await expect(greekLink).toBeVisible({ timeout: 10000 });
    await greekLink.click();
    await waitForPage(page);

    // Should navigate to pantheon details or deities (URL contains greek or pantheon)
    const url = page.url();
    expect(url.includes("greek") || url.includes("pantheon")).toBeTruthy();
  });

  test("should display deity details page", async ({ page }) => {
    await page.goto("/deities/zeus");
    await waitForPage(page);

    // Should show deity information - look for Zeus text anywhere on page
    await expect(page.locator("text=Zeus").first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("should display stories list", async ({ page }) => {
    await page.goto("/stories");
    await waitForPage(page);

    // Should show stories section
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to story details", async ({ page }) => {
    await page.goto("/stories");
    await waitForPage(page);
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });

    // Click on a story - look for any clickable story element
    const storyLink = page.locator('a[href*="/stories/"]').first();
    await expect(storyLink).toBeVisible({ timeout: 10000 });
    await storyLink.click();
    await waitForPage(page);

    // Should have navigated away from the stories list
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("should display creatures page", async ({ page }) => {
    await page.goto("/creatures");
    await waitForPage(page);

    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("should display artifacts page", async ({ page }) => {
    await page.goto("/artifacts");
    await waitForPage(page);

    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("should display locations page", async ({ page }) => {
    await page.goto("/locations");
    await waitForPage(page);

    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("should support navigation back and forward", async ({ page }) => {
    // Navigate through several pages
    await page.goto("/");
    await waitForPage(page);
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });

    await page.goto("/deities/zeus");
    await waitForPage(page);
    await expect(page.locator("text=Zeus").first()).toBeVisible({
      timeout: 10000,
    });
    expect(page.url()).toContain("zeus");

    // Go back
    await page.goBack();
    await waitForPage(page);
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });

    // Go forward
    await page.goForward();
    await waitForPage(page);
    await expect(page.locator("text=Zeus").first()).toBeVisible({
      timeout: 10000,
    });
    expect(page.url()).toContain("zeus");
  });

  test("should have working internal links", async ({ page }) => {
    await page.goto("/deities/zeus");
    await waitForPage(page);
    await expect(page.locator("text=Zeus").first()).toBeVisible({
      timeout: 10000,
    });

    // Find any internal link on the page
    const internalLink = page.locator('a[href^="/"]').first();
    await expect(internalLink).toBeVisible({ timeout: 10000 });
    const href = await internalLink.getAttribute("href");
    await internalLink.click();
    await waitForPage(page);

    // Should navigate to the link destination
    if (href) {
      expect(page.url()).toContain(href.split("?")[0]);
    }
  });

  test("should handle 404 pages gracefully", async ({ page }) => {
    await page.goto("/nonexistent-page-12345");
    await waitForPage(page);

    // Page should load (not crash) - might show 404 or redirect
    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });
});
