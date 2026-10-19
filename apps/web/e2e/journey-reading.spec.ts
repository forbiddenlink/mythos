import { expect, test } from "@playwright/test";

test("Odyssey stops remain readable when tiles fail and motion is reduced", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("https://tile.openstreetmap.org/**", (route) =>
    route.abort(),
  );
  await page.goto("/journeys/odyssey");
  const stop = page.getByRole("button", {
    name: "Go to stop 4: Island of the Cyclopes",
  });
  await stop.focus();
  await page.keyboard.press("Enter");
  await expect(stop).toHaveAttribute("aria-pressed", "true");
  const selected = page.locator('[aria-live="polite"]').filter({
    has: page.getByRole("heading", {
      name: "Island of the Cyclopes",
      exact: true,
    }),
  });
  await expect(
    selected.getByRole("link", { name: "Poseidon" }),
  ).toHaveAttribute("href", "/deities/poseidon");
  await expect(
    selected.getByRole("link", { name: "Cyclops", exact: true }),
  ).toHaveAttribute("href", "/creatures/cyclops");
  await expect(
    selected.getByRole("link", { name: /Read Odyssey · Book 9/ }),
  ).toBeVisible();
  await expect(
    page.getByText("The background map could not load.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".leaflet-control-attribution")).toContainText(
    "OpenStreetMap",
  );
  await page.getByRole("button", { name: "Reset journey" }).click();
  await expect(
    page.getByRole("button", { name: "Go to stop 1: Troy", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("the full Odyssey itinerary and its sources work without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    // Do not inherit the consent seed: Firefox can stall while Playwright
    // restores localStorage at localhost with page JavaScript disabled.
    storageState: { cookies: [], origins: [] },
    baseURL,
  });
  const page = await context.newPage();
  await page.goto("/journeys/odyssey");
  const stops = page.locator("#stops");
  await expect(stops.getByRole("listitem")).toHaveCount(14);
  await expect(stops.getByRole("link", { name: /Read Odyssey/ })).toHaveCount(
    14,
  );
  await expect(
    stops.getByRole("link", { name: "Ithaca", exact: true }),
  ).toHaveAttribute("href", "/locations/ithaca");
  await context.close();
});
