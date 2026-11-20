import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import museumObjects from "../src/data/museum-objects.json";

const shivaImage = museumObjects.find((object) => object.id === "met-39328")?.imageUrl;
if (!shivaImage) throw new Error("Missing Shiva museum image fixture");

test("homepage reuses the high-priority sky artwork preload", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    const { pathname } = new URL(request.url());
    if (
      pathname === "/hero-star-chart.webp" ||
      pathname === "/hero-star-chart-800.webp"
    ) {
      requests.push(request.url());
    }
  });
  await page.goto("/", { waitUntil: "networkidle" });
  // Two media-gated preloads, one element each: the 800px copy below lg, the original from lg up.
  await expect(
    page.locator('link[rel="preload"][href^="/hero-star-chart"]'),
  ).toHaveCount(2);
  const used = new URL(requests[0] ?? "http://x/").pathname;
  // The DOM property normalizes the bare crossorigin attribute to "anonymous".
  const preloadLink = page.locator(`link[rel="preload"][href="${used}"]`);
  await expect(preloadLink).toHaveCount(1);
  expect(
    await preloadLink.evaluate((link) => (link as HTMLLinkElement).crossOrigin),
  ).toBe("anonymous");
  expect(requests).toHaveLength(1);
});

test("homepage font preloads share the CSS font URL without duplicate downloads", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.endsWith(".woff2")) {
      requests.push(request.url());
    }
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const preloads = await page
    .locator('link[rel="preload"][as="font"]')
    .evaluateAll((links) =>
      links.map((link) => (link as HTMLLinkElement).href),
    );
  expect(preloads.length).toBeGreaterThan(0);
  for (const preload of new Set(preloads)) {
    const fontRequests = requests.filter(
      (url) => new URL(url).pathname === new URL(preload).pathname,
    );
    expect(fontRequests).toEqual([preload]);
  }
});

for (const width of [390, 1440]) {
  test.describe(`artifact inspection at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    test("fits the whole artwork before zooming and resets the scrollable view", async ({
      page,
    }) => {
      await page.route(shivaImage, (route) =>
        route.fulfill({
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="800"><rect width="400" height="800" fill="silver"/></svg>',
        }),
      );
      await page.goto("/deities/shiva");
      await page
        .getByRole("button", {
          name: "Inspect artwork: Shiva as Lord of Dance (Nataraja)",
          exact: true,
        })
        .click();
      const dialog = page.getByRole("dialog");
      const image = dialog.getByRole("img");
      await expect
        .poll(() =>
          image.evaluate((element: HTMLImageElement) => element.naturalWidth),
        )
        .toBe(400);
      await expect(image).toHaveCSS("object-fit", "contain");
      const viewport = dialog.getByRole("region");
      const dimensions = () =>
        viewport.evaluate((element) => ({
          width: element.clientWidth,
          height: element.clientHeight,
          scrollWidth: element.scrollWidth,
          scrollHeight: element.scrollHeight,
        }));
      const fitted = await dimensions();
      expect(fitted.scrollWidth).toBe(fitted.width);
      expect(fitted.scrollHeight).toBe(fitted.height);
      await dialog.getByRole("button", { name: "Zoom in" }).click();
      await expect(dialog.getByRole("status")).toHaveText("150%");
      await expect
        .poll(async () => {
          const current = await dimensions();
          return current.scrollWidth > current.width;
        })
        .toBe(true);
      const zoomed = await dimensions();
      expect(zoomed.scrollWidth).toBeGreaterThan(zoomed.width);
      expect(zoomed.scrollHeight).toBeGreaterThan(zoomed.height);
      await viewport.evaluate((element) => {
        element.scrollTop = 100;
        element.scrollLeft = 100;
      });
      await dialog.getByRole("button", { name: "Reset zoom" }).click();
      await expect
        .poll(() =>
          viewport.evaluate(
            (element) => element.scrollTop + element.scrollLeft,
          ),
        )
        .toBe(0);
      await expect.poll(dimensions).toEqual(fitted);
    });
    test("offers documented details, zoom, keyboard exit and image recovery", async ({
      page,
    }) => {
      // This deliberately exercises unavailable museum media, not live services.
      await page.route(shivaImage, (route) =>
        route.abort(),
      );
      await page.goto("/deities/shiva");
      const trigger = page.getByRole("button", {
        name: "Inspect artwork: Shiva as Lord of Dance (Nataraja)",
        exact: true,
      });
      await trigger.click();
      const dialog = page.getByRole("dialog", {
        name: "Shiva as Lord of Dance (Nataraja)",
        exact: true,
      });
      await expect(dialog).toBeVisible();
      await dialog
        .getByRole("button", { name: "Hand drum", exact: true })
        .click();
      await expect(dialog.getByText(/first sounds of creation/)).toBeVisible();
      await expect(dialog.getByRole("alert")).toContainText(
        "image could not be loaded",
      );
      await expect(
        dialog.getByRole("link", { name: /Open museum record/ }),
      ).toHaveAttribute(
        "href",
        "https://www.metmuseum.org/art/collection/search/39328",
      );
      const axe = await new AxeBuilder({ page })
        .include('[role="dialog"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(axe.violations).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
    });
  });
}

test("connection explorer names directed relationships and their attached passages", async ({
  page,
}) => {
  await page.goto("/family-tree");
  await page.getByRole("button", { name: "Connection path view" }).click();
  await page.getByLabel("From figure", { exact: true }).selectOption("zeus");
  await page.getByLabel("To figure", { exact: true }).selectOption("athena");
  const chain = page.getByRole("list", { name: "Recorded connection chain" });
  await expect(chain).toContainText("Zeus is parent of Athena");
  await expect(chain).toContainText("Theogony");
  await expect(
    chain.getByRole("link", { name: "Read passage" }),
  ).toHaveAttribute("href", /^https:\/\//);
  await page.getByLabel("From figure", { exact: true }).selectOption("athena");
  await page.getByLabel("To figure", { exact: true }).selectOption("zeus");
  await expect(chain).toContainText("Athena is child of Zeus");
});

test("family answers expand with keyboard without repeating them above the fold", async ({
  page,
}) => {
  await page.goto("/deities/zeus");
  const summary = page
    .locator("summary")
    .filter({ hasText: "Questions about Zeus" });
  await summary.focus();
  await expect(summary.locator("..")).not.toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(summary.locator("..")).toHaveAttribute("open", "");
  await expect(
    page.getByText("Who are Zeus's parents?", { exact: true }),
  ).toBeVisible();
});

for (const width of [375, 390]) {
  test.describe(`mobile header at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 } });
    test("keeps the wordmark visible beside 44px header buttons", async ({
      page,
    }) => {
      await page.goto("/");
      const header = page.locator("header").first();
      const wordmark = header.getByText("Mythos Atlas", { exact: true });
      await expect(wordmark).toBeVisible();
      // Playwright counts a clipped box as visible, so compare the text box
      // with the box that clips it: a wrapped wordmark sits below that box.
      const clipped = await wordmark.evaluate((element) => {
        const text = element.getBoundingClientRect();
        const clip = element.parentElement?.getBoundingClientRect();
        if (!clip) return true;
        return (
          text.top < clip.top - 0.5 ||
          text.bottom > clip.bottom + 0.5 ||
          text.right > clip.right + 0.5 ||
          text.right > innerWidth
        );
      });
      expect(clipped).toBe(false);
      const buttons = header.getByRole("button");
      const count = await buttons.count();
      expect(count).toBeGreaterThan(2);
      for (let index = 0; index < count; index += 1) {
        const button = buttons.nth(index);
        if (!(await button.isVisible())) continue;
        const box = await button.boundingBox();
        expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      }
    });
  });
}
