import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import stories from "../src/data/stories.json";

// Opt-in local audit; run against an already built preview, never a live account.
const baseURL = process.env.QA_BASE_URL || "http://localhost:3000";
const output = process.env.QA_OUTPUT || "/tmp/mythos-quality-sweep";
const routes = [
  "/",
  "/pantheons",
  "/deities",
  "/heroes",
  "/stories",
  "/creatures",
  "/artifacts",
  "/locations",
  "/sources",
  "/collections",
  "/journeys",
  "/learning-paths",
  "/study",
  "/tours",
  "/review",
  "/bookmarks",
  "/progress",
  "/achievements",
  "/leaderboard",
  "/quiz",
  "/quiz/quick",
  "/quiz/relationships",
  "/quiz/personality",
  "/games",
  "/games/memory",
  "/compare",
  "/compare/myths",
  "/compare/parallels",
  "/family-tree",
  "/knowledge-graph",
  "/atlas",
  "/cosmology",
  "/domains",
  "/timeline",
  "/story-timeline",
  "/divine-domains",
  "/facts",
  "/about",
  "/contact",
  "/accessibility",
  "/privacy",
  "/terms",
  "/changelog",
  "/pantheons/greek",
  "/deities/zeus",
  "/deities/ra",
  "/deities/amaterasu",
  "/heroes/heracles",
  "/stories/perseus-medusa",
  "/stories/first-twins-ibeji",
  "/sources/iliad",
  "/collections/trickster-gods",
  "/journeys/odyssey",
  "/creatures/cerberus",
  "/artifacts/mjolnir",
  "/locations/mount-olympus",
  "/study/inanna-text-and-temple",
  "/study/ibeji-objects-and-remembrance",
  "/study/greek-gods",
  "/study/norse-mythology",
  "/study/comparative-mythology",
  "/stories/interactive",
  "/stories/interactive/judgment-of-paris",
  "/stories/perseus-medusa/read",
  "/stories/ragnarok/cinematic",
  "/stories/titanomachy/cinematic",
  "/oracle",
  "/stories/osiris-myth",
  "/stories/inanna-descent",
  "/stories/labors-of-hercules",
  "/stories/trojan-war",
];
const modes = [
  { theme: "light", width: 320, height: 800 },
  { theme: "dark", width: 320, height: 800 },
  { theme: "light", width: 768, height: 1000 },
  { theme: "dark", width: 768, height: 1000 },
  { theme: "light", width: 1440, height: 1000 },
  { theme: "dark", width: 1440, height: 1000 },
] as const;

async function main(): Promise<void> {
  const buildId = process.env.QA_BUILD_ID;
  if (process.env.QA_RESUME === "true" && !buildId) {
    throw new Error(
      "QA_RESUME requires QA_BUILD_ID identifying the deployed build.",
    );
  }
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch();
  const requestedPaths = new Set(
    (process.env.QA_PATHS || "").split(",").filter(Boolean),
  );
  // Reader accents vary by tradition; a Greek-only sample missed contrast failures.
  const readersByPantheon = new Map<string, string>();
  for (const story of stories) {
    if (story.fullNarrative && !readersByPantheon.has(story.pantheonId)) {
      readersByPantheon.set(story.pantheonId, `/stories/${story.slug}/read`);
    }
  }
  const selectedRoutes = requestedPaths.size
    ? [...requestedPaths]
    : [...new Set([...routes, ...readersByPantheon.values()])];
  const jobs = modes.flatMap((mode) =>
    selectedRoutes.map((path) => ({ ...mode, path })),
  );
  const results: unknown[] = [];
  let failedCases = 0;
  async function worker(): Promise<void> {
    for (let job = jobs.shift(); job; job = jobs.shift()) {
      const key = `${job.theme}-${job.width}-${job.path.replace(/\W+/g, "_")}`;
      // Resume only an interrupted audit of the same build and output directory.
      if (process.env.QA_RESUME === "true") {
        try {
          const saved = JSON.parse(
            await readFile(`${output}/${key}.json`, "utf8"),
          );
          if (
            saved.auditBaseURL === baseURL &&
            saved.auditBuildId === buildId &&
            saved.status === 200 &&
            saved.h1 === 1 &&
            !saved.overflow &&
            !saved.nestedControls &&
            saved.brokenImages?.length === 0 &&
            saved.errors?.length === 0 &&
            saved.violations?.length === 0
          ) {
            results.push(saved);
            continue;
          }
        } catch {
          // Missing or incomplete results need a fresh check.
        }
      }
      const context = await browser.newContext({
        viewport: job,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await context.addInitScript((theme) => {
        localStorage.setItem("theme", theme);
        localStorage.setItem("mythos-cookie-consent", "accepted");
      }, job.theme);
      try {
        const response = await page.goto(`${baseURL}${job.path}`, {
          waitUntil: "load",
        });
        if (job.path === "/domains") await page.waitForURL("**/divine-domains");
        await page
          .getByRole("button", { name: /Switch to (light|dark) mode/ })
          .waitFor();
        await page.evaluate(async () => {
          await document.fonts.ready;
        });
        // Let entrance transitions settle before measuring final text contrast.
        await page.waitForTimeout(800);
        // Reveal scroll-triggered content before scanning, then return to the top.
        await page.evaluate(async () => {
          for (
            let y = 0;
            y < document.documentElement.scrollHeight;
            y += innerHeight
          ) {
            scrollTo(0, y);
            await new Promise((resolve) => requestAnimationFrame(resolve));
          }
          // Also reveal images in nested scroll regions (for example location lists).
          for (const image of Array.from(document.images)) {
            if (!image.checkVisibility()) continue;
            image.scrollIntoView({ block: "nearest", inline: "nearest" });
            await new Promise((resolve) => requestAnimationFrame(resolve));
          }
          scrollTo(0, 0);
        });
        await page.waitForTimeout(800);
        // Scrolling starts lazy image requests; incomplete images must not pass silently.
        await page
          .waitForFunction(
            () =>
              Array.from(document.images).every(
                (image) => !image.checkVisibility() || image.complete,
              ),
            undefined,
            { timeout: 10000 },
          )
          .catch(() => undefined);
        const layout = await page.evaluate(() => ({
          h1: Array.from(document.querySelectorAll("h1")).filter((heading) =>
            heading.checkVisibility({ checkOpacity: true }),
          ).length,
          overflow: document.documentElement.scrollWidth > innerWidth,
          nestedControls: document.querySelectorAll(
            "a a, a button, button a, button button",
          ).length,
          brokenImages: Array.from(document.images)
            .filter(
              (image) =>
                image.checkVisibility() &&
                (!image.complete || !image.naturalWidth),
            )
            .map((image) => image.getAttribute("src")),
        }));
        const scan = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        const result = {
          ...job,
          auditBaseURL: baseURL,
          auditBuildId: buildId,
          status: response?.status(),
          ...layout,
          errors,
          violations: scan.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.map((n) => ({
              html: n.html,
              target: n.target,
              failure: n.failureSummary,
            })),
          })),
        };
        results.push(result);
        if (
          result.status !== 200 ||
          layout.h1 !== 1 ||
          layout.overflow ||
          layout.nestedControls ||
          layout.brokenImages.length ||
          errors.length ||
          scan.violations.length
        )
          failedCases += 1;
        await writeFile(
          `${output}/${key}.json`,
          JSON.stringify(result, null, 2),
        );
        await page.screenshot({ path: `${output}/${key}.png` });
        console.log(
          `${job.theme} ${job.path}: ${scan.violations.length} rules; overflow=${layout.overflow}; errors=${errors.length}`,
        );
      } catch (error) {
        const result = {
          ...job,
          auditBaseURL: baseURL,
          auditBuildId: buildId,
          error: String(error),
        };
        results.push(result);
        failedCases += 1;
        await writeFile(
          `${output}/${key}.json`,
          JSON.stringify(result, null, 2),
        );
        console.log(`${job.theme} ${job.path}: ${String(error)}`);
      } finally {
        await context.close();
      }
    }
  }
  try {
    const workers = Math.max(
      1,
      Math.min(4, Number(process.env.QA_WORKERS) || 2),
    );
    await Promise.all(Array.from({ length: workers }, () => worker()));
  } finally {
    await browser.close();
  }
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log(`${results.length} cases completed; ${failedCases} failed.`);
  if (failedCases) process.exitCode = 1;
}

void main();
