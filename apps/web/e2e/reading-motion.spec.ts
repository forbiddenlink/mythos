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

test.describe("Cinematic story server content", () => {
  for (const slug of ["ragnarok", "titanomachy"]) {
    test(`${slug} includes title and scenes in server HTML`, async ({
      request,
    }) => {
      const response = await request.get(`/stories/${slug}/cinematic`);
      expect(response.ok()).toBe(true);
      const html = await response.text();
      // Match HTML elements, not story strings carried in the React payload.
      expect(html).toMatch(/<h1[^>]*>[^<]+<\/h1>/);
      expect((html.match(/id="scene-/g) || []).length).toBeGreaterThan(1);
    });
  }
});

test("cinematic text stays visible and image motion stops when the preference changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/stories/ragnarok/cinematic");
  const scene = page.locator("#scene-portents");
  await scene.scrollIntoViewIfNeeded();
  await expect(scene.locator("h2")).toHaveCSS("opacity", "1");
  await expect(scene.locator(".text-center")).toHaveCSS("opacity", "1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const imageFrame = scene.locator("img").locator("..");
  await expect(imageFrame).toHaveCSS("transform", "none");
  await expect(scene.locator("h2")).toHaveCSS("transform", "none");
  await expect(scene.locator(".prose p")).toBeVisible();
});

for (const slug of ["ragnarok", "titanomachy"]) {
  test(`${slug} story navigation does not cover the main header`, async ({
    page,
  }) => {
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`/stories/${slug}/cinematic`);
      const header = page.getByRole("banner");
      const storyNav = page.getByRole("navigation", {
        name: "Story navigation",
      });
      for (const scrollY of [0, 1000]) {
        await page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await expect
          .poll(async () => {
            const main = await header.boundingBox();
            const story = await storyNav.boundingBox();
            return Boolean(
              main && story && story.y >= main.y + main.height - 1,
            );
          })
          .toBe(true);
      }
    }
  });
}
