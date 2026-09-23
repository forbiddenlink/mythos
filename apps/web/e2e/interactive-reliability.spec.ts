import { expect, test } from "@playwright/test";

test("family-tree keyboard users can leave the graph in both directions", async ({
  page,
}) => {
  await page.goto("/family-tree");
  await page.getByRole("button", { name: "Network family tree view" }).click();
  const graph = page.getByRole("application", {
    name: /Family tree visualization/,
  });
  await expect(graph).toBeVisible();
  await graph.focus();
  await page.keyboard.press("Home");
  await expect(graph).toHaveAttribute("aria-activedescendant", /.+/);
  await page.keyboard.press("Tab");
  await expect(graph).not.toBeFocused();
  await graph.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(graph).not.toBeFocused();
});

test("mobile comparison links have separate touch targets", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/collections/trickster-gods");
  const section = page.locator('section[aria-label$="across pantheons"]');
  await expect(section).toBeVisible();
  const links = section.getByRole("link");
  const boxes = await links.evaluateAll((elements) =>
    elements
      .filter((element) => element.checkVisibility())
      .map((element) => {
        const r = element.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, height: r.height };
      }),
  );
  expect(boxes.length).toBeGreaterThan(1);
  boxes.forEach((box, index) => {
    expect(box.height).toBeGreaterThanOrEqual(44);
    if (index) expect(box.top).toBeGreaterThanOrEqual(boxes[index - 1].bottom);
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("comparisons link existing heroes to their hero articles", async ({
  page,
}) => {
  for (const [source, hero] of [
    ["erlang-shen", "heracles"],
    ["gilgamesh", "heracles"],
    ["hou-yi", "arjuna"],
  ]) {
    await page.goto(`/deities/${source}`);
    await expect(
      page.locator(`main a[href="/heroes/${hero}"]:visible`).first(),
    ).toBeVisible();
    await expect(page.locator(`main a[href="/deities/${hero}"]`)).toHaveCount(
      0,
    );
    await expect(
      page.locator(
        `section[aria-label$="across pantheons"] a[href="/heroes/${hero}"]:visible`,
      ),
    ).toBeVisible();
  }
});
