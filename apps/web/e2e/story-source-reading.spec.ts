import { expect, test } from "@playwright/test";

test.describe("Story and source reading", () => {
  test.use({
    contextOptions: { reducedMotion: "reduce" },
    viewport: { width: 360, height: 800 },
  });

  test("keeps pantheon dates in their recorded era and offers direct browsing", async ({
    page,
  }) => {
    for (const [slug, period] of [
      ["aztec", "1300 CE – 1521 CE"],
      ["slavic", "500 CE – 1250 CE"],
      ["hindu", "From 1500 BCE; end date not recorded"],
    ]) {
      await page.goto(`/pantheons/${slug}`);
      await expect(
        page.locator("main").getByText(period, { exact: true }),
      ).toBeVisible();
      const navigation = page.locator("main").getByRole("navigation", {
        name: "On this page",
        exact: true,
      });
      for (const id of [
        "pantheon-about",
        "pantheon-figures",
        "pantheon-stories",
      ]) {
        await navigation.locator(`a[href="#${id}"]`).click();
        await expect(page.locator(`main #${id}`)).toBeInViewport();
      }
    }
  });

  test("puts the deity introduction before its portrait on mobile and links to reading sections", async ({
    page,
  }) => {
    await page.goto("/deities/athena");
    const title = page.getByRole("heading", {
      level: 1,
      name: "Athena",
      exact: true,
    });
    await expect(title).toBeInViewport();
    const portrait = page.getByRole("img", { name: "Athena", exact: true });
    const titleBox = await title.boundingBox();
    const portraitBox = await portrait.boundingBox();
    expect(titleBox).not.toBeNull();
    expect(portraitBox).not.toBeNull();
    expect(titleBox!.y).toBeLessThan(portraitBox!.y);
    const navigation = page.getByRole("navigation", {
      name: "On this page",
      exact: true,
    });
    await navigation
      .getByRole("link", { name: "About Athena", exact: true })
      .click();
    await expect(page.locator("#deity-about")).toBeInViewport();
    await navigation
      .getByRole("link", { name: "Sources and further reading", exact: true })
      .click();
    await expect(page.locator("#deity-sources")).toBeInViewport();
    await expect(
      page.getByText("Editorial illustration of Athena", { exact: true }),
    ).toHaveCount(1);
    await expect(
      page.getByText(/toggle to see the original language/),
    ).toHaveCount(0);
    await page.setViewportSize({ width: 1440, height: 1000 });
    const desktopTitle = await title.boundingBox();
    const desktopPortrait = await portrait.boundingBox();
    expect(desktopTitle).not.toBeNull();
    expect(desktopPortrait).not.toBeNull();
    expect(desktopPortrait!.x + desktopPortrait!.width).toBeLessThan(
      desktopTitle!.x,
    );
  });

  test("retains related figures, stories and museum objects after server rendering", async ({
    page,
  }) => {
    await page.goto("/stories/abduction-of-persephone");
    for (const href of [
      "/deities/persephone",
      "/deities/demeter",
      "/deities/hades",
      "/stories/orpheus-eurydice",
      "/stories/inanna-descent",
    ]) {
      await expect(
        page.locator(`main a[href="${href}"]`).first(),
      ).toBeVisible();
    }
    await page.goto("/stories/perseus-medusa");
    const objects = page.getByRole("region", { name: "The myth in art" });
    await expect(objects).toBeVisible();
    await expect(
      objects.locator('a[href*="metmuseum.org"]').first(),
    ).toBeVisible();
  });

  test("offers direct reading and one optional narration interface", async ({
    page,
  }) => {
    await page.goto("/stories/perseus-medusa");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Perseus and Medusa",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Read Aloud", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Play narration", exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("link", { name: "Read the story", exact: true })
      .click();
    await expect(page.locator("#story-narrative")).toBeInViewport();
    await page
      .getByText("Listen or change reading mode", { exact: true })
      .click();
    if (await page.evaluate(() => "speechSynthesis" in window)) {
      await expect(
        page.getByRole("button", { name: "Play narration", exact: true }),
      ).toHaveCount(1);
    } else {
      await expect(
        page.getByText("Text-to-speech is not supported in your browser."),
      ).toBeVisible();
    }
    await expect(
      page.getByRole("link", { name: "Cinematic reading", exact: true }),
    ).toHaveAttribute("href", "/stories/perseus-medusa/read");
    await page
      .getByRole("link", { name: "Sources and context", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Sources and context", exact: true }),
    ).toBeInViewport();
  });

  test("shows checked English passages on figures and their source records", async ({
    page,
  }) => {
    for (const [slug, source, opening] of [
      [
        "cronus",
        "theogony",
        "So he said: and vast Earth rejoiced greatly in spirit",
      ],
      ["gaia", "theogony", "My children, gotten of a sinful father"],
      ["hecate", "theogony", "And she conceived and bare Hecate"],
      ["ymir", "poetic-edda", "Out of Ymir's flesh was fashioned the earth"],
    ]) {
      for (const path of [`/deities/${slug}`, `/sources/${source}`]) {
        await page.goto(path);
        const excerpt = page
          .locator("main figure")
          .filter({ hasText: opening });
        await expect(excerpt).toHaveCount(1);
        await expect(
          excerpt.getByText("Direct quotation", { exact: true }),
        ).toBeVisible();
        await expect(excerpt.getByRole("button")).toHaveCount(0);
        await expect(
          excerpt.getByRole("link", { name: /Read source:/ }),
        ).toBeVisible();
      }
    }
    await page.goto("/deities/gaia");
    await expect(
      page.getByText(
        "For I bore and reared him, so that vengeance for his father's evil deeds might be worked upon him.",
        { exact: false },
      ),
    ).toHaveCount(0);
  });

  test("replaces disputed wording on both the entity and source record", async ({
    page,
  }) => {
    for (const path of ["/deities/ra", "/sources/book-of-the-dead"]) {
      await page.goto(path);
      await expect(
        page
          .getByText("Homage to thee, O thou glorious Being", { exact: false })
          .first(),
      ).toBeVisible();
      await expect(
        page.getByText(
          "Worship of Ra when he rises in the eastern horizon of heaven.",
          { exact: false },
        ),
      ).toHaveCount(0);
    }
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Book of the Dead",
        exact: true,
      }),
    ).toHaveCount(1);
    await expect(
      page.getByRole("link", { name: /Read Book of the Dead online/ }),
    ).toBeVisible();
  });
});

test("Osiris comparison exposes editions and preserves source differences", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/stories/osiris-myth");
  const matrix = page.locator(
    'section[aria-labelledby="version-matrix-title"]',
  );
  await expect(matrix).toContainText("Miriam Lichtheim translation (1976)");
  await expect(matrix).toContainText("Alan H. Gardiner translation (1931)");
  await expect(matrix).toContainText("C. H. Oldfather translation (1933)");
  await expect(matrix).toContainText("Frank Cole Babbitt translation (1936)");
  await expect(matrix.locator('a[href*="chesterbeatty.ie"]')).toHaveCount(1);
  await expect(matrix).toContainText(
    "The posthumous child is named Harpocrates",
  );
  await expect(matrix).toContainText(
    "Chapter 1.21 describes burial and divine honours, not rule over the dead.",
  );
  await expect(matrix.locator('a[href*="Diodorus_Siculus"]')).toHaveAttribute(
    "href",
    /#21$/,
  );
  await expect(matrix.locator('a[href*="Isis_and_Osiris"]')).toHaveAttribute(
    "href",
    /#13$/,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
