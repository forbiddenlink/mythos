import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = "http://localhost:3000";
const OUT_DIR = join(process.cwd(), "visual-assets", "after");
mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const PAGES = [
  { name: "artifacts-index", path: "/artifacts" },
  { name: "creatures-index", path: "/creatures" },
  { name: "heroes-index", path: "/heroes" },
  { name: "locations-index", path: "/locations" },
  { name: "journeys-index", path: "/journeys" },
];

async function run() {
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    const vpDir = join(OUT_DIR, vp.name);
    mkdirSync(vpDir, { recursive: true });
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    await page.addInitScript(() => {
      window.localStorage.setItem("mythos-cookie-consent", "granted");
    });

    for (const p of PAGES) {
      const url = `${BASE_URL}${p.path}`;
      console.log(`[${vp.name}] Capturing ${p.name} (${p.path})...`);
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
        await page.waitForTimeout(1000);
        await page.screenshot({
          path: join(vpDir, `${p.name}-hero.png`),
          fullPage: false,
        });
        await page.evaluate(() => window.scrollBy(0, 800));
        await page.waitForTimeout(500);
        await page.screenshot({
          path: join(vpDir, `${p.name}-scrolled.png`),
          fullPage: false,
        });
      } catch (err) {
        console.error(`Failed to capture ${p.name}:`, err.message);
      }
    }
    await context.close();
  }

  await browser.close();
  console.log("Finished after captures.");
}

run().catch(console.error);
