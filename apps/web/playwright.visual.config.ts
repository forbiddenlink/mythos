import { defineConfig } from "@playwright/test";

const port = Number(process.env.VISUAL_PORT ?? "3118");
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("VISUAL_PORT must be a port number between 1 and 65535");
}
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./visual",
  globalSetup: "./visual/global-setup.ts",
  testMatch: "**/*.spec.ts",
  outputDir: "./visual-test-results",
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  timeout: 45000,
  // Only the explicit visual:update command may create or change references.
  updateSnapshots: "none",
  reporter: [
    [process.env.CI ? "github" : "list"],
    ["html", { outputFolder: "playwright-report/visual", open: "never" }],
  ],
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
      threshold: 0,
      maxDiffPixels: 0,
    },
  },
  use: {
    baseURL,
    browserName: "chromium",
    deviceScaleFactor: 1,
    locale: "en-US",
    timezoneId: "America/New_York",
    reducedMotion: "reduce",
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [390, 1440].flatMap((width) =>
    (["light", "dark"] as const).map((colorScheme) => ({
      name: `chromium-macos26-arm64-${width}-${colorScheme}`,
      use: {
        viewport: { width, height: width === 390 ? 844 : 900 },
        colorScheme,
        storageState: {
          cookies: [],
          origins: [
            {
              origin: baseURL,
              localStorage: [
                { name: "mythos-cookie-consent", value: "accepted" },
                { name: "theme", value: colorScheme },
              ],
            },
          ],
        },
      },
    })),
  ),
  // Build explicitly before this suite; a running local production server is reusable.
  webServer: {
    command: `pnpm start --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
