import { expect, test } from "@playwright/test";
import heroes from "../src/data/heroes.json";
import locations from "../src/data/locations.json";

for (const catalog of [
  {
    path: "/heroes",
    items: heroes.map((hero) => `${"/heroes/"}${hero.slug}`),
    size: 12,
  },
  {
    path: "/locations",
    items: locations.map((location) => `${"/locations/"}${location.id}`),
    size: 24,
  },
]) {
  test(`${catalog.path} exposes every catalog entry through real server-rendered page links`, async ({
    request,
  }) => {
    for (
      let page = 1;
      page <= Math.ceil(catalog.items.length / catalog.size);
      page++
    ) {
      const response = await request.get(`${catalog.path}?page=${page}`);
      expect(response.ok()).toBe(true);
      const html = await response.text();
      const hrefs = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(
        (match) => match[1].replaceAll("&amp;", "&"),
      );
      for (const href of catalog.items.slice(
        (page - 1) * catalog.size,
        page * catalog.size,
      ))
        expect(hrefs).toContain(href);
      if (page > 1) expect(hrefs).not.toContain(catalog.items[0]);
      if (page < Math.ceil(catalog.items.length / catalog.size))
        expect(
          hrefs.some(
            (href) =>
              href.startsWith(`${catalog.path}?`) &&
              new URL(href, "https://example.org").searchParams.get("page") ===
                String(page + 1),
          ),
        ).toBe(true);
    }
  });

  test(`${catalog.path} survives next, reload, back, and search resets`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${catalog.path}?view=list`, {
      waitUntil: "domcontentloaded",
    });
    await page
      .getByRole("link", { name: "Go to next page", exact: true })
      .click();
    await expect(page).toHaveURL(/page=2/);
    await expect(
      page.locator('[aria-current="page"]').filter({ hasText: "2" }),
    ).toBeVisible();
    await expect(
      page.locator(`a[href="${catalog.items[catalog.size]}"]`).first(),
    ).toBeVisible();
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(
      page.locator(`a[href="${catalog.items[catalog.size]}"]`).first(),
    ).toBeVisible();
    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(
      page.locator(`a[href="${catalog.items[0]}"]`).first(),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "Go to next page", exact: true })
      .click();
    const search = page.getByRole("textbox", {
      name: catalog.path === "/heroes" ? "Search heroes" : "Search locations",
    });
    await expect(async () => {
      await search.fill("");
      await search.pressSequentially("impossible-catalog-result");
      await expect(page).toHaveURL(/q=impossible-catalog-result/, {
        timeout: 1000,
      });
    }).toPass({ timeout: 10000, intervals: [250] });
    await expect(page).not.toHaveURL(/page=2/);
    await search.fill("");
    await expect(
      page.locator(`a[href="${catalog.items[0]}"]`).first(),
    ).toBeVisible();
  });
}

test("location filters persist through a direct load and clearing an era removes it", async ({
  page,
}) => {
  await page.goto("/locations?types=temple&view=list", {
    waitUntil: "domcontentloaded",
  });
  const allowed = locations.filter(
    (location) => location.locationType === "temple",
  );
  for (const location of allowed.slice(0, 24))
    await expect(
      page.getByRole("link", { name: `Explore ${location.name}`, exact: true }),
    ).toBeVisible();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/types=temple/);
  await page.goto(
    "/locations?era=classical-mediterranean&view=list&q=impossible-catalog-result",
    { waitUntil: "domcontentloaded" },
  );
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(page).not.toHaveURL(/era=|q=/);
});

test("invalid page values render the first page and oversized pages render the last", async ({
  request,
}) => {
  for (const value of ["NaN", "-2", "1.5", "Infinity", "0"]) {
    const response = await request.get(`/heroes?page=${value}`);
    expect(await response.text()).toContain(`href="/heroes/${heroes[0].slug}"`);
  }
  const response = await request.get("/heroes?page=999");
  expect(await response.text()).toContain(
    `href="/heroes/${heroes[heroes.length - 1].slug}"`,
  );
});

test("era filtering is applied to actual server-rendered location cards", async ({
  request,
}) => {
  const response = await request.get(
    "/locations?era=classical-mediterranean&view=list",
  );
  const html = await response.text();
  const actual = [
    ...html.matchAll(/<a\b[^>]*href="(\/locations\/[^"?#]+)"/g),
  ].map((match) => match[1]);
  const expected = locations
    .filter((location) =>
      ["greek-pantheon", "roman-pantheon"].includes(location.pantheonId),
    )
    .slice(0, 24)
    .map((location) => `/locations/${location.id}`);
  expect([...new Set(actual)]).toEqual(expected);
});

test("the Duat thumbnail loads when scrolled into the location list viewport", async ({
  page,
}) => {
  await page.goto("/locations?page=2&view=list", {
    waitUntil: "domcontentloaded",
  });
  const image = page.getByRole("img", { name: "Duat", exact: true });
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
});
test("an explicit map preference survives loading a later page", async ({
  page,
}) => {
  await page.goto("/locations?page=2&view=map", {
    waitUntil: "domcontentloaded",
  });
  await expect(
    page.getByRole("button", { name: "Show map view", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("button", { name: "Show map view", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
