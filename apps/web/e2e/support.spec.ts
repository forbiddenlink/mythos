import { expect, test } from "@playwright/test";

for (const width of [320, 1440]) {
  test(`support is reachable and clearly describes checkout at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/about");
    await page
      .getByRole("main")
      .getByRole("link", { name: "Support Mythos Atlas", exact: true })
      .click();
    await expect(page).toHaveURL(/\/support$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Support Mythos Atlas",
    );
    const checkout = page.getByRole("link", { name: "Support through Stripe" });
    await expect(checkout).toHaveAttribute(
      "href",
      "https://buy.stripe.com/dRmbJ0b641kOblE3xm0Ny01",
    );
    await expect(page.getByRole("main")).toContainText("One-time payment");
    await expect(page.getByRole("main")).toContainText("$5 USD suggested");
    await expect(page.getByRole("main")).toContainText("ImKindaGeeky");
    await expect(
      page
        .getByRole("contentinfo")
        .getByRole("link", { name: "Support Mythos Atlas" }),
    ).toHaveAttribute("href", "/support");
    const stripeRequests: string[] = [];
    await page.route("https://buy.stripe.com/**", async (route) => {
      stripeRequests.push(route.request().url());
      await route.fulfill({
        contentType: "text/html",
        body: "<h1>Checkout destination verified</h1>",
      });
    });
    await checkout.click();
    await expect(
      page.getByRole("heading", { name: "Checkout destination verified" }),
    ).toBeVisible();
    expect(stripeRequests).toEqual([
      "https://buy.stripe.com/dRmbJ0b641kOblE3xm0Ny01",
    ]);
  });
}
