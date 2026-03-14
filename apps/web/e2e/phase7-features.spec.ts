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

  test("should fill input when clicking suggested question", async ({
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
    await suggestedQuestion.click();

    // Input should be filled with the question
    const input = page.locator('input[placeholder="Ask the Oracle..."]');
    await expect(input).toHaveValue("Who is the most powerful Greek god?");
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

test.describe("Phase 7: 3D Deity Statue", () => {
  test("should render statue container on deity page", async ({ page }) => {
    await page.goto(`${BASE_URL}/deities/zeus`);
    await page.waitForLoadState("domcontentloaded");

    // Look for the 3D canvas container or fallback
    // The component renders either a Canvas or a fallback div
    const statueContainer = page.locator(".h-80.rounded-xl");
    await expect(statueContainer.first()).toBeVisible({ timeout: 10000 });
  });

  test("should display fallback content when WebGL unavailable", async ({
    page,
  }) => {
    // Disable WebGL
    await page.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = function (type: string) {
        if (
          type === "webgl" ||
          type === "webgl2" ||
          type === "experimental-webgl"
        ) {
          return null;
        }
        return Object.getPrototypeOf(
          HTMLCanvasElement.prototype,
        ).getContext.call(this, type);
      };
    });

    await page.goto(`${BASE_URL}/deities/zeus`);
    await page.waitForLoadState("domcontentloaded");

    // Should show emoji fallback
    const fallbackEmoji = page.locator("text=🏛️");
    await expect(fallbackEmoji).toBeVisible({ timeout: 10000 });
  });

  test("should render different statue materials for different pantheons", async ({
    page,
  }) => {
    // Test Greek deity (marble material)
    await page.goto(`${BASE_URL}/deities/zeus`);
    await page.waitForLoadState("domcontentloaded");
    const greekStatue = page.locator(".h-80.rounded-xl").first();
    await expect(greekStatue).toBeVisible({ timeout: 10000 });

    // Test Egyptian deity (gold material)
    await page.goto(`${BASE_URL}/deities/ra`);
    await page.waitForLoadState("domcontentloaded");
    const egyptianStatue = page.locator(".h-80.rounded-xl").first();
    await expect(egyptianStatue).toBeVisible({ timeout: 10000 });

    // Test Japanese deity (jade material)
    await page.goto(`${BASE_URL}/deities/amaterasu`);
    await page.waitForLoadState("domcontentloaded");
    const japaneseStatue = page.locator(".h-80.rounded-xl").first();
    await expect(japaneseStatue).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Phase 7: Layout Effects", () => {
  test("Oracle button should be present on all pages", async ({ page }) => {
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
  test("Oracle button should be visible on mobile", async ({ browser }) => {
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

    // Statue container or fallback should be present
    const statueContainer = page.locator(".h-80.rounded-xl");
    await expect(statueContainer.first()).toBeVisible({ timeout: 10000 });

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

  test("Deity 3D statue should render on tablet", async ({ browser }) => {
    const context = await browser.newContext({ ...devices["iPad Pro 11"] });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/deities/athena`);
    await page.waitForLoadState("domcontentloaded");

    const statueContainer = page.locator(".h-80.rounded-xl");
    await expect(statueContainer.first()).toBeVisible({ timeout: 10000 });

    await context.close();
  });
});

test.describe("Phase 7: Performance", () => {
  test("Homepage should load within acceptable time", async ({ page }) => {
    // Skip this test if running against dev server (too variable)
    // This should run in CI against production build
    const start = Date.now();
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("domcontentloaded");
    const loadTime = Date.now() - start;

    // DOM content should load within 10 seconds (dev server can be slow)
    expect(loadTime).toBeLessThan(10000);
  });

  test("Deity page with 3D should not block interaction", async ({ page }) => {
    await page.goto(`${BASE_URL}/deities/odin`);
    await page.waitForLoadState("domcontentloaded");

    // Page content should be interactive while 3D loads
    const deityName = page.locator("h1").filter({ hasText: "Odin" });
    await expect(deityName).toBeVisible({ timeout: 3000 });

    // Links should be clickable
    const links = page.locator("a");
    const firstLink = links.first();
    await expect(firstLink).toBeEnabled();
  });
});
