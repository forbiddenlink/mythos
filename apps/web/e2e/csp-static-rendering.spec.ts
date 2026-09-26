import { expect, test } from "@playwright/test";

/**
 * Static generation + strict CSP: prerendered pages are allowed by build-time
 * script hashes, dynamic pages by the per-request nonce. Any inline script the
 * policy misses would stop hydration, so assert that no inline script is
 * blocked and that client UI still works.
 */

const ROUTES = [
  "/", // static
  "/deities/zeus", // SSG entity page
  "/stories/titanomachy", // SSG entity page
  "/heroes", // dynamic (searchParams)
  "/deities/not-a-real-deity", // static 404
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __csp: string[] }).__csp = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      (window as unknown as { __csp: string[] }).__csp.push(
        `${event.effectiveDirective} ${event.blockedURI}`,
      );
    });
  });
});

for (const route of ROUTES) {
  test(`no inline script is blocked on ${route}`, async ({ page }) => {
    const response = await page.goto(route);
    const csp = response?.headers()["content-security-policy"] ?? "";
    const scriptSrc = /script-src ([^;]*)/.exec(csp)?.[1] ?? "";
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).toMatch(/'sha256-|'nonce-/);

    // Hydrated: the command palette opens from the keyboard.
    await page.keyboard.press("Control+k");
    await expect(page.getByPlaceholder(/search deities, stories/i)).toBeVisible(
      {
        timeout: 10000,
      },
    );

    const violations = await page.evaluate(
      () => (window as unknown as { __csp: string[] }).__csp,
    );
    // An inline violation reports blockedURI "inline"; eval probes by
    // libraries (blockedURI "eval") are expected and harmless.
    expect(violations.filter((v) => v.endsWith(" inline"))).toEqual([]);
  });
}

test("entity pages are served from the prerender cache", async ({
  request,
}) => {
  const response = await request.get("/deities/zeus");
  expect(response.status()).toBe(200);
  expect(response.headers()["x-nextjs-cache"]).toBe("HIT");
});

test("a saved locale cookie translates the prerendered page", async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: "locale", value: "es", url: "http://localhost:3000" },
  ]);
  await page.goto("/quiz");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(
    page.getByRole("heading", { level: 1, name: "Cuestionario de Mitología" }),
  ).toBeVisible();
});
