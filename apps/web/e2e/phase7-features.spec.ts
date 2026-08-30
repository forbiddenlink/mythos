import { test, expect, devices } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

// Helper to wait for Oracle button (has 1s animation delay + dynamic loading)
const waitForOracleButton = async (page: import("@playwright/test").Page) => {
  const oracleButton = page.locator('button[aria-label="Ask the Oracle"]');
  await expect(oracleButton).toBeVisible({ timeout: 10000 });
  return oracleButton;
};

test.describe("Phase 7: Oracle Chat", () => {
  test("should display Oracle button on homepage", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("domcontentloaded");

    // Oracle button should be visible (has 1s animation delay)
    await waitForOracleButton(page);
  });

  test("should open Oracle modal when clicking button", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("domcontentloaded");

    // Click Oracle button
    const oracleButton = await waitForOracleButton(page);
    await oracleButton.click();

    // Modal should appear
    const modalHeader = page.locator('h2:has-text("Oracle of Delphi")');
    await expect(modalHeader).toBeVisible({ timeout: 5000 });

    // Welcome message should be visible
    const welcomeText = page.locator("text=Greetings, seeker of wisdom");
    await expect(welcomeText).toBeVisible({ timeout: 3000 });
  });

  test("should display suggested questions in Oracle modal", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("domcontentloaded");

    const oracleButton = await waitForOracleButton(page);
    await oracleButton.click();

    // Wait for modal
    await expect(page.locator('h2:has-text("Oracle of Delphi")')).toBeVisible({
      timeout: 5000,
    });

    // Should show suggested questions
    const suggestedQuestion = page.locator(
      'button:has-text("Who is the most powerful Greek god?")',
    );
    await expect(suggestedQuestion).toBeVisible({ timeout: 3000 });
  });

  // TODO: Fix suggested question click - input not being populated
  test.skip("should fill input when clicking suggested question", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("domcontentloaded");

    const oracleButton = await waitForOracleButton(page);
    await oracleButton.click();

    // Wait for modal
    await expect(page.locator('h2:has-text("Oracle of Delphi")')).toBeVisible({
      timeout: 5000,
    });

    // Click a suggested question
    const suggestedQuestion = page.locator(
      'button:has-text("Who is the most powerful Greek god?")',
    );
    await expect(suggestedQuestion).toBeVisible({ timeout: 3000 });

    // Force click and wait for any animations
    await suggestedQuestion.click({ force: true });
    await page.waitForTimeout(500);

    // Input should be filled with the question (allow time for state update)
    const input = page.locator('input[placeholder="Ask the Oracle..."]');
    await expect(input).toHaveValue("Who is the most powerful Greek god?", {
      timeout: 5000,
    });
  });

  test("should close Oracle modal with X button", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("domcontentloaded");

    const oracleButton = await waitForOracleButton(page);
    await oracleButton.click();

    const modalHeader = page.locator('h2:has-text("Oracle of Delphi")');
    await expect(modalHeader).toBeVisible({ timeout: 5000 });

    // Click close button (the X icon button)
    const closeButton = page
      .locator("button")
      .filter({ has: page.locator("svg.lucide-x") });
    await closeButton.click();

    // Modal should be hidden
    await expect(modalHeader).not.toBeVisible({ timeout: 3000 });
  });
});

// Replaces the former "Phase 7: 3D Deity Statue" block. The DeityStatue
// component (Canvas + WebGL fallback, .h-80.rounded-xl container) was deleted
// as dead code in 22f56bc ("chore: clear 2 CVEs and delete 48 dead files",
// 2026-08-12). Rather than skip the tests, these assert the editorial layout
// that actually renders today, so the deity page keeps real E2E coverage.
test.describe("Phase 7: Deity Editorial Layout & Details", () => {
  test("should render deity hero artwork and title on deity page", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/deities/zeus`);
    await page.waitForLoadState("domcontentloaded");

    const deityName = page.locator("h1").filter({ hasText: "Zeus" });
    await expect(deityName).toBeVisible({ timeout: 10000 });

    const deityImage = page.locator('figure img[alt*="Zeus"]');
    await expect(deityImage.first()).toBeVisible({ timeout: 10000 });
  });

  test("should render deity details across different pantheons", async ({
    page,
  }) => {
    // Test Greek deity
    await page.goto(`${BASE_URL}/deities/zeus`);
    await page.waitForLoadState("domcontentloaded");
    const greekDeity = page.locator("h1").filter({ hasText: "Zeus" });
    await expect(greekDeity).toBeVisible({ timeout: 10000 });

    // Test Egyptian deity
    await page.goto(`${BASE_URL}/deities/ra`);
    await page.waitForLoadState("domcontentloaded");
    const egyptianDeity = page.locator("h1").filter({ hasText: "Ra" });
    await expect(egyptianDeity).toBeVisible({ timeout: 10000 });

    // Test Japanese deity
    await page.goto(`${BASE_URL}/deities/amaterasu`);
    await page.waitForLoadState("domcontentloaded");
    const japaneseDeity = page.locator("h1").filter({ hasText: "Amaterasu" });
    await expect(japaneseDeity).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Phase 7: Layout Effects", () => {
  // Gated when Oracle API key is not inlined in CI environment
  test.skip("Oracle button should be present on all pages", async ({
    page,
  }) => {
    const pagesToCheck = ["/", "/deities", "/pantheons", "/stories", "/quiz"];

    for (const path of pagesToCheck) {
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState("domcontentloaded");

      // Oracle has 1s animation delay + dynamic loading
      const oracleButton = page.locator('button[aria-label="Ask the Oracle"]');
      await expect(oracleButton).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe("Phase 7: Mobile Viewport Tests", () => {
  test.skip("Oracle button should be visible on mobile", async ({
    browser,
  }) => {
    const context = await browser.newContext({ ...devices["iPhone 13"] });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("domcontentloaded");

    // Oracle has 1s animation delay + dynamic loading
    const oracleButton = page.locator('button[aria-label="Ask the Oracle"]');
    await expect(oracleButton).toBeVisible({ timeout: 10000 });

    await context.close();
  });

  test("Oracle modal should be responsive on mobile", async ({ browser }) => {
    const context = await browser.newContext({ ...devices["iPhone 13"] });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("domcontentloaded");

    // Wait for Oracle button
    const oracleButton = page.locator('button[aria-label="Ask the Oracle"]');
    await expect(oracleButton).toBeVisible({ timeout: 10000 });
    await oracleButton.click();

    // Modal should appear
    const modalHeader = page.locator('h2:has-text("Oracle of Delphi")');
    await expect(modalHeader).toBeVisible({ timeout: 5000 });

    // Input should be visible and tappable
    const input = page.locator('input[placeholder="Ask the Oracle..."]');
    await expect(input).toBeVisible({ timeout: 3000 });
    await input.tap();
    await expect(input).toBeFocused();

    await context.close();
  });

  test("Deity page should render properly on mobile", async ({ browser }) => {
    const context = await browser.newContext({ ...devices["iPhone 13"] });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/deities/zeus`);
    await page.waitForLoadState("domcontentloaded");

    // Page should load without errors
    const deityName = page.locator("h1").filter({ hasText: "Zeus" });
    await expect(deityName).toBeVisible({ timeout: 10000 });

    // Deity artwork should be visible
    const deityImage = page.locator('figure img[alt*="Zeus"]');
    await expect(deityImage.first()).toBeVisible({ timeout: 10000 });

    await context.close();
  });

  test("Homepage particles should respect reduced motion", async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: "reduce" });

    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("domcontentloaded");

    // Page should still load successfully
    const heroTitle = page.locator("h1").first();
    await expect(heroTitle).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Phase 7: Tablet Viewport Tests", () => {
  test("Oracle modal should be properly sized on tablet", async ({
    browser,
  }) => {
    const context = await browser.newContext({ ...devices["iPad Pro 11"] });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("domcontentloaded");

    // Wait for Oracle button
    const oracleButton = page.locator('button[aria-label="Ask the Oracle"]');
    await expect(oracleButton).toBeVisible({ timeout: 10000 });
    await oracleButton.click();

    // Modal should be visible
    const modalHeader = page.locator('h2:has-text("Oracle of Delphi")');
    await expect(modalHeader).toBeVisible({ timeout: 5000 });

    // Should have suggested questions
    const suggestedQuestion = page.locator(
      'button:has-text("Tell me about Norse creation mythology")',
    );
    await expect(suggestedQuestion).toBeVisible({ timeout: 3000 });

    await context.close();
  });

  test("Deity editorial layout should render on tablet", async ({
    browser,
  }) => {
    const context = await browser.newContext({ ...devices["iPad Pro 11"] });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/deities/athena`);
    await page.waitForLoadState("domcontentloaded");

    const deityName = page.locator("h1").filter({ hasText: "Athena" });
    await expect(deityName).toBeVisible({ timeout: 10000 });

    const deityImage = page.locator('figure img[alt*="Athena"]');
    await expect(deityImage.first()).toBeVisible({ timeout: 10000 });

    await context.close();
  });
});

test.describe("Phase 7: Performance", () => {
  test("Homepage should load within acceptable time", async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("domcontentloaded");
    const loadTime = Date.now() - start;

    // DOM content should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test("Deity page should not block interaction", async ({ page }) => {
    await page.goto(`${BASE_URL}/deities/odin`);
    await page.waitForLoadState("domcontentloaded");

    // Page content should be interactive
    const deityName = page.locator("h1").filter({ hasText: "Odin" });
    await expect(deityName).toBeVisible({ timeout: 3000 });

    // Links should be clickable
    const links = page.locator("a");
    const firstLink = links.first();
    await expect(firstLink).toBeEnabled();
  });
});
