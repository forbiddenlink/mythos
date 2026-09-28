import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`failed local saves remain recoverable at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      const setItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (
          key === "mythos-atlas-bookmarks" &&
          this.getItem("test-storage-full") === "yes"
        ) {
          throw new DOMException("Storage full", "QuotaExceededError");
        }
        setItem.call(this, key, value);
      };
    });
    await page.goto("/deities/athena", { waitUntil: "domcontentloaded" });
    await page
      .getByRole("button", { name: /Switch to (light|dark) mode/ })
      .waitFor();
    await page.evaluate(() => localStorage.setItem("test-storage-full", "yes"));
    await page
      .getByRole("button", { name: "Add deity to bookmarks", exact: true })
      .click();
    const warning = page
      .getByRole("alert")
      .filter({ hasText: "could not be saved" });
    await expect(warning).toBeInViewport();
    await page.screenshot({
      path: testInfo.outputPath(`storage-failure-${width}.png`),
    });
    await page
      .getByRole("link", { name: "Download unsaved learning backup" })
      .click();
    const downloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download learning backup", exact: true })
      .click();
    const download = await downloadPromise;
    const backup = JSON.parse(await readFile((await download.path())!, "utf8"));
    expect(JSON.parse(backup.data["mythos-atlas-bookmarks"])).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "deity", id: "athena" }),
      ]),
    );
    await page.evaluate(() => localStorage.removeItem("test-storage-full"));
    await page
      .getByRole("button", { name: "Try saving again", exact: true })
      .click();
    await expect(warning).toHaveCount(0);
    await page.goto("/bookmarks", { waitUntil: "domcontentloaded" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(
      page.locator('main a[href="/deities/athena"]').first(),
    ).toBeVisible();
  });

  test(`review loading failure can be retried at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/deities/athena", { waitUntil: "domcontentloaded" });
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("mythos-atlas-progress") || "{}")
              .deitiesViewed || [],
        ),
      )
      .toContain("athena");
    let fail = true;
    let release!: () => void;
    const responseGate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/api/catalog/deities", async (route) => {
      if (fail) {
        await responseGate;
        await route.fulfill({
          status: 503,
          body: "{}",
          contentType: "application/json",
        });
      } else await route.continue();
    });
    await page.goto("/review", { waitUntil: "domcontentloaded" });
    await expect(page.locator("main").getByRole("status")).toContainText(
      "Loading your review cards",
    );
    release();
    const error = page.locator("main").getByRole("alert");
    await expect(error).toContainText("Review cards could not be loaded");
    await expect(
      page.getByRole("button", { name: "Start Review Session", exact: true }),
    ).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath(`review-failure-${width}.png`),
    });
    fail = false;
    await page
      .getByRole("button", { name: "Try loading again", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Start Review Session", exact: true })
      .click();
    await expect(page.getByText(/Card 1 of/)).toBeVisible();
  });
}
