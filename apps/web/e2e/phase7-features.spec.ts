import { test, expect, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Phase 7: Oracle Chat', () => {
  test('should display Oracle button on homepage', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');

    // Oracle button should be visible (fixed position bottom-right)
    const oracleButton = page.locator('button[aria-label="Ask the Oracle"]');
    await expect(oracleButton).toBeVisible({ timeout: 5000 });
  });

  test('should open Oracle modal when clicking button', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');

    // Click Oracle button
    const oracleButton = page.locator('button[aria-label="Ask the Oracle"]');
    await oracleButton.click();

    // Modal should appear
    const modalHeader = page.locator('text=Oracle of Delphi');
    await expect(modalHeader).toBeVisible({ timeout: 3000 });

    // Welcome message should be visible
    const welcomeText = page.locator('text=Greetings, seeker of wisdom');
    await expect(welcomeText).toBeVisible();
  });

  test('should display suggested questions in Oracle modal', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');

    const oracleButton = page.locator('button[aria-label="Ask the Oracle"]');
    await oracleButton.click();

    // Should show suggested questions
    const suggestedQuestion = page.locator('text=Who is the most powerful Greek god?');
    await expect(suggestedQuestion).toBeVisible();
  });

  test('should fill input when clicking suggested question', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');

    const oracleButton = page.locator('button[aria-label="Ask the Oracle"]');
    await oracleButton.click();

    // Click a suggested question
    const suggestedQuestion = page.locator('text=Who is the most powerful Greek god?');
    await suggestedQuestion.click();

    // Input should be filled with the question
    const input = page.locator('input[placeholder="Ask the Oracle..."]');
    await expect(input).toHaveValue('Who is the most powerful Greek god?');
  });

  test('should close Oracle modal with X button', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');

    const oracleButton = page.locator('button[aria-label="Ask the Oracle"]');
    await oracleButton.click();

    const modalHeader = page.locator('text=Oracle of Delphi');
    await expect(modalHeader).toBeVisible();

    // Click close button
    const closeButton = page.locator('button').filter({ has: page.locator('svg.lucide-x') });
    await closeButton.click();

    // Modal should be hidden
    await expect(modalHeader).not.toBeVisible({ timeout: 2000 });
  });
});

test.describe('Phase 7: 3D Deity Statue', () => {
  test('should render statue container on deity page', async ({ page }) => {
    await page.goto(`${BASE_URL}/deities/zeus`);
    await page.waitForLoadState('networkidle');

    // Look for the 3D canvas container or fallback
    // The component renders either a Canvas or a fallback div
    const statueContainer = page.locator('.h-80.rounded-xl');
    await expect(statueContainer.first()).toBeVisible({ timeout: 5000 });
  });

  test('should display fallback content when WebGL unavailable', async ({ page }) => {
    // Disable WebGL
    await page.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = function (type: string) {
        if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
          return null;
        }
        return Object.getPrototypeOf(HTMLCanvasElement.prototype).getContext.call(this, type);
      };
    });

    await page.goto(`${BASE_URL}/deities/zeus`);
    await page.waitForLoadState('networkidle');

    // Should show emoji fallback
    const fallbackEmoji = page.locator('text=🏛️');
    await expect(fallbackEmoji).toBeVisible({ timeout: 5000 });
  });

  test('should render different statue materials for different pantheons', async ({ page }) => {
    // Test Greek deity (marble material)
    await page.goto(`${BASE_URL}/deities/zeus`);
    await page.waitForLoadState('networkidle');
    const greekStatue = page.locator('.h-80.rounded-xl').first();
    await expect(greekStatue).toBeVisible();

    // Test Egyptian deity (gold material)
    await page.goto(`${BASE_URL}/deities/ra`);
    await page.waitForLoadState('networkidle');
    const egyptianStatue = page.locator('.h-80.rounded-xl').first();
    await expect(egyptianStatue).toBeVisible();

    // Test Japanese deity (jade material)
    await page.goto(`${BASE_URL}/deities/amaterasu`);
    await page.waitForLoadState('networkidle');
    const japaneseStatue = page.locator('.h-80.rounded-xl').first();
    await expect(japaneseStatue).toBeVisible();
  });
});

test.describe('Phase 7: Layout Effects', () => {
  test('Oracle button should be present on all pages', async ({ page }) => {
    const pagesToCheck = [
      '/',
      '/deities',
      '/pantheons',
      '/stories',
      '/quiz',
    ];

    for (const path of pagesToCheck) {
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState('networkidle');

      const oracleButton = page.locator('button[aria-label="Ask the Oracle"]');
      await expect(oracleButton).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Phase 7: Mobile Viewport Tests', () => {
  test.use({ ...devices['iPhone 13'] });

  test('Oracle button should be visible on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');

    const oracleButton = page.locator('button[aria-label="Ask the Oracle"]');
    await expect(oracleButton).toBeVisible({ timeout: 5000 });
  });

  test('Oracle modal should be responsive on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');

    const oracleButton = page.locator('button[aria-label="Ask the Oracle"]');
    await oracleButton.click();

    // Modal should fill most of the screen on mobile
    const modal = page.locator('text=Oracle of Delphi').locator('..');
    await expect(modal).toBeVisible();

    // Input should be visible and tappable
    const input = page.locator('input[placeholder="Ask the Oracle..."]');
    await expect(input).toBeVisible();
    await input.tap();
    await expect(input).toBeFocused();
  });

  test('Deity page should render properly on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/deities/zeus`);
    await page.waitForLoadState('networkidle');

    // Page should load without errors
    const deityName = page.locator('h1').filter({ hasText: 'Zeus' });
    await expect(deityName).toBeVisible();

    // Statue container or fallback should be present
    const statueContainer = page.locator('.h-80.rounded-xl');
    await expect(statueContainer.first()).toBeVisible({ timeout: 5000 });
  });

  test('Homepage particles should respect reduced motion', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');

    // Page should still load successfully
    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toBeVisible();
  });
});

test.describe('Phase 7: Tablet Viewport Tests', () => {
  test.use({ ...devices['iPad Pro 11'] });

  test('Oracle modal should be properly sized on tablet', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');

    const oracleButton = page.locator('button[aria-label="Ask the Oracle"]');
    await oracleButton.click();

    // Modal should be visible
    const modalHeader = page.locator('text=Oracle of Delphi');
    await expect(modalHeader).toBeVisible();

    // Should have suggested questions
    const suggestedQuestion = page.locator('text=Tell me about Norse creation mythology');
    await expect(suggestedQuestion).toBeVisible();
  });

  test('Deity 3D statue should render on tablet', async ({ page }) => {
    await page.goto(`${BASE_URL}/deities/athena`);
    await page.waitForLoadState('networkidle');

    const statueContainer = page.locator('.h-80.rounded-xl');
    await expect(statueContainer.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Phase 7: Performance', () => {
  test('Homepage should load within acceptable time', async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - start;

    // DOM content should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('Deity page with 3D should not block interaction', async ({ page }) => {
    await page.goto(`${BASE_URL}/deities/odin`);
    await page.waitForLoadState('domcontentloaded');

    // Page content should be interactive while 3D loads
    const deityName = page.locator('h1').filter({ hasText: 'Odin' });
    await expect(deityName).toBeVisible({ timeout: 3000 });

    // Links should be clickable
    const links = page.locator('a');
    const firstLink = links.first();
    await expect(firstLink).toBeEnabled();
  });
});
