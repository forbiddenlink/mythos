import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

// Pull-request smoke: axe, enlarged-text reflow and console cleanliness on
// the home page and one route per template family. Chromium only, no pixel
// baselines, so it passes on Linux CI as it does locally.
const routes = [
  "/",
  "/deities",
  "/deities/viracocha",
  "/locations/pachacamac-sanctuary",
  "/artifacts",
];

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Footer controls fade in once hydrated; axe must not sample mid-transition.
const settle = async (page: Page) => {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await expect(
    page.getByRole("button", { name: "Ambient audio" }),
  ).toBeEnabled();
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
};

// Vercel's analytics scripts only exist on Vercel; locally they 404.
const isHostingOnly = (text: string) => text.includes("/_vercel/");

for (const route of routes) {
  test.describe(`smoke ${route}`, () => {
    test("has no axe violations and no console errors", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => {
        if (
          m.type() === "error" &&
          !isHostingOnly(m.location().url) &&
          !isHostingOnly(m.text())
        ) {
          errors.push(m.text());
        }
      });
      page.on("response", (r) => {
        if (r.status() >= 400 && !isHostingOnly(r.url())) {
          errors.push(`${r.status()} ${r.url()}`);
        }
      });

      await page.goto(route);
      await settle(page);
      // Leaflet pins on the location map overlap each other and fail axe
      // target-size (WCAG 2.5.8). Known gap, tracked outside this smoke, so
      // the pin overlay is excluded rather than the rule disabled.
      const result = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .exclude(".leaflet-marker-icon")
        .analyze();
      expect(result.violations).toEqual([]);
      expect(errors).toEqual([]);
    });

    test("reflows at 390px with 200% text", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      await settle(page);
      const overflow = await page.evaluate(() => {
        const root = document.documentElement;
        const clipped = [
          ...document.querySelectorAll(
            "button, a, input:not([tabindex='-1']), select",
          ),
        ]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1);
          })
          .map((el) => el.outerHTML.slice(0, 80));
        return { wide: root.scrollWidth > innerWidth, clipped };
      });
      expect(overflow).toEqual({ wide: false, clipped: [] });
    });
  });
}
