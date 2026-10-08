import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? "3000");
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("E2E_PORT must be a port number between 1 and 65535");
}
const baseURL = `http://localhost:${port}`;

/**
 * Playwright configuration for Mythos Atlas E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use */
  reporter: process.env.CI ? "github" : "html",
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL,
    /* Collect trace when retrying the failed test */
    trace: "on-first-retry",
    /* Take screenshot on failure */
    screenshot: "only-on-failure",
    /* Pre-set localStorage to accept cookies and avoid banner blocking tests */
    storageState: {
      cookies: [],
      origins: [
        {
          origin: baseURL,
          localStorage: [{ name: "mythos-cookie-consent", value: "accepted" }],
        },
      ],
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    ...(process.env.QA_ALL_BROWSERS === "true"
      ? [
          { name: "firefox", use: { ...devices["Desktop Firefox"] } },
          { name: "webkit", use: { ...devices["Desktop Safari"] } },
        ]
      : []),
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    // SKIP_BUILD: CI builds separately to set NEXT_PUBLIC_* env vars at build time
    // The suite exercises Oracle UI, so enable it for local builds too.
    command: process.env.SKIP_BUILD
      ? `pnpm start --port ${port}`
      : `pnpm build:ci && pnpm start --port ${port}`,
    url: baseURL,
    reuseExistingServer:
      !process.env.CI && process.env.REUSE_E2E_SERVER === "true",
    timeout: 240000,
  },
});
