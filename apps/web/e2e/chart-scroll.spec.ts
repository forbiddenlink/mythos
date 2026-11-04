import { expect, test, type Page } from "@playwright/test";

// The timeline and the atlas stage are most of the viewport. A plain wheel
// over them must scroll the page, not get swallowed as a zoom.
async function wheelScrollsPage(page: Page, selector: string): Promise<void> {
  const target = page.locator(selector).first();
  await expect(target).toBeVisible({ timeout: 20000 });
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) throw new Error(`${selector} has no box`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const scrollY = () => page.evaluate(() => window.scrollY);
  // Both directions: at minimum zoom a chart may pass a scroll-down through
  // but still swallow a scroll-up as a zoom-in.
  const top = await scrollY();
  await page.mouse.wheel(0, 300);
  await expect.poll(scrollY).toBeGreaterThan(top);
  const bottom = await scrollY();
  await page.mouse.wheel(0, -200);
  await expect.poll(scrollY).toBeLessThan(bottom);
}

test.describe("charts do not trap page scrolling", () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  // Both pages load a heavy client chart (D3, three.js) before it can be used.
  test.describe.configure({ timeout: 60000 });

  test("timeline: wheel scrolls the page and the buttons zoom", async ({
    page,
  }) => {
    await page.goto("/timeline");
    const svg = "main svg:has(.tick)";
    await wheelScrollsPage(page, svg);

    const firstTick = page.locator(`${svg} .tick text`).first();
    const before = await firstTick.textContent();
    await page.getByRole("button", { name: "Zoom in", exact: true }).click();
    await expect(firstTick).not.toHaveText(before ?? "");
    await page
      .getByRole("button", { name: "Reset timeline zoom", exact: true })
      .click();
    await expect(firstTick).toHaveText(before ?? "");
  });

  test("atlas: wheel over the star map scrolls the page", async ({ page }) => {
    await page.goto("/atlas");
    await wheelScrollsPage(page, "main canvas");
  });
});
