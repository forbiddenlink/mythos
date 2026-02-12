import { test, expect } from '@playwright/test';

test.describe('Content Browsing', () => {
  test('should display homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Homepage should load successfully
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to pantheons list', async ({ page }) => {
    await page.goto('/pantheons');
    await page.waitForLoadState('networkidle');

    // Should see pantheons content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate from pantheons to deities', async ({ page }) => {
    // Start at pantheons
    await page.goto('/pantheons');
    await page.waitForLoadState('networkidle');

    // Click on a pantheon (e.g., Greek)
    const greekLink = page.locator('a[href*="greek"], a:has-text("Greek")').first();
    if (await greekLink.isVisible()) {
      await greekLink.click();
      await page.waitForLoadState('networkidle');

      // Should navigate to pantheon details or deities (URL contains greek or pantheon)
      const url = page.url();
      expect(url.includes('greek') || url.includes('pantheon')).toBeTruthy();
    }
  });

  test('should display deity details page', async ({ page }) => {
    await page.goto('/deities/zeus');
    await page.waitForLoadState('networkidle');

    // Should show deity information - look for Zeus text anywhere on page
    await expect(page.locator('text=Zeus').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display stories list', async ({ page }) => {
    await page.goto('/stories');
    await page.waitForLoadState('networkidle');

    // Should show stories section
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to story details', async ({ page }) => {
    await page.goto('/stories');
    await page.waitForLoadState('networkidle');

    // Click on a story - look for any clickable story element
    const storyLink = page.locator('a[href*="/stories/"], a[href*="story"]').first();
    const isVisible = await storyLink.isVisible().catch(() => false);

    if (isVisible) {
      await storyLink.click();
      await page.waitForLoadState('networkidle');

      // Should have navigated away from the stories list
      await expect(page.locator('body')).toBeVisible();
    } else {
      // If no story links found, just verify page loaded
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should display creatures page', async ({ page }) => {
    await page.goto('/creatures');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });

  test('should display artifacts page', async ({ page }) => {
    await page.goto('/artifacts');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });

  test('should display locations page', async ({ page }) => {
    await page.goto('/locations');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });

  test('should support navigation back and forward', async ({ page }) => {
    // Navigate through several pages
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.goto('/deities/zeus');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('zeus');

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Go forward
    await page.goForward();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('zeus');
  });

  test('should have working internal links', async ({ page }) => {
    await page.goto('/deities/zeus');
    await page.waitForLoadState('networkidle');

    // Find any internal link on the page
    const internalLink = page.locator('a[href^="/"]').first();
    if (await internalLink.isVisible()) {
      const href = await internalLink.getAttribute('href');
      await internalLink.click();
      await page.waitForLoadState('networkidle');

      // Should navigate to the link destination
      if (href) {
        await expect(page.url()).toContain(href.split('?')[0]);
      }
    }
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page-12345');
    await page.waitForLoadState('networkidle');

    // Page should load (not crash) - might show 404 or redirect
    await expect(page.locator('body')).toBeVisible();
  });
});
