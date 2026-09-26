import { expect, test } from "@playwright/test";

/**
 * SEO hubs and structured data: the guides, the "gods of <domain>" pages and
 * the entity JSON-LD must be present in the server HTML (what a crawler sees
 * before any script runs), and the hubs must link into the catalog.
 */

/** JSON-LD blocks in the raw server HTML, parsed. */
async function serverJsonLd(
  request: import("@playwright/test").APIRequestContext,
  path: string,
): Promise<{ html: string; blocks: Array<Record<string, unknown>> }> {
  const response = await request.get(path);
  expect(response.status(), path).toBe(200);
  const html = await response.text();
  const blocks = [
    ...html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map((match) => JSON.parse(match[1]) as Record<string, unknown>);
  return { html, blocks };
}

function types(blocks: Array<Record<string, unknown>>): unknown[] {
  return blocks.map((block) => block["@type"]);
}

test.describe("structured data in server HTML", () => {
  test("entity pages describe mythic figures as Things, not Persons", async ({
    request,
  }) => {
    for (const path of [
      "/deities/zeus",
      "/heroes/odysseus",
      "/creatures/nemean-lion",
      "/artifacts/pandoras-box",
    ]) {
      const { blocks } = await serverJsonLd(request, path);
      const article = blocks.find(
        (block) =>
          block["@type"] === "Article" &&
          (block.about as { "@type"?: string } | undefined)?.["@type"],
      );
      expect(article, path).toBeTruthy();
      expect(
        (article?.about as { "@type"?: string } | undefined)?.["@type"],
      ).toBe("Thing");
    }
  });

  test("a real place carries coordinates and a mythic realm does not", async ({
    request,
  }) => {
    const ithaca = await serverJsonLd(request, "/locations/ithaca");
    const place = ithaca.blocks.find((b) => b["@type"] === "Article");
    expect((place?.about as { geo?: unknown } | undefined)?.geo).toBeTruthy();

    const tartarus = await serverJsonLd(request, "/locations/tartarus");
    const realm = tartarus.blocks.find((b) => b["@type"] === "Article");
    expect(
      (realm?.about as { geo?: unknown } | undefined)?.geo,
    ).toBeUndefined();
  });

  test("source pages are Books", async ({ request }) => {
    const { blocks } = await serverJsonLd(request, "/sources/orphic-hymns");
    expect(types(blocks)).toContain("Book");
  });

  test("deity pages answer family questions visibly and as FAQPage", async ({
    page,
    request,
  }) => {
    const { blocks } = await serverJsonLd(request, "/deities/zeus");
    const faq = blocks.find((b) => b["@type"] === "FAQPage");
    expect(JSON.stringify(faq)).toContain("Who are Zeus's parents?");

    await page.goto("/deities/zeus");
    await expect(
      page.getByRole("heading", { name: "Zeus's family at a glance" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Compare Zeus and Jupiter side by side" }),
    ).toHaveAttribute("href", "/compare/jupiter-vs-zeus");
    await expect(
      page.getByRole("link", { name: "Gods of Sky" }),
    ).toHaveAttribute("href", "/gods-of/sky");
  });

  test("the reading view defers to the story entry as canonical", async ({
    request,
  }) => {
    const html = await (await request.get("/stories/titanomachy/read")).text();
    expect(html).toContain(
      '<link rel="canonical" href="https://mythosatlas.com/stories/titanomachy"/>',
    );
  });
});

test.describe("hub pages", () => {
  test("gods of war lists deities by tradition and links to them", async ({
    page,
    request,
  }) => {
    const { blocks } = await serverJsonLd(request, "/gods-of/war");
    expect(types(blocks)).toEqual(
      expect.arrayContaining(["CollectionPage", "ItemList", "FAQPage"]),
    );

    await page.goto("/gods-of/war");
    await expect(
      page.getByRole("heading", { level: 1, name: "Gods of War" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Greek" })).toBeVisible();
    const greek = page.locator("section#greek-pantheon");
    await expect(
      greek.getByRole("link", { name: "Ares", exact: true }),
    ).toHaveAttribute("href", "/deities/ares");
  });

  test("divine domains links every domain page", async ({ page }) => {
    await page.goto("/divine-domains");
    await expect(
      page.getByRole("link", { name: "Gods of War", exact: true }),
    ).toHaveAttribute("href", "/gods-of/war");
  });

  for (const [path, heading, entityHref] of [
    [
      "/guides/percy-jackson-titans-curse",
      "The Myths Behind Percy Jackson: The Titan's Curse",
      "/deities/atlas",
    ],
    [
      "/guides/odyssey",
      "The Odyssey: A Guide to Homer's Epic",
      "/locations/ithaca",
    ],
    [
      "/guides/hades-ii",
      "Who's Who in Hades II: The Mythology Behind the Game",
      "/deities/melinoe",
    ],
  ] as const) {
    test(`${path} renders, links the catalog and carries its FAQ`, async ({
      page,
      request,
    }) => {
      const { blocks, html } = await serverJsonLd(request, path);
      expect(types(blocks)).toEqual(
        expect.arrayContaining(["Article", "FAQPage"]),
      );
      const ogImage = /<meta property="og:image" content="([^"]+)"/.exec(
        html,
      )?.[1];
      expect(ogImage).toContain(`${path}/opengraph-image`);

      await page.goto(path);
      await expect(
        page.getByRole("heading", { level: 1, name: heading }),
      ).toBeVisible();
      await expect(
        page.locator(`main a[href="${entityHref}"]`).first(),
      ).toBeVisible();
    });
  }

  test("guide OG images are PNGs", async ({ request }) => {
    const response = await request.get("/guides/odyssey/opengraph-image");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  });

  test("entries link back to the guides that feature them", async ({
    page,
  }) => {
    await page.goto("/heroes/odysseus");
    await expect(
      page.getByRole("link", { name: "The Odyssey: A Guide to Homer's Epic" }),
    ).toHaveAttribute("href", "/guides/odyssey");
  });

  test("the homepage links the guides", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "All guides" }),
    ).toHaveAttribute("href", "/guides");
  });

  test("the sitemap lists the hubs and the previously missing routes", async ({
    request,
  }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const path of [
      "/guides/hades-ii",
      "/guides/odyssey",
      "/guides/percy-jackson-titans-curse",
      "/gods-of/war",
      "/atlas",
      "/compare/parallels",
      "/accessibility",
    ]) {
      expect(xml, path).toContain(`<loc>https://mythosatlas.com${path}</loc>`);
    }
  });
});
