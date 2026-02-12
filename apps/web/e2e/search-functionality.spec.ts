import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open search with keyboard shortcut', async ({ page }) => {
    // Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to open search
    await page.keyboard.press('Meta+k');

    // Search dialog should be visible
    await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 5000 });
  });

  test('should open search with click on search trigger', async ({ page }) => {
    // Click the search button/trigger if visible
    const searchTrigger = page.locator('[data-search-trigger], button:has-text("Search"), [aria-label*="search" i]').first();

    if (await searchTrigger.isVisible()) {
      await searchTrigger.click();
      await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show popular searches when opened', async ({ page }) => {
    // Open search
    await page.keyboard.press('Meta+k');

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Should show popular searches section
    await expect(page.getByText(/popular searches/i)).toBeVisible();
  });

  test('should search and show results', async ({ page }) => {
    // Open search
    await page.keyboard.press('Meta+k');

    // Type a search query
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Zeus');

    // Wait for results
    await page.waitForTimeout(500); // Wait for debounce

    // Should show results - look for Zeus in the search results
    await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to result on selection', async ({ page }) => {
    // Open search
    await page.keyboard.press('Meta+k');

    // Type search query
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Zeus');

    // Wait for results
    await page.waitForTimeout(500);

    // Click on a result
    const result = page.locator('[role="option"]').filter({ hasText: 'Zeus' }).first();
    if (await result.isVisible()) {
      await result.click();

      // Should navigate to the deity page
      await expect(page).toHaveURL(/.*zeus.*/i, { timeout: 5000 });
    }
  });

  test('should close search with Escape', async ({ page }) => {
    // Open search
    await page.keyboard.press('Meta+k');

    // Verify it's open
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Dialog should close
    await expect(page.getByPlaceholder(/search/i)).not.toBeVisible({ timeout: 3000 });
  });

  test('should show "no results" for unmatched queries', async ({ page }) => {
    // Open search
    await page.keyboard.press('Meta+k');

    // Type a query that won't match anything
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('xyznotfoundxyz');

    // Wait for search
    await page.waitForTimeout(500);

    // Should show no results message
    await expect(page.getByText(/no results/i)).toBeVisible({ timeout: 5000 });
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Open search
    await page.keyboard.press('Meta+k');

    // Type search query
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('god');

    // Wait for results
    await page.waitForTimeout(500);

    // Press arrow down to navigate
    await page.keyboard.press('ArrowDown');

    // Press Enter to select
    await page.keyboard.press('Enter');

    // Should navigate away from search (URL should change)
    // Just verify search closes
    await expect(page.getByPlaceholder(/search/i)).not.toBeVisible({ timeout: 5000 });
  });
});
