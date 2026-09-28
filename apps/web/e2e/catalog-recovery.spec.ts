import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function waitForHydration(page: Page): Promise<void> {
  await expect(
    page.getByRole("button", { name: /Switch to (light|dark) mode/ }),
  ).toBeVisible();
}

for (const width of [1440, 390, 768]) {
  for (const [route, label, query, entry] of [
    ["deities", "Search deities by name", "Athena", "athena"],
    ["stories", "Search stories", "Titanomachy", "titanomachy"],
    ["artifacts", "Search artifacts", "Aegis", "aegis"],
    ["creatures", "Search creatures", "Fenrir", "fenrir"],
    ["heroes", "Search heroes", "Achilles", "achilles"],
    ["locations", "Search locations", "Olympus", "mount-olympus"],
  ]) {
    test(`${route} retains a reading journey at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.goto(
        `/${route}?view=${route === "locations" ? "list" : "grid"}`,
        { waitUntil: "domcontentloaded" },
      );
      await waitForHydration(page);
      const search = page.getByRole("textbox", { name: label, exact: true });
      // The URL assertion also proves the client has hydrated before navigating.
      await expect(async () => {
        await search.fill("");
        await search.fill(query);
        await expect(page).toHaveURL(new RegExp(`q=${query}`), {
          timeout: 1500,
        });
      }).toPass({ timeout: 10000 });
      await page.locator(`main a[href="/${route}/${entry}"]`).first().click();
      await expect(page).toHaveURL(new RegExp(`/${route}/${entry}$`));
      await page.goBack({ waitUntil: "domcontentloaded" });
      await expect(search).toHaveValue(query);
      await expect(page).toHaveURL(new RegExp(`q=${query}`));
      await page.reload({ waitUntil: "domcontentloaded" });
      await waitForHydration(page);
      await expect(search).toHaveValue(query);
      await search.fill("no-such-myth-xyz");
      await expect(
        page.getByRole("button", {
          name: route === "heroes" ? "Reset filters" : "Clear filters",
          exact: true,
        }),
      ).toBeVisible();
      await page
        .getByRole("button", {
          name: route === "heroes" ? "Reset filters" : "Clear filters",
          exact: true,
        })
        .click();
      await expect(search).toHaveValue("");
      await expect(page).not.toHaveURL(/q=/);
    });
  }
}

for (const route of ["deities", "stories", "creatures", "artifacts"]) {
  test(`${route} restores pagination and validates parameters`, async ({
    page,
  }) => {
    await page.goto(`/${route}?page=2`, { waitUntil: "domcontentloaded" });
    await expect(
      page.locator('[aria-current="page"]').filter({ hasText: "2" }).first(),
    ).toBeVisible();
    const cards = page.locator(`main a[href^="/${route}/"]`);
    const href = await cards.first().getAttribute("href");
    await cards.first().click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(
      page.locator('[aria-current="page"]').filter({ hasText: "2" }).first(),
    ).toBeVisible();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(
      page.locator('[aria-current="page"]').filter({ hasText: "2" }).first(),
    ).toBeVisible();
    await page.goto(`/${route}?page=-2&pantheon=invalid&view=invalid`, {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.locator('[aria-current="page"]').filter({ hasText: "1" }).first(),
    ).toBeVisible();
  });
}

for (const width of [1440, 390, 768, 320]) {
  test(`search recovery supports keyboard and focus at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/deities", { waitUntil: "domcontentloaded" });
    await waitForHydration(page);
    const trigger = page
      .locator("header")
      .getByRole("button", { name: "Search", exact: true });
    await expect(async () => {
      await trigger.click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10000 });
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("combobox").fill("zzzznonexistent");
    await expect(dialog.getByRole("status")).toContainText("No results found");
    await expect(dialog.getByRole("option")).toHaveCount(3);
    const axe = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(axe.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await trigger.click();
    await dialog.getByRole("combobox").fill("zzzznonexistent");
    await expect(dialog.getByRole("status")).toContainText("No results found");
    await page.keyboard.press("ArrowDown");
    const selected = dialog.locator('[role="option"][aria-selected="true"]');
    const label = await selected.innerText();
    await page.keyboard.press("Enter");
    const routes: Record<string, string> = {
      "Browse Pantheons": "/pantheons",
      "All Deities": "/deities",
      "Read Stories": "/stories",
    };
    await expect(dialog).not.toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${routes[label]}$`));
  });
}

test("failed search data offers working browse recovery", async ({ page }) => {
  await page.route("**/api/catalog/search-index", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.goto("/deities", { waitUntil: "domcontentloaded" });
  await waitForHydration(page);
  await page
    .locator("header")
    .getByRole("button", { name: "Search", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox").fill("Athena");
  await expect(dialog.getByRole("status")).toContainText(
    "Search is unavailable",
  );
  await dialog
    .getByRole("option", { name: "Read Stories", exact: true })
    .click();
  await expect(page).toHaveURL(/\/stories$/);
});

test("deity table retains its page and column sort through an entry visit", async ({
  page,
}) => {
  await page.goto("/deities?view=table", { waitUntil: "domcontentloaded" });
  await waitForHydration(page);
  await page
    .getByRole("columnheader", { name: "Name" })
    .getByRole("button")
    .click();
  await expect(page).toHaveURL(/tableSort=name/);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  const firstEntry = page.locator("tbody a").first();
  const title = await firstEntry.innerText();
  const href = await firstEntry.getAttribute("href");
  await firstEntry.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await page.goBack({ waitUntil: "domcontentloaded" });
  await expect(page.locator("tbody a").first()).toHaveText(title);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("tbody a").first()).toHaveText(title);
});

test("pending search cannot activate a stale suggestion", async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/catalog/search-index", async (route) => {
    await pending;
    await route.fulfill({ status: 503, body: "Unavailable" });
  });
  await page.goto("/deities", { waitUntil: "domcontentloaded" });
  await waitForHydration(page);
  const opener = page.getByRole("textbox", { name: "Search deities by name" });
  await opener.focus();
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox").fill("Athena");
  await expect(dialog.getByRole("status")).toHaveText("Searching…");
  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/deities$/);
  release();
  await expect(dialog.getByRole("status")).toContainText(
    "Search is unavailable",
  );
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
});

test("catalog controls remain reachable at 320px with doubled text size", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/deities?q=Athena", { waitUntil: "domcontentloaded" });
  await waitForHydration(page);
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  await expect(
    page.locator("header").getByRole("button", { name: "Search", exact: true }),
  ).toBeInViewport();
  await page
    .getByRole("combobox", { name: "All traditions", exact: true })
    .click();
  await page.getByRole("option", { name: "Greek", exact: true }).click();
  await expect(page).toHaveURL(/pantheon=greek-pantheon/);
});
