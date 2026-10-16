import { test, expect } from "@playwright/test";

for (const width of [320, 768, 1440]) {
  for (const theme of ["light", "dark"]) {
    test(`home scroll stays in the document at ${width}px in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.addInitScript(
        (value) => localStorage.setItem("theme", value),
        theme,
      );
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("/", { waitUntil: "domcontentloaded" });
      const hero = page.getByRole("region", {
        name: "Mythos Atlas",
        exact: true,
      });
      await expect(hero.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(
        hero.getByRole("link", { name: "Explore the pantheons" }),
      ).toBeVisible();
      await expect(
        hero.getByRole("link", { name: "Read a myth", exact: true }),
      ).toBeVisible();
      const initialTop = (await hero.boundingBox())!.y;
      await page.mouse.move(width / 2, 500);
      for (let step = 0; step < 4; step++) {
        const before = await page.evaluate(() => window.scrollY);
        await page.mouse.wheel(0, 250);
        await expect
          .poll(() => page.evaluate(() => window.scrollY))
          .toBeGreaterThan(before + 200);
      }
      const scrolled = await page.evaluate(() => window.scrollY);
      expect(
        Math.abs((await hero.boundingBox())!.y - (initialTop - scrolled)),
      ).toBeLessThan(3);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}

test("optional tools wait for intent and discovery supports keyboard dismissal", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("button", { name: "Unmute Ambient Audio" }),
  ).toHaveCount(0);
  const discovery = page.getByRole("button", {
    name: "Discover a random deity",
  });
  await discovery.scrollIntoViewIfNeeded();
  expect(
    await discovery.evaluate((el) => getComputedStyle(el).position),
  ).not.toBe("fixed");
  await discovery.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(discovery).toBeFocused();
  await page
    .getByRole("button", { name: "Ambient audio", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Unmute Ambient Audio" }),
  ).toBeVisible();
  await expect(
    page.getByRole("slider", { name: "Ambient audio volume" }),
  ).toBeVisible();
});

test("home links are available with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const hero = page.getByRole("region", { name: "Mythos Atlas", exact: true });
  await hero.getByRole("link", { name: "Read a myth", exact: true }).click();
  await expect(page).toHaveURL(/\/stories$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("home offers image-led entry to featured traditions", async ({ page }) => {
  await page.goto("/");
  const traditions = page.getByRole("region", { name: "Featured pantheons" });
  await expect(traditions).toBeVisible();
  for (const slug of ["greek", "norse", "egyptian", "hindu", "japanese"]) {
    const link = traditions.locator(`a[href="/pantheons/${slug}"]`);
    await link.scrollIntoViewIfNeeded();
    await expect(link).toBeVisible();
    await expect
      .poll(() =>
        link
          .locator("img")
          .evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
      )
      .toBe(true);
  }
});

test("home frontispiece identifies its real artwork and museum source", async ({
  page,
}) => {
  await page.goto("/");
  const hero = page.getByRole("region", { name: "Mythos Atlas", exact: true });
  const artwork = hero.getByRole("img", {
    name: /Bronze figure of Shiva as Nataraja/,
  });
  await expect(artwork).toBeVisible();
  await expect
    .poll(() =>
      artwork.evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
    )
    .toBe(true);
  await expect(
    hero.getByRole("link", {
      name: "The Metropolitan Museum of Art",
      exact: true,
    }),
  ).toHaveAttribute(
    "href",
    "https://www.metmuseum.org/art/collection/search/39328",
  );
  await expect(
    hero.getByText("Shiva as Lord of Dance (Nataraja)", { exact: true }),
  ).toBeVisible();
  await expect(
    hero
      .getByRole("navigation", { name: "Index of traditions" })
      .locator("ol a"),
  ).toHaveCount(6);
  await expect(
    hero.getByRole("link", { name: "All 26 traditions" }),
  ).toHaveAttribute("href", "/pantheons");
});

for (const width of [320, 1440]) {
  for (const route of ["/", "/collections/underworld-rulers"]) {
    test(`museum thumbnails preserve sources and reflow at ${width}px on ${route}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const section =
        route === "/"
          ? page.getByRole("region", { name: "Compare figures and traditions" })
          : page.getByRole("region", {
              name: "Rulers of the Dead across pantheons",
            });
      const object = section.locator("img.object-contain").first();
      await object.scrollIntoViewIfNeeded();
      await expect(object).toBeVisible();
      await expect
        .poll(() =>
          object.evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
        )
        .toBe(true);
      const item = object.locator("xpath=ancestor::li[1]");
      await expect(item.locator("a[title]")).toHaveAttribute(
        "href",
        /^https:\/\//,
      );
      const entry = item.locator('a[href^="/deities/"]');
      await expect(entry).toHaveCount(1);
      await expect(section.locator("a a")).toHaveCount(0);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await entry.click();
      await expect(page).toHaveURL(/\/deities\//);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }
}
