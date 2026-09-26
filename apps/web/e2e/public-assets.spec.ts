import { expect, test } from "@playwright/test";

test("serves a hero image instead of its similarly named page", async ({
  request,
}) => {
  const response = await request.get("/heroes/achilles.webp");

  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("image/webp");
  const body = await response.body();
  expect(body.subarray(0, 4).toString("ascii")).toBe("RIFF");
  expect(body.subarray(8, 12).toString("ascii")).toBe("WEBP");
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
    const entities = scripts.map((match) => JSON.parse(match[2]));
    expect(
      entities.filter((entity) => entity["@type"] === "WebSite"),
      path,
    ).toHaveLength(1);
    expect(
      entities.filter((entity) => entity["@type"] === "Organization"),
      path,
    ).toHaveLength(1);
    const collections = scripts
      .map((match) => JSON.parse(match[2]))
      .filter((data) => data["@type"] === "CollectionPage");
    expect(collections, path).toHaveLength(
      path.split("/").length === 2 ? 1 : 0,
    );
  }
});
