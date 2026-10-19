import { defineConfig } from "@playwright/test";
import { evidenceRoot } from "./routes";
import path from "node:path";

const baseURL = process.env.AUDIT_BASE_URL ?? "http://localhost:3118";
const url = new URL(baseURL);
if (!["localhost", "127.0.0.1"].includes(url.hostname))
  throw new Error("Audit accepts an existing local server only.");
export default defineConfig({
  testDir: ".",
  globalSetup: path.join(__dirname, "global-setup.ts"),
  testMatch: "template-sweep.spec.ts",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  timeout: 90_000,
  outputDir: path.join(evidenceRoot, "playwright"),
  reporter: [
    ["line"],
    [
      "json",
      { outputFile: path.join(evidenceRoot, "playwright-results.json") },
    ],
  ],
  use: {
    baseURL,
    browserName: "chromium",
    reducedMotion: "reduce",
    trace: "off",
    screenshot: "off",
    storageState: {
      cookies: [],
      origins: [
        {
          origin: url.origin,
          localStorage: [{ name: "mythos-cookie-consent", value: "rejected" }],
        },
      ],
    },
  },
  projects: [320, 768, 1440].flatMap((width) =>
    (["light", "dark"] as const).map((colorScheme) => ({
      name: `${width}-${colorScheme}`,
      use: { viewport: { width, height: 900 }, colorScheme },
    })),
  ),
});
