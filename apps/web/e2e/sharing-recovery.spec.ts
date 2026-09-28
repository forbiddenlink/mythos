import { expect, test } from "@playwright/test";

for (const width of [1440, 390, 320]) {
  test(`clipboard failure offers a real recovery at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async () => {
            throw new DOMException("Denied", "NotAllowedError");
          },
        },
      });
      document.execCommand = () => false;
    });
    await page.goto("/deities/athena", { waitUntil: "domcontentloaded" });
    await page
      .getByRole("button", { name: /Switch to (light|dark) mode/ })
      .waitFor();
    const share = page
      .locator("main")
      .getByRole("button", { name: "Share", exact: true })
      .first();
    await share.click();
    const copyBounds = await page
      .getByRole("button", { name: "Copy Link", exact: true })
      .boundingBox();
    expect(copyBounds!.x).toBeGreaterThanOrEqual(0);
    expect(copyBounds!.x + copyBounds!.width).toBeLessThanOrEqual(width);
    await page.getByRole("button", { name: "Copy Link", exact: true }).click();
    await expect(page.getByText("Link Copied!", { exact: true })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("alert").filter({ hasText: "Copy failed" }),
    ).toContainText("Copy failed");
    await expect(
      page.getByRole("textbox", { name: "Link to copy manually" }),
    ).toHaveValue(/\/deities\/athena$/);
    await expect(
      page.getByRole("textbox", { name: "Link to copy manually" }),
    ).toBeInViewport();
    await page.screenshot({
      path: testInfo.outputPath(`share-recovery-${width}.png`),
    });
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Copy Link", exact: true }),
    ).toHaveCount(0);
    await expect(share).toBeFocused();
  });
}

for (const method of ["clipboard", "legacy"] as const) {
  test(`successful ${method} copying reports success`, async ({ page }) => {
    await page.addInitScript((mode) => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            if (mode === "legacy")
              throw new DOMException("Denied", "NotAllowedError");
            document.documentElement.dataset.copiedLink = value;
          },
        },
      });
      document.execCommand = () => {
        const text = document.querySelector("textarea");
        document.documentElement.dataset.copiedLink = text?.value;
        return true;
      };
    }, method);
    await page.goto("/deities/athena", { waitUntil: "domcontentloaded" });
    await page
      .getByRole("button", { name: /Switch to (light|dark) mode/ })
      .waitFor();
    await page
      .locator("main")
      .getByRole("button", { name: "Share", exact: true })
      .first()
      .click();
    await page.getByRole("button", { name: "Copy Link", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Link Copied!", exact: true }),
    ).toBeVisible();
    expect(await page.locator("html").getAttribute("data-copied-link")).toMatch(
      /\/deities\/athena$/,
    );
    await expect(
      page.getByRole("textbox", { name: "Link to copy manually" }),
    ).toHaveCount(0);
  });
}
