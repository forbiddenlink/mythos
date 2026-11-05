import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import deities from "../src/data/deities.json";
import { matchesDomainFilter } from "../src/lib/domain-categories";

async function correctOption(page: Page) {
  const group = page.getByRole("group", { name: /Which figure is linked to/ });
  await expect(group.getByRole("button")).toHaveCount(4);
  const prompt = await page.locator("#quick-quiz-question").innerText();
  const domain = prompt.match(/"([^"]+)"/)?.[1];
  expect(domain).toBeTruthy();
  const names = await group.getByRole("button").allTextContents();
  expect(new Set(names).size).toBe(4);
  const valid = names.filter((name) =>
    deities.some(
      (deity) =>
        deity.name.trim() === name.trim() &&
        matchesDomainFilter(deity.domain, domain!),
    ),
  );
  expect(valid).toHaveLength(1);
  return group.getByRole("button", { name: valid[0].trim(), exact: true });
}

test.describe("Quick Quiz readable answers", () => {
  test.use({ reducedMotion: "reduce" });

  for (const width of [320, 390, 1440]) {
    for (const theme of ["light", "dark"]) {
      test(`${width}px ${theme}: unambiguous options, accessible layout and feedback`, async ({
        page,
      }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.addInitScript(
          (value) => localStorage.setItem("theme", value),
          theme,
        );
        // Let native rendering and axe timers run without expiring the round.
        await page.clock.setFixedTime(new Date("2026-11-05T12:00:00Z"));
        await page.goto("/quiz/quick");
        await page.getByRole("button", { name: "Start Quiz" }).click();
        const answer = await correctOption(page);
        const group = page.getByRole("group", { name: /Which figure/ });
        const sizes = await group.getByRole("button").evaluateAll((buttons) =>
          buttons.map((button) => ({
            height: button.getBoundingClientRect().height,
            overflow: button.scrollWidth - button.clientWidth,
          })),
        );
        expect(
          sizes.every((size) => size.height >= 44 && size.overflow <= 1),
        ).toBe(true);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const scan = await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(scan.violations).toEqual([]);
        await testInfo.attach("active-quiz", {
          body: await page.screenshot({ fullPage: true }),
          contentType: "image/png",
        });
        await answer.click();
        await expect(page.getByRole("main").getByRole("status")).toContainText(
          "Correct.",
        );
        await expect(group.getByRole("button").first()).toBeDisabled();
      });
    }
  }
});

test("Quick Quiz expires after a suspended minute and restarts cleanly", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/quiz/quick");
  await page.getByRole("button", { name: "Start Quiz" }).click();
  await (await correctOption(page)).click();
  // Simulate returning from an inactive tab: only one overdue tick fires.
  await page.clock.fastForward(60_000);
  await expect(page.getByText("Time's Up!", { exact: true })).toBeVisible();
  await expect(
    page.getByText("New High Score!", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Play Again" }).click();
  await expect(page.getByText("60s", { exact: true })).toBeVisible();
  await expect(
    page
      .getByRole("group", { name: /Which figure/ })
      .getByRole("button")
      .first(),
  ).toBeEnabled();
  await page.clock.fastForward(60_000);
  await expect(page.getByText("Time's Up!", { exact: true })).toBeVisible();
  await expect(page.getByText("New High Score!", { exact: true })).toHaveCount(
    0,
  );
});

test("teacher shortcuts reach their sections at phone width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/teachers");
  for (const name of ["Classroom tools", "Study guides", "Worksheets"]) {
    await page
      .getByRole("navigation", { name: "Classroom resources" })
      .getByRole("link", { name, exact: true })
      .click();
    const id = new URL(page.url()).hash.slice(1);
    await expect(page.locator(`#${id}`)).toBeInViewport();
    await expect
      .poll(() =>
        page
          .locator(`#${id}`)
          .evaluate((element) => element.getBoundingClientRect().top),
      )
      .toBeGreaterThanOrEqual(64);
  }
});

test("Quick Quiz offers manual score sharing when browser APIs fail", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.clock.install();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException("Denied", "NotAllowedError");
        },
      },
    });
  });
  await page.goto("/quiz/quick");
  await page.getByRole("button", { name: "Start Quiz" }).click();
  await page.clock.fastForward(60_000);
  await page.getByRole("button", { name: "Share Score" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Select and copy your score",
  );
  const text = page.getByRole("textbox", { name: "Score to copy manually" });
  await expect(text).toHaveValue(/I scored 0[\s\S]*\/quiz\/quick$/);
  await expect(text).toBeFocused();
  await expect(text).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("source cards follow the page heading and the catch-all label is accurate", async ({
  page,
}) => {
  await page.goto("/sources");
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator("main h2").first()).toBeVisible();
  await expect(page.locator("main h3")).toHaveCount(0);
  await page.getByRole("button", { name: /Other works & scholarship/ }).click();
  await expect(page.locator("main h2").first()).toBeVisible();
});
