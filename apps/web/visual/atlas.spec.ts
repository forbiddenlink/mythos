import { expect, test, type Locator, type Page } from "@playwright/test";

/** A fixed date without frozen timers: hydration, fonts, and lazy images still run. */
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-18T16:00:00Z"));
  // Only the remote raster is replaced. Journey markers, route, controls, and
  // readable stop details remain real and unmasked.
  await page.route("https://tile.openstreetmap.org/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=",
        "base64",
      ),
    }),
  );
});

async function atSection(section: Locator): Promise<void> {
  await expect(section).toBeVisible();
  await section.evaluate((element) => {
    const header = document.querySelector("body header");
    const offset = (header?.getBoundingClientRect().height ?? 0) + 24;
    scrollTo({
      top: scrollY + element.getBoundingClientRect().top - offset,
      behavior: "instant",
    });
  });
}

async function capture(page: Page, name: string): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const visibleImages = [...document.images].filter((image) => {
      const rect = image.getBoundingClientRect();
      return (
        rect.bottom > 0 &&
        rect.top < innerHeight &&
        rect.right > 0 &&
        rect.left < innerWidth
      );
    });
    await Promise.all(visibleImages.map((image) => image.decode()));
  });
  await page.mouse.move(-1, -1);
  await expect(page).toHaveScreenshot(name, {
    fullPage: false,
    // Repeated captures vary slightly at rounded clipping edges on this same
    // Mac/browser. Keep zero differing pixels beyond this small color tolerance
    // for the two family scenes; all other scenes remain exact.
    threshold: ["deity-family.png", "family-connection.png"].includes(name)
      ? 0.1
      : 0,
  });
}

test("home first viewport", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await capture(page, "home.png");
});

test("deity family reading area", async ({ page }) => {
  await page.goto("/deities/zeus");
  // Warm the priority portrait before parsing the lazy medallions again.
  // Chromium's cached-image selection then consistently reuses the larger Zeus.
  await page
    .locator("main img")
    .first()
    .evaluate((image: HTMLImageElement) => image.decode());
  await page.reload();
  await page
    .locator("main img")
    .first()
    .evaluate((image: HTMLImageElement) => image.decode());
  await atSection(page.locator("#family"));
  await expect(
    page.locator('#family a[href^="/deities/"]').first(),
  ).toBeVisible();
  await capture(page, "deity-family.png");
});

test("source version comparison", async ({ page }) => {
  await page.goto("/stories/osiris-myth");
  const versions = page.locator("#versions");
  await atSection(versions);
  await expect(
    versions.getByRole("list", { name: "Sources in chronological order" }),
  ).toBeVisible();
  await capture(page, "source-comparison.png");
});

test("source comparison evidence", async ({ page }) => {
  await page.goto("/stories/osiris-myth");
  const versions = page.locator("#versions");
  const evidence =
    page.viewportSize()!.width < 768
      ? versions.getByRole("article").first()
      : versions.getByRole("table");
  await atSection(evidence);
  await capture(page, "source-evidence.png");
});

test("family Connection chain", async ({ page }) => {
  await page.goto("/family-tree");
  await page.getByRole("button", { name: "Connection path view" }).click();
  await page.getByLabel("From figure", { exact: true }).selectOption("athena");
  await page.getByLabel("To figure", { exact: true }).selectOption("zeus");
  await expect(
    page.getByRole("list", { name: "Recorded connection chain" }),
  ).toContainText("Athena is child of Zeus");
  await atSection(
    page.getByRole("region", { name: "Find a recorded connection" }),
  );
  await capture(page, "family-connection.png");
});

test("journey selected stop reading", async ({ page }) => {
  await page.goto("/journeys/odyssey");
  const stop = page.getByRole("button", {
    name: "Go to stop 4: Island of the Cyclopes",
  });
  await stop.click();
  await expect(stop).toHaveAttribute("aria-pressed", "true");
  const reading = page.locator('[aria-live="polite"]').filter({
    has: page.getByRole("heading", {
      name: "Island of the Cyclopes",
      exact: true,
    }),
  });
  await atSection(reading);
  await expect(
    reading.getByRole("link", { name: /Read Odyssey · Book 9/ }),
  ).toBeVisible();
  await capture(page, "journey-reading.png");
});
