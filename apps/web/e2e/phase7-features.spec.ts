import { test, expect, devices } from "@playwright/test";

// Helper to wait for Oracle button (has 1s animation delay + dynamic loading)
const waitForOracleButton = async (page: import("@playwright/test").Page) => {
  const oracleButton = page.locator('button[aria-label="Ask the Oracle"]');
  await expect(oracleButton).toBeVisible({ timeout: 10000 });
  return oracleButton;
};

test.describe("Phase 7: Oracle Chat", () => {
  test("should display Oracle button on homepage", async ({ page }) => {
    await page.goto(`/`);
    await page.waitForLoadState("domcontentloaded");

    // Oracle button should be visible (has 1s animation delay)
    await waitForOracleButton(page);
  });

  test("should open Oracle modal when clicking button", async ({ page }) => {
    await page.goto(`/`);
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
    await page.goto(`/`);
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

  test("should send a suggested question without calling a live Oracle", async ({
    page,
  }) => {
    await page.route("**/api/oracle", async (route) => {
      // The Oracle streams AI SDK UI message chunks as server-sent events.
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: [
          { type: "start" },
          { type: "text-start", id: "t1" },
          {
            type: "text-delta",
            id: "t1",
            delta: "Zeus is a central god in Greek tradition.",
          },
          { type: "text-end", id: "t1" },
          { type: "finish" },
        ]
          .map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`)
          .concat("data: [DONE]\n\n")
          .join(""),
      });
    });
    await page.goto(`/`);
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

    // Suggestions deliberately submit immediately; they do not merely fill input.
    const input = page.locator('input[placeholder="Ask the Oracle..."]');
    await expect(input).toHaveValue("");
    await expect(
      page.getByText("Who is the most powerful Greek god?", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Zeus is a central god in Greek tradition.", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("should close Oracle modal with X button", async ({ page }) => {
    await page.goto(`/`);
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
    await page.goto(`/deities/zeus`, {
      waitUntil: "domcontentloaded",
    });

    const deityName = page.getByRole("heading", {
      name: "Zeus",
      level: 1,
      exact: true,
    });
    await expect(deityName).toBeVisible({ timeout: 10000 });

    const deityImage = page.locator('figure img[alt*="Zeus"]');
    await expect(deityImage.first()).toBeVisible({ timeout: 10000 });
  });

  test("should render deity details across different pantheons", async ({
    page,
  }) => {
    // Test Greek deity
    await page.goto(`/deities/zeus`, {
      waitUntil: "domcontentloaded",
    });
    const greekDeity = page.getByRole("heading", {
      name: "Zeus",
      level: 1,
      exact: true,
    });
    await expect(greekDeity).toBeVisible({ timeout: 10000 });

    // Test Egyptian deity
    await page.goto(`/deities/ra`, {
      waitUntil: "domcontentloaded",
    });
    const egyptianDeity = page.getByRole("heading", {
      name: "Ra",
      level: 1,
      exact: true,
    });
    await expect(egyptianDeity).toBeVisible({ timeout: 10000 });

    // Test Japanese deity
    await page.goto(`/deities/amaterasu`, {
      waitUntil: "domcontentloaded",
    });
    const japaneseDeity = page.getByRole("heading", {
      name: "Amaterasu",
      level: 1,
      exact: true,
    });
    await expect(japaneseDeity).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Phase 7: Layout Effects", () => {
  test("Oracle button should be present on all pages", async ({ page }) => {
    const pagesToCheck = ["/", "/deities", "/pantheons", "/stories", "/quiz"];

    for (const path of pagesToCheck) {
      await page.goto(`${path}`);
      await page.waitForLoadState("domcontentloaded");

      // Oracle has 1s animation delay + dynamic loading
      const oracleButton = page.locator('button[aria-label="Ask the Oracle"]');
      await expect(oracleButton).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe("Phase 7: Mobile Viewport Tests", () => {
  test("Oracle button should be visible on mobile", async ({
    browser,
    baseURL,
    storageState,
  }) => {
    const context = await browser.newContext({
      ...devices["iPhone 13"],
      baseURL,
      storageState,
      isMobile: browser.browserType().name() !== "firefox",
    });
    const page = await context.newPage();

    await page.goto(`/`);
    await page.waitForLoadState("domcontentloaded");

    // Oracle has 1s animation delay + dynamic loading
    const oracleButton = page.locator('button[aria-label="Ask the Oracle"]');
    await expect(oracleButton).toBeVisible({ timeout: 10000 });

    await context.close();
  });

  test("Oracle modal should be responsive on mobile", async ({
    browser,
    baseURL,
    storageState,
  }) => {
    const context = await browser.newContext({
      ...devices["iPhone 13"],
      baseURL,
      storageState,
      isMobile: browser.browserType().name() !== "firefox",
    });
    const page = await context.newPage();

    await page.goto(`/`);
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

  test("Deity page should render properly on mobile", async ({
    browser,
    baseURL,
    storageState,
  }) => {
    const context = await browser.newContext({
      ...devices["iPhone 13"],
      baseURL,
      storageState,
      isMobile: browser.browserType().name() !== "firefox",
    });
    const page = await context.newPage();

    await page.goto(`/deities/zeus`, { waitUntil: "domcontentloaded" });

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

    await page.goto(`/`);
    await page.waitForLoadState("domcontentloaded");

    // Page should still load successfully
    const heroTitle = page.locator("h1").first();
    await expect(heroTitle).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Phase 7: Tablet Viewport Tests", () => {
  test("Oracle modal should be properly sized on tablet", async ({
    browser,
    baseURL,
    storageState,
  }) => {
    const context = await browser.newContext({
      ...devices["iPad Pro 11"],
      baseURL,
      storageState,
      isMobile: browser.browserType().name() !== "firefox",
    });
    const page = await context.newPage();

    await page.goto(`/`);
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
    baseURL,
    storageState,
  }) => {
    const context = await browser.newContext({
      ...devices["iPad Pro 11"],
      baseURL,
      storageState,
      isMobile: browser.browserType().name() !== "firefox",
    });
    const page = await context.newPage();

    // Athena's page shows Met museum images hotlinked from metmuseum.org; on a
    // tablet viewport they load eagerly, so the full "load" event depends on a
    // third-party host. The layout checks below only need the document.
    await page.goto(`/deities/athena`, { waitUntil: "domcontentloaded" });

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
    await page.goto(`/`);
    await page.waitForLoadState("domcontentloaded");
    const loadTime = Date.now() - start;

    // DOM content should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test("Deity page should not block interaction", async ({ page }) => {
    await page.goto(`/deities/odin`, { waitUntil: "domcontentloaded" });

    // Page content should be interactive
    const deityName = page.locator("h1").filter({ hasText: "Odin" });
    await expect(deityName).toBeVisible({ timeout: 3000 });

    // Links should be clickable
    const links = page.locator("a");
    const firstLink = links.first();
    await expect(firstLink).toBeEnabled();
  });
});
