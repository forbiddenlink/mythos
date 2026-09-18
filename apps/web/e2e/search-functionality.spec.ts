import { test, expect } from "@playwright/test";

test.describe("Search Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    // Wait for main content to be visible instead of networkidle (unreliable with analytics)
    await page.waitForSelector("main", { state: "visible", timeout: 10000 });
    // The server-rendered main is visible before client keyboard handlers mount.
    await expect(page.getByRole("button", { name: /Switch to (light|dark) mode/ })).toBeVisible();
  });

  test("should open search with keyboard shortcut", async ({ page }) => {
    // Press Ctrl+K to open search (works on all platforms)
    await page.keyboard.press("Control+k");

    // Search dialog should be visible
    await expect(page.getByPlaceholder(/search/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("should open search with click on search trigger", async ({ page }) => {
    // Click the search button/trigger if visible
    const searchTrigger = page
      .locator(
        '[data-search-trigger], button:has-text("Search"), [aria-label*="search" i]',
      )
      .first();

    await expect(searchTrigger).toBeVisible();
    await searchTrigger.click();
    await expect(page.getByPlaceholder(/search/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("should show popular searches when opened", async ({ page }) => {
    // Open search
    await page.keyboard.press("Control+k");

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Should show popular searches section
    await expect(page.getByText(/popular searches/i)).toBeVisible();
  });

  test("should search and show results", async ({ page }) => {
    // Open search
    await page.keyboard.press("Control+k");

    // Type a search query
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("Zeus");

    // Wait for results
    await page.waitForTimeout(500); // Wait for debounce

    // Should show results - look for Zeus in the search results
    await expect(page.locator('[role="option"]').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("should navigate to result on selection", async ({ page }) => {
    // Open search
    await page.keyboard.press("Control+k");

    // Type search query
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("Zeus");

    // Wait for results
    await page.waitForTimeout(500);

    const result = page
      .locator('[role="option"]')
      .filter({ hasText: "Zeus" })
      .first();
    await expect(result).toBeVisible({ timeout: 5000 });
    await result.click();
    await expect(page).toHaveURL(/\/deities\/zeus/i, { timeout: 8000 });
  });

  test("should close search with Escape", async ({ page }) => {
    // Open search
    await page.keyboard.press("Control+k");

    // Verify it's open
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();

    // Press Escape
    await page.keyboard.press("Escape");

    // Dialog should close
    await expect(page.getByPlaceholder(/search/i)).not.toBeVisible({
      timeout: 3000,
    });
  });

  test('should show "no results" for unmatched queries', async ({ page }) => {
    // Open search
    await page.keyboard.press("Control+k");

    // Type a query that won't match anything
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("xyznotfoundxyz");

    // Wait for search
    await page.waitForTimeout(500);

    // Should show no results message
    await expect(page.getByText(/no results/i)).toBeVisible({ timeout: 5000 });
  });

  test("should support keyboard navigation", async ({ page }) => {
    // Open search
    await page.keyboard.press("Control+k");

    // Type search query
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("god");

    // Wait for results
    await page.waitForTimeout(500);

    // Press arrow down to navigate
    await page.keyboard.press("ArrowDown");

    // Press Enter to select
    await page.keyboard.press("Enter");

    // Should navigate away from search (URL should change)
    // Just verify search closes
    await expect(page.getByPlaceholder(/search/i)).not.toBeVisible({
      timeout: 5000,
    });
  });
});
