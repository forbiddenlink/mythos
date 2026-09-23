import { expect, test } from "@playwright/test";

test.describe("Cinematic reading with reduced motion", () => {
  test.use({
    contextOptions: { reducedMotion: "reduce" },
    viewport: { width: 320, height: 800 },
  });

  test("renders the title and narrative after hydration", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await page.goto("/stories/perseus-medusa/read");
    const title = page.getByRole("heading", {
      level: 1,
      name: "Perseus and Medusa",
      exact: true,
    });
    await expect(title).toBeVisible();
    // Visibility assertions alone permit opacity: 0 on an ancestor.
    await expect(title.locator("..")).toHaveCSS("opacity", "1");
    const firstPlate = page.locator("article").first();
    await firstPlate.scrollIntoViewIfNeeded();
    await expect(firstPlate).toHaveCSS("opacity", "1");
    await expect(firstPlate).not.toHaveText("");
    await page.evaluate(async () => {
      for (
        let y = 0;
        y < document.documentElement.scrollHeight;
        y += innerHeight
      ) {
        scrollTo(0, y);
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      scrollTo(0, 0);
    });
    await expect(title.locator("..")).toHaveCSS("opacity", "1");
  });
});
