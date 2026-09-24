import { expect, test } from "@playwright/test";

test("serves a hero image instead of its similarly named page", async ({
  request,
}) => {
  const response = await request.get("/heroes/achilles.png");

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("image/png");
  expect((await response.body()).subarray(0, 8)).toEqual(
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  );
});

test("renders the documented Met image without the Next image optimizer", async ({
  page,
}) => {
  await page.goto("/stories/perseus-medusa");

  const image = page.getByAltText(
    "Perseus with the Head of Medusa, marble. Photograph: The Metropolitan Museum of Art.",
  );
  await expect(image).toHaveAttribute(
    "src",
    "https://collectionapi.metmuseum.org/api/collection/v1/iiif/204758/486446/main-image",
  );
  await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveJSProperty("complete", true);
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
});

test("server HTML contains unique structured data scoped to the page", async ({
  request,
}) => {
  for (const path of [
    "/stories",
    "/pantheons",
    "/artifacts",
    "/creatures",
    "/locations",
    "/stories/osiris-myth",
    "/locations/mount-olympus",
  ]) {
    const response = await request.get(path);
    expect(response.ok()).toBe(true);
    const html = await response.text();
    const scripts = [
      ...html.matchAll(
        /<script\b([^>]*type="application\/ld\+json"[^>]*)>([\s\S]*?)<\/script>/g,
      ),
    ];
    expect(scripts.length, path).toBeGreaterThan(0);
    const ids = scripts.map((match) => match[1].match(/\bid="([^"]+)"/)?.[1]);
    expect(new Set(ids).size, path).toBe(ids.length);
    const collections = scripts
      .map((match) => JSON.parse(match[2]))
      .filter((data) => data["@type"] === "CollectionPage");
    expect(collections, path).toHaveLength(
      path.split("/").length === 2 ? 1 : 0,
    );
  }
});
