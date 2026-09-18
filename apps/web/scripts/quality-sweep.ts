import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";

// Opt-in local audit; run against an already built preview, never a live account.
const baseURL = process.env.QA_BASE_URL || "http://localhost:3000";
const output = process.env.QA_OUTPUT || "/tmp/mythos-quality-sweep";
const routes = [
  "/", "/pantheons", "/deities", "/heroes", "/stories", "/creatures",
  "/artifacts", "/locations", "/sources", "/collections", "/journeys",
  "/learning-paths", "/study", "/tours", "/review", "/bookmarks", "/progress",
  "/achievements", "/leaderboard", "/quiz", "/quiz/quick", "/quiz/relationships",
  "/quiz/personality", "/games", "/games/memory", "/compare", "/compare/myths",
  "/compare/parallels", "/family-tree", "/knowledge-graph", "/timeline",
  "/story-timeline", "/divine-domains", "/facts", "/about", "/contact",
  "/accessibility", "/privacy", "/terms", "/changelog",
  "/pantheons/greek", "/deities/zeus", "/heroes/heracles",
  "/stories/perseus-medusa", "/stories/first-twins-ibeji", "/sources/iliad",
  "/collections/trickster-gods", "/journeys/odyssey",
  "/creatures/cerberus", "/artifacts/mjolnir", "/locations/mount-olympus",
  "/study/inanna-text-and-temple", "/study/ibeji-objects-and-remembrance",
  "/stories/interactive", "/stories/interactive/judgment-of-paris",
  "/stories/perseus-medusa/read", "/stories/ragnarok/cinematic",
  "/stories/titanomachy/cinematic", "/oracle", "/api",
];
const modes = [
  { theme: "light", width: 320, height: 800 },
  { theme: "dark", width: 1440, height: 1000 },
] as const;

async function main(): Promise<void> {
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch();
  const jobs = modes.flatMap(mode => routes.map(path => ({ ...mode, path })));
  const results: unknown[] = [];
  async function worker(): Promise<void> {
    for (let job = jobs.shift(); job; job = jobs.shift()) {
      const context = await browser.newContext({ viewport: job, reducedMotion: "reduce" });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await context.addInitScript(theme => {
        localStorage.setItem("theme", theme);
        localStorage.setItem("mythos-cookie-consent", "accepted");
      }, job.theme);
      const key = `${job.theme}-${job.path.replace(/\W+/g, "_")}`;
      try {
        const response = await page.goto(`${baseURL}${job.path}`, { waitUntil: "load" });
        await page.getByRole("button", { name: /Switch to (light|dark) mode/ }).waitFor();
        await page.evaluate(async () => { await document.fonts.ready; });
        // Let entrance transitions settle before measuring final text contrast.
        await page.waitForTimeout(800);
        // Reveal scroll-triggered content before scanning, then return to the top.
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) {
            scrollTo(0, y);
            await new Promise(resolve => requestAnimationFrame(resolve));
          }
          scrollTo(0, 0);
        });
        const layout = await page.evaluate(() => ({
          h1: document.querySelectorAll("h1").length,
          overflow: document.documentElement.scrollWidth > innerWidth,
          nestedControls: document.querySelectorAll("a a, a button, button a, button button").length,
          brokenImages: Array.from(document.images).filter(image => image.complete && !image.naturalWidth).map(image => image.getAttribute("src")),
        }));
        const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        const result = { ...job, status: response?.status(), ...layout, errors,
          violations: scan.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ html: n.html, target: n.target, failure: n.failureSummary })) })) };
        results.push(result);
        await writeFile(`${output}/${key}.json`, JSON.stringify(result, null, 2));
        await page.screenshot({ path: `${output}/${key}.png` });
        console.log(`${job.theme} ${job.path}: ${scan.violations.length} rules; overflow=${layout.overflow}; errors=${errors.length}`);
      } catch (error) {
        results.push({ ...job, error: String(error) });
        console.log(`${job.theme} ${job.path}: ${String(error)}`);
      } finally { await context.close(); }
    }
  }
  try { await Promise.all([worker(), worker()]); }
  finally { await browser.close(); }
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
}

void main();
