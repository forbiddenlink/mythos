import { expect, test } from "@playwright/test";

test.describe("Detail-page reading", () => {
  test.use({ viewport: { width: 320, height: 800 } });

  test("published entries contain no internal invention instructions", async ({
    page,
  }) => {
    test.setTimeout(60000);
    for (const path of [
      "/deities/loki",
      "/deities/fujin",
      "/deities/hou-yi",
      "/deities/tiamat",
      "/deities/tawhirimatea",
      "/artifacts/hofud",
      "/artifacts/oshe-of-shango",
      "/artifacts/macuahuitl-of-huitzilopochtli",
      "/locations/muspelheim",
      "/locations/alfheim",
      "/locations/varanasi",
      "/locations/ise-grand-shrine",
      "/locations/hawaiki",
      "/locations/mauna-kea",
      "/locations/te-reinga",
      "/locations/oyo",
      "/locations/igbo-orun",
      "/locations/samothrace",
      "/locations/palenque",
    ]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("main h1")).toHaveCount(1);
      await expect(page.locator("main")).not.toContainText(
        /(?:^|[.;]\s+)do not invent\b/i,
      );
    }
  });

  for (const [path, name] of [
    ["/heroes/heracles", "Heracles"],
    ["/creatures/cerberus", "Cerberus"],
    ["/artifacts/mjolnir", "Mjolnir"],
    ["/locations/mount-olympus", "Mount Olympus"],
  ]) {
    test(`${path} offers direct reading and honest source references`, async ({
      page,
    }) => {
      await page.goto(path);
      const main = page.locator("main");
      await expect(main.getByRole("heading", { level: 1 })).toContainText(name);
      const navigation = main.getByRole("navigation", { name: "On this page" });
      await navigation.getByRole("link", { name: `About ${name}` }).click();
      await expect(main.locator("#about")).toBeInViewport();
      await navigation.getByRole("link", { name: "Source notes" }).click();
      await expect(
        main.getByRole("heading", { name: "Source notes", exact: true }),
      ).toBeInViewport();
      await expect(main.locator("#source-notes blockquote")).toHaveCount(0);
      await expect(main.locator("#source-notes")).toContainText(
        "quotations are not displayed",
      );
      if (path === "/heroes/heracles") {
        await expect(
          main.getByText("Bronze statuette of Herakles", { exact: true }),
        ).toBeVisible();
        await expect(
          main.locator(
            'a[href="https://www.metmuseum.org/art/collection/search/246432"]',
          ),
        ).toBeVisible();
        await expect(
          main.getByText("Editorial illustration of Heracles"),
        ).toHaveCount(0);
      } else {
        await expect(
          main.getByText(`Editorial illustration of ${name}`, { exact: true }),
        ).toBeVisible();
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    });
  }

  test("African collection distinguishes traditions and avoids a shared origin date", async ({
    page,
  }) => {
    await page.goto("/pantheons/african");
    const main = page.locator("main");
    await expect(main.getByRole("heading", { level: 1 })).toHaveText(
      "African Traditions",
    );
    await expect(
      main.getByText("Dates not recorded", { exact: true }),
    ).toBeVisible();
    await expect(
      main.getByRole("heading", { name: "Akan storytelling" }),
    ).toBeVisible();
    await expect(
      main.getByRole("heading", { name: "Yoruba traditions" }),
    ).toBeVisible();
    await page.goto("/deities/anansi");
    await expect(page.locator("main")).not.toContainText(
      "African Pantheon (Yoruba)",
    );
    await expect(page.locator("main")).toContainText("Akan Tradition");
    await expect(page.locator("main")).not.toContainText("African Traditions");
    await page.goto("/deities/oshun");
    await expect(page.locator("main")).toContainText(
      "Temples, festivals, and practices recorded for Oshun",
    );
    await expect(page.locator("main")).not.toContainText(
      "was venerated in ancient times",
    );
  });

  test("timeline separates collections without a shared period", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/timeline");
    await expect(page.locator(".row-label").last()).toContainText(
      "African Traditions",
    );
    await expect(
      page.getByText("No shared period recorded", { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator(".pantheon-group").last().locator("rect"),
    ).toHaveCount(0);
  });

  test("replacement passages identify their English editions on article and source pages", async ({
    page,
  }) => {
    for (const [article, source, opening] of [
      [
        "deities/ra",
        "book-of-the-dead",
        "Homage to thee, O thou glorious Being",
      ],
      [
        "deities/anubis",
        "book-of-the-dead",
        "Anubis, who dwelleth in the region of the embalmed",
      ],
      ["deities/osiris", "pyramid-texts", "Adoration to thee, O Osiris"],
      ["stories/ramayana", "ramayana", "He laid it on the twisted cord"],
      [
        "stories/mahabharata",
        "mahabharata",
        "Discriminating then between righteousness",
      ],
    ]) {
      for (const path of [`/${article}`, `/sources/${source}`]) {
        await page.goto(path);
        const excerpt = page
          .locator("main figure")
          .filter({ hasText: opening });
        await expect(excerpt).toHaveCount(1);
        await expect(excerpt).toContainText("Direct quotation");
        await expect(excerpt).toContainText(
          "no original-language text is supplied",
        );
        await expect(excerpt.getByRole("button")).toHaveCount(0);
        await expect(
          excerpt.getByRole("link", { name: /Read source:/ }),
        ).toBeVisible();
      }
    }
  });
});

test("discovery offers a thematic route on desktop and mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/heroes/heracles");
  const discover = page.getByRole("button", { name: "Discover", exact: true });
  await discover.focus();
  await expect(discover).toHaveAttribute("aria-expanded", "true");
  const collection = page.locator('header a[href="/collections"]');
  await expect(collection).toContainText("Follow a theme across traditions");
  await collection.click();
  await expect(page).toHaveURL(/\/collections$/);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.getByRole("button", { name: "Open Menu", exact: true }).click();
  await page.getByRole("button", { name: "Discover", exact: true }).click();
  const region = page.getByRole("region", { name: "Discover", exact: true });
  await expect(region.getByRole("link").first()).toHaveAttribute(
    "href",
    "/collections",
  );
  await region.locator('a[href="/journeys"]').click();
  await expect(page).toHaveURL(/\/journeys$/);
  await expect(
    page.getByRole("button", { name: "Open Menu", exact: true }),
  ).toBeVisible();
});

test("desktop discovery keeps its last destination reachable on short screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 400 });
  await page.goto("/heroes/heracles");
  await page.getByRole("button", { name: "Discover", exact: true }).focus();
  const oracle = page.locator('header a[href="/oracle"]');
  await oracle.focus();
  await expect(oracle).toBeInViewport({ ratio: 1 });
  await oracle.press("Enter");
  await expect(page).toHaveURL(/\/oracle$/);
});
