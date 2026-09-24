import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Uses baseURL from playwright.config.ts (http://localhost:3000)

const pagesToTest = [
  { path: "/", name: "Homepage" },
  { path: "/deities", name: "Deities" },
  { path: "/pantheons", name: "Pantheons" },
  { path: "/stories", name: "Stories" },
  { path: "/quiz", name: "Quiz Hub" },
  { path: "/achievements", name: "Achievements" },
  { path: "/compare", name: "Compare" },
  { path: "/learning-paths", name: "Learning Paths" },
  { path: "/collections", name: "Collections" },
  { path: "/facts", name: "Facts" },
];

test.describe("Accessibility", () => {
  for (const page of pagesToTest) {
    test(`${page.name} page should not have critical accessibility violations`, async ({
      page: playwrightPage,
    }) => {
      await playwrightPage.goto(page.path);

      // Wait for page to load
      await playwrightPage.waitForLoadState("domcontentloaded");
      await expect(playwrightPage.locator("body")).toBeVisible({
        timeout: 10000,
      });

      const accessibilityScanResults = await new AxeBuilder({
        page: playwrightPage,
      })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      // Log violations for debugging
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`\n=== ${page.name} Violations ===`);
        for (const violation of accessibilityScanResults.violations) {
          console.log(
            `\n[${violation.impact}] ${violation.id}: ${violation.description}`,
          );
          console.log(`  Help: ${violation.helpUrl}`);
          for (const node of violation.nodes.slice(0, 3)) {
            console.log(`  - ${node.html.substring(0, 100)}`);
          }
        }
      }

      // Filter for serious/critical violations only
      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );

      expect(criticalViolations).toEqual([]);
    });
  }
});

test.describe("Reading pages at narrow widths", () => {
  test.use({
    viewport: { width: 320, height: 800 },
    contextOptions: { reducedMotion: "reduce" },
  });

  for (const theme of ["light", "dark"]) {
    for (const path of [
      "/atlas",
      "/pantheons/greek",
      "/stories/osiris-myth",
      "/stories/inanna-descent",
      "/deities/zeus",
      "/deities/hades",
      "/deities/gaia",
      "/stories/first-twins-ibeji",
      "/sources/iliad",
    ]) {
      test(`${path} remains accessible in ${theme} mode`, async ({ page }) => {
        await page.addInitScript(
          (value) => localStorage.setItem("theme", value),
          theme,
        );
        await page.goto(path);
        await expect(
          page.getByRole("button", {
            name: `Switch to ${theme === "light" ? "dark" : "light"} mode`,
          }),
        ).toBeVisible();
        await page.evaluate(() => document.fonts.ready.then(() => undefined));
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(
          page.locator("a a, a button, button a, button button"),
        ).toHaveCount(0);
        await expect
          .poll(() =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          )
          .toBe(true);

        const provenance = page.getByRole("complementary", {
          name: "Catalogued sources",
        });
        if (await provenance.count()) await provenance.scrollIntoViewIfNeeded();
        if (path === "/deities/hades") {
          await expect(
            page.getByRole("heading", { name: "Source Notes" }),
          ).toBeVisible();
          await expect(page.locator("main blockquote")).toHaveCount(0);
        }
        if (path === "/sources/iliad") {
          await expect(
            page.getByRole("link", { name: "Featured in Zeus →" }),
          ).toBeVisible();
          await expect(
            page.getByRole("link", { name: "Featured in The Trojan War →" }),
          ).toBeVisible();
          await expect(
            page.getByText("Direct quotation", { exact: true }),
          ).toHaveCount(3);
          await expect(page.locator("main [lang=el]")).toHaveCount(0);
        }
        const result = await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        expect(result.violations).toEqual([]);
      });
    }
  }
});
