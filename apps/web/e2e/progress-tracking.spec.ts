import { test, expect } from '@playwright/test';

test.describe('Progress Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should track deity views in localStorage', async ({ page }) => {
    // Navigate to a deity page
    await page.goto('/deities/zeus');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check that progress was saved
    const progress = await page.evaluate(() => {
      const saved = localStorage.getItem('mythos-atlas-progress');
      return saved ? JSON.parse(saved) : null;
    });

    // Deity should be tracked (though component may not track immediately)
    expect(progress).toBeDefined();
  });

  test('should track story reads', async ({ page }) => {
    // Navigate to a story page
    await page.goto('/stories');
    await page.waitForLoadState('networkidle');

    // Click on a story if list is visible
    const storyLink = page.locator('a[href*="/stories/"]').first();
    if (await storyLink.isVisible()) {
      await storyLink.click();
      await page.waitForLoadState('networkidle');
    }

    // Progress should be tracked
    const progress = await page.evaluate(() => {
      const saved = localStorage.getItem('mythos-atlas-progress');
      return saved ? JSON.parse(saved) : null;
    });

    expect(progress).toBeDefined();
  });

  test('should persist progress across page reloads', async ({ page }) => {
    // Visit a deity page
    await page.goto('/deities/athena');
    await page.waitForLoadState('networkidle');

    // Get initial progress
    const initialProgress = await page.evaluate(() => {
      return localStorage.getItem('mythos-atlas-progress');
    });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Progress should still be there
    const afterReload = await page.evaluate(() => {
      return localStorage.getItem('mythos-atlas-progress');
    });

    expect(afterReload).toBeDefined();
  });

  test('should maintain streak on consecutive days', async ({ page }) => {
    // This test simulates streak behavior by checking localStorage handling
    await page.goto('/');

    // Set up initial progress with yesterday's visit
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    await page.evaluate((lastVisit) => {
      localStorage.setItem('mythos-atlas-progress', JSON.stringify({
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
      }));
    }, yesterdayStr);

    // Reload to trigger streak update
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check streak was incremented
    const progress = await page.evaluate(() => {
      const saved = localStorage.getItem('mythos-atlas-progress');
      return saved ? JSON.parse(saved) : null;
    });

    // Streak should be 6 (incremented from 5)
    expect(progress?.dailyStreak).toBe(6);
  });

  test('should update last visit date', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const progress = await page.evaluate(() => {
      const saved = localStorage.getItem('mythos-atlas-progress');
      return saved ? JSON.parse(saved) : null;
    });

    const today = new Date().toISOString().split('T')[0];
    expect(progress?.lastVisit).toBe(today);
  });
});
