import { expect, test } from "@playwright/test";

test.describe("retired routes redirect permanently", () => {
  for (const [from, to] of [
    ["/leaderboard", /\/progress$/],
    ["/tours", /\/journeys$/],
    ["/tours/norse-realms", /\/journeys\/nine-realms$/],
    ["/tours/argonauts", /\/journeys\/golden-fleece$/],
    ["/learning-paths", /\/paths#reading-paths$/],
    ["/collections", /\/paths#collections$/],
    ["/study", /\/paths#study-guides$/],
    ["/story-timeline", /\/timeline#stories$/],
  ] as const) {
    test(`${from} lands on its replacement`, async ({ page, request }) => {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status()).toBe(308);
      await page.goto(from);
      await expect(page).toHaveURL(to);
    });
  }

  test("the story timeline opens its view from the hash", async ({ page }) => {
    await page.goto("/timeline#stories");
    await expect(
      page.getByRole("tab", { name: /Stories by cosmic era/ }),
    ).toHaveAttribute("aria-selected", "true");
    await page.getByRole("tab", { name: /Traditions and events/ }).click();
    await expect(page).toHaveURL(/\/timeline$/);
  });
});

test("otherworld journeys show an ordered route instead of a map", async ({
  page,
}) => {
  await page.goto("/journeys/nine-realms");
  const route = page.getByRole("list", { name: "Route through the realms" });
  await expect(route.getByRole("listitem")).toHaveCount(9);
  await expect(route.locator('a[href="/locations/asgard"]')).toBeVisible();
  await expect(page.locator(".leaflet-container")).toHaveCount(0);
});

test("Your Stats shows figures without ranks or lifting cards", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "mythos-atlas-progress",
      JSON.stringify({ totalXP: 120, deitiesViewed: ["zeus"] }),
    ),
  );
  await page.goto("/progress");
  await expect(
    page.getByRole("heading", { level: 1, name: "Your Stats" }),
  ).toBeVisible();
  await expect(page.getByText(/Rank #/)).toHaveCount(0);
  await expect(page.getByText("120 XP")).toBeVisible();
  await expect(
    page.locator('[data-slot="card"]:not([data-interactive])'),
  ).not.toHaveCount(0);
  const lifted = await page
    .locator('[data-slot="card"]:not([data-interactive])')
    .evaluateAll(
      (cards) =>
        cards.filter((c) => /hover:-translate-y/.test(c.className)).length,
    );
  expect(lifted).toBe(0);
});

test.describe("entity pages", () => {
  for (const path of [
    "/deities/athena",
    "/heroes/achilles",
    "/stories/death-of-baldur",
    "/creatures/minotaur",
    "/artifacts/mjolnir",
    "/locations/mount-olympus",
    "/pantheons/greek",
    "/sources/odyssey",
  ]) {
    test(`${path} can be shared`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(
        page.locator("main").getByRole("button", { name: "Share" }).first(),
      ).toBeVisible();
    });
  }

  test("detail images say they are illustrative and explain why", async ({
    page,
  }) => {
    await page.goto("/creatures/minotaur");
    const caption = page.getByTestId("illustrative-image-caption");
    await expect(caption).toContainText("Illustrative image");
    await caption.getByRole("link", { name: "About our images" }).click();
    await expect(page).toHaveURL(/\/about#images$/);
    await expect(
      page.getByRole("heading", { name: "About the images" }),
    ).toBeInViewport();
  });
});

test("pantheon pages link a printable worksheet with an answer key", async ({
  page,
}) => {
  await page.goto("/pantheons/greek");
  await page.getByRole("link", { name: "Printable worksheet" }).click();
  await expect(page).toHaveURL(/\/pantheons\/greek\/worksheet$/);
  await expect(
    page.getByRole("heading", { name: /Who.s who/ }).first(),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /Answer key/ })).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("body > div header").first()).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Print worksheet" }),
  ).toBeHidden();
});

test("today's myth runs three questions and offers a share card", async ({
  page,
}) => {
  await page.goto("/");
  const section = page.locator("#todays-myth");
  await section.scrollIntoViewIfNeeded();
  await section.getByRole("button", { name: "Answer three questions" }).click();
  for (let i = 0; i < 3; i++) {
    await section.locator("ul li button").first().click();
    await section
      .getByRole("button", {
        name: i === 2 ? "See your result" : "Next question",
      })
      .click();
  }
  await expect(section.getByText(/\/ 3/)).toBeVisible();
  await expect(section.getByRole("button", { name: "Share" })).toBeVisible();
  await expect(section.getByTestId("newsletter-daily_myth")).toBeVisible();
  await page.reload();
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByText(/Come back tomorrow/)).toBeVisible();
});

test("newsletter sign-up explains when sign-ups are not open yet", async ({
  page,
}) => {
  await page.goto("/about");
  const form = page.getByTestId("newsletter-footer");
  await form.scrollIntoViewIfNeeded();
  await form.getByLabel("Email address").fill("reader@example.com");
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Subscribe" }).click();
  // The e2e server runs without RESEND_API_KEY, so the route answers 501.
  await expect(form.getByRole("status")).toContainText(/Sign-ups open soon/);
});
