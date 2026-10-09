import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = "http://localhost:3000";
const OUT_DIR = join(process.cwd(), "visual-assets", "baseline");
mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const PAGES = [
  { name: "home", path: "/" },
  { name: "pantheons-index", path: "/pantheons" },
  { name: "pantheon-detail", path: "/pantheons/greek" },
  { name: "deities-index", path: "/deities" },
  { name: "deity-detail", path: "/deities/zeus" },
  { name: "creatures-index", path: "/creatures" },
  { name: "creature-detail", path: "/creatures/fenrir" },
  { name: "artifacts-index", path: "/artifacts" },
  { name: "artifacts-detail", path: "/artifacts/aegis" },
  { name: "stories-index", path: "/stories" },
  { name: "story-detail", path: "/stories/titanomachy" },
  { name: "locations-index", path: "/locations" },
  { name: "location-detail", path: "/locations/mount-olympus" },
  { name: "family-tree", path: "/family-tree" },
  { name: "atlas", path: "/atlas" },
  { name: "quiz", path: "/quiz" },
  { name: "progress", path: "/progress" },
  { name: "bookmarks", path: "/bookmarks" },
  { name: "about", path: "/about" },
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

    // Set cookie consent to avoid banner obscuring views
    await page.addInitScript(() => {
      window.localStorage.setItem("mythos-cookie-consent", "granted");
    });

    for (const p of PAGES) {
      const url = `${BASE_URL}${p.path}`;
      console.log(`[${vp.name}] Capturing ${p.name} (${p.path})...`);
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
        // Small delay for fonts/animations to settle
        await page.waitForTimeout(1000);
        // Above the fold
        await page.screenshot({
          path: join(vpDir, `${p.name}-hero.png`),
          fullPage: false,
        });
        // Scroll down
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
  console.log("Finished baseline captures.");
}

run().catch(console.error);
