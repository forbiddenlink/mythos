import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { currentRoutes, evidenceRoot } from "./routes";

const routes = currentRoutes();
mkdirSync(evidenceRoot, { recursive: true });
writeFileSync(
  path.join(evidenceRoot, "current-route-manifest.json"),
  JSON.stringify(routes, null, 2),
);
const existence = new Map<string, number | string>();
function claimFailureScreenshot(): boolean {
  // Filesystem slots remain bounded when Playwright restarts workers after failures.
  for (let slot = 0; slot < 8; slot++) {
    try {
      writeFileSync(
        path.join(evidenceRoot, `.failure-shot-${slot}`),
        "reserved",
        { flag: "wx" },
      );
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
  }
  return false;
}

// Playwright requires the fixture argument to be an object pattern.
// biome-ignore lint/correctness/noEmptyPattern: this hook only uses test metadata
test.beforeEach(async ({}, testInfo) => {
  const stem = `${testInfo.title.replace(/[^a-z0-9-]/gi, "_") || "home"}-${testInfo.project.name}`;
  rmSync(path.join(evidenceRoot, `${stem}.json`), { force: true });
});

test.afterEach(async ({ page }, testInfo) => {
  const stem = `${testInfo.title.replace(/[^a-z0-9-]/gi, "_") || "home"}-${testInfo.project.name}`;
  const report = path.join(evidenceRoot, `${stem}.json`);
  if (!existsSync(report)) {
    writeFileSync(
      report,
      JSON.stringify(
        {
          template: testInfo.title,
          project: testInfo.project.name,
          status: testInfo.status,
          errors: testInfo.errors,
          incomplete: true,
          url: page.url(),
        },
        null,
        2,
      ),
    );
  }
});

for (const entry of routes) {
  test(entry.pattern, async ({ page, request, baseURL }, testInfo) => {
    const pageErrors: string[] = [];
    const failedAssets: string[] = [];
    const canceledPrefetches: string[] = [];
    const canceledImages: Array<{ url: string; error: string }> = [];
    page.on("requestfailed", (request) => {
      if (
        !["image", "stylesheet", "script", "font"].includes(
          request.resourceType(),
        )
      )
        return;
      const error = request.failure()?.errorText ?? "Network request failed";
      const headers = request.headers();
      const isPrefetch =
        headers.purpose === "prefetch" ||
        headers["sec-purpose"]?.includes("prefetch") ||
        headers["next-router-prefetch"] === "1";
      if (isPrefetch && /ERR_ABORTED|cancelled|canceled/i.test(error)) {
        canceledPrefetches.push(`${error} ${request.url()}`);
        return;
      }
      if (
        request.resourceType() === "image" &&
        /ERR_ABORTED|cancelled|canceled/i.test(error)
      ) {
        canceledImages.push({ url: request.url(), error });
        return;
      }
      failedAssets.push(`${error} ${request.url()}`);
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("response", (response) => {
      if (
        response.status() >= 400 &&
        ["image", "stylesheet", "script", "font"].includes(
          response.request().resourceType(),
        )
      )
        failedAssets.push(`${response.status()} ${response.url()}`);
    });
    await page.addInitScript(() =>
      localStorage.setItem(
        "theme",
        matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
      ),
    );
    const response = await page.goto(entry.route, {
      waitUntil: "networkidle",
      timeout: 45_000,
    });
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    // Exercise lazy content without activating links, providers, or forms.
    const scrollEvidence = await page.evaluate(async () => {
      const encountered = new Set<string>();
      const observedImageUrls = new Set<string>();
      const pendingAtDeparture: string[] = [];
      let intersectionTimeouts = 0;
      const waitDeadline = performance.now() + 15_000;
      for (
        let y = 0, step = 0;
        y < document.documentElement.scrollHeight && step < 48;
        y += innerHeight, step++
      ) {
        scrollTo(0, y);
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
        for (const image of document.images) {
          if (image.src) observedImageUrls.add(image.src);
          if (image.currentSrc) observedImageUrls.add(image.currentSrc);
        }
        const intersection = await new Promise<{
          images: HTMLImageElement[];
          timedOut: boolean;
        }>((resolve) => {
          const images = [...document.images];
          if (!images.length) {
            resolve({ images: [], timedOut: false });
            return;
          }
          const intersecting = new Set<HTMLImageElement>();
          const reported = new Set<Element>();
          const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
              reported.add(entry.target);
              if (entry.isIntersecting && entry.intersectionRatio > 0)
                intersecting.add(entry.target as HTMLImageElement);
            }
            if (reported.size === images.length) {
              clearTimeout(timer);
              observer.disconnect();
              resolve({ images: [...intersecting], timedOut: false });
            }
          });
          const timer = setTimeout(() => {
            observer.disconnect();
            resolve({ images: [...intersecting], timedOut: true });
          }, 500);
          images.forEach((image) => {
            observer.observe(image);
          });
        });
        if (intersection.timedOut) intersectionTimeouts++;
        const visibleImages = intersection.images.filter((image) => {
          const rect = image.getBoundingClientRect();
          const style = getComputedStyle(image);
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== "none" &&
            style.visibility !== "hidden"
          );
        });
        for (const image of visibleImages) {
          image.dataset.auditEncounteredImage = "true";
          encountered.add(image.currentSrc || image.src);
        }
        // Stay at each viewport while lazy loads start and settle; bounded globally.
        const stepDeadline = Math.min(waitDeadline, performance.now() + 1_500);
        while (
          visibleImages.some((image) => !image.complete) &&
          performance.now() < stepDeadline
        ) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        pendingAtDeparture.push(
          ...visibleImages
            .filter((image) => !image.complete)
            .map((image) => image.currentSrc || image.src),
        );
      }
      scrollTo(0, 0);
      return {
        urls: [...encountered],
        observedImageUrls: [...observedImageUrls],
        pendingAtDeparture: [...new Set(pendingAtDeparture)],
        intersectionTimeouts,
        waitBudgetExpired: performance.now() >= waitDeadline,
      };
    });
    const encounteredImages = scrollEvidence.urls;
    const imageSettle = await page.evaluate(async () => {
      const candidates = [...document.images].filter(
        (image) =>
          image.loading !== "lazy" ||
          image.dataset.auditEncounteredImage === "true",
      );
      const rendered = (image: HTMLImageElement): boolean => {
        const rect = image.getBoundingClientRect();
        const style = getComputedStyle(image);
        if (
          rect.width <= 0 ||
          rect.height <= 0 ||
          style.display === "none" ||
          style.visibility === "hidden"
        )
          return false;
        let left = rect.left,
          right = rect.right,
          top = rect.top,
          bottom = rect.bottom;
        // Ignore viewport position here: previously encountered content can be below
        // the viewport now. Respect canvas/scroll-container clipping, however.
        for (
          let parent = image.parentElement;
          parent &&
          parent !== document.body &&
          parent !== document.documentElement;
          parent = parent.parentElement
        ) {
          const parentStyle = getComputedStyle(parent);
          const bounds = parent.getBoundingClientRect();
          if (/hidden|clip|scroll|auto/.test(parentStyle.overflowX)) {
            left = Math.max(left, bounds.left);
            right = Math.min(right, bounds.right);
          }
          if (/hidden|clip|scroll|auto/.test(parentStyle.overflowY)) {
            top = Math.max(top, bounds.top);
            bottom = Math.min(bottom, bounds.bottom);
          }
          if (right <= left || bottom <= top) return false;
        }
        return true;
      };
      const images = candidates.filter(rendered);
      const excludedUnrendered = candidates
        .filter((image) => !rendered(image))
        .map((image) => ({
          src: image.currentSrc || image.src,
          complete: image.complete,
          reason:
            "No rendered dimensions, hidden visibility, or fully ancestor-clipped at final settle",
        }));
      const decodeErrors: string[] = [];
      let timedOut = false;
      await Promise.race([
        Promise.all(
          images.map(async (image) => {
            try {
              await image.decode();
            } catch {
              decodeErrors.push(image.currentSrc || image.src);
            }
          }),
        ),
        new Promise<void>((resolve) =>
          setTimeout(() => {
            timedOut = true;
            resolve();
          }, 5_000),
        ),
      ]);
      return {
        timedOut,
        excludedUnrendered,
        decodeErrors,
        pending: images
          .filter((image) => !image.complete)
          .map((image) => image.currentSrc || image.src),
      };
    });
    const details = await page.evaluate(() => {
      const visible = (element: Element): boolean => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== "hidden" &&
          style.display !== "none"
        );
      };
      return {
        title: document.title,
        theme: document.documentElement.classList.contains("dark")
          ? "dark"
          : "light",
        headings: Array.from(document.querySelectorAll("h1"))
          .filter(visible)
          .map((h) => h.textContent?.trim()),
        overflow:
          Math.max(
            document.documentElement.scrollWidth,
            document.body.scrollWidth,
          ) - innerWidth,
        overflowElements: Array.from(document.querySelectorAll("body *"))
          .filter(visible)
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left < -1 || rect.right > innerWidth + 1;
          })
          .slice(0, 20)
          .map((element) => ({
            tag: element.tagName,
            className: element.className,
            text: element.textContent?.slice(0, 100),
          })),
        images: Array.from(document.images).map((image) => ({
          src: image.currentSrc || image.src,
          complete: image.complete,
          naturalWidth: image.naturalWidth,
          loading: image.loading,
        })),
        links: Array.from(document.querySelectorAll("a[href]")).map(
          (anchor) => {
            const raw = anchor.getAttribute("href") ?? "";
            try {
              return {
                href: new URL(raw, document.baseURI).href,
                raw,
                invalid: false,
                label: anchor.textContent?.trim().slice(0, 100),
              };
            } catch {
              return {
                href: "",
                raw,
                invalid: true,
                label: anchor.textContent?.trim().slice(0, 100),
              };
            }
          },
        ),
      };
    });
    const obsoleteImageCancellations = canceledImages
      .filter(
        (failure) =>
          !details.images.some((image) => image.src === failure.url) &&
          (scrollEvidence.observedImageUrls.includes(failure.url) ||
            /^https:\/\/(?:[abc]\.)?tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png$/.test(
              failure.url,
            )),
      )
      .map((failure) => ({
        ...failure,
        evidence:
          "Canceled URL was previously observed in an img or is a known OSM tile, and is absent from every final DOM image currentSrc/src",
        previouslyObservedImage: scrollEvidence.observedImageUrls.includes(
          failure.url,
        ),
        knownOsmTile:
          /^https:\/\/(?:[abc]\.)?tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png$/.test(
            failure.url,
          ),
        finalDomImageCount: details.images.length,
      }));
    for (const failure of canceledImages) {
      if (
        !obsoleteImageCancellations.some(
          (ignored) => ignored.url === failure.url,
        )
      )
        failedAssets.push(`${failure.error} ${failure.url}`);
    }
    const invalidLinks = details.links.filter((link) => link.invalid);
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const localOrigin = new URL(baseURL!).origin;
    const internalLinks = [
      ...new Set(
        details.links
          .filter((link) => !link.invalid)
          .map((link) => link.href)
          .filter((href) => new URL(href).origin === localOrigin),
      ),
    ];
    const fragments = internalLinks.filter((href) => {
      const url = new URL(href);
      return url.pathname === new URL(page.url()).pathname && Boolean(url.hash);
    });
    const missingFragments = await page.evaluate(
      (links) =>
        links.filter((href) => {
          let id: string;
          try {
            id = decodeURIComponent(new URL(href).hash.slice(1));
          } catch {
            return true;
          }
          return (
            id &&
            !id.startsWith(":~:text=") &&
            !document.getElementById(id) &&
            !document.getElementsByName(id).length
          );
        }),
      fragments,
    );
    // Live existence requests run only once per route, at the wide/light baseline.
    // External URLs and cross-page fragments are recorded but deliberately not requested.
    const targetStatuses: Array<{ url: string; status: number | string }> = [];
    if (testInfo.project.name === "1440-light") {
      const localTargets = [
        ...new Set(
          [...internalLinks, ...details.images.map((image) => image.src)]
            .filter((href) => new URL(href).origin === localOrigin)
            .map((href) => {
              const url = new URL(href);
              url.hash = "";
              return url.href;
            }),
        ),
      ];
      for (const target of localTargets) {
        if (!existence.has(target)) {
          try {
            const result = await request.head(target, {
              timeout: 8_000,
              maxRedirects: 5,
            });
            const status =
              result.status() === 405
                ? (
                    await request.get(target, {
                      timeout: 8_000,
                      maxRedirects: 5,
                    })
                  ).status()
                : result.status();
            existence.set(target, status);
          } catch (error) {
            existence.set(target, String(error));
          }
        }
        targetStatuses.push({ url: target, status: existence.get(target)! });
      }
    }
    const brokenImages = details.images.filter(
      (image) => image.complete && image.naturalWidth === 0,
    );
    const brokenTargets = targetStatuses.filter(
      (target) => typeof target.status !== "number" || target.status >= 400,
    );
    const violations = axe.violations.map(
      ({ id, impact, description, helpUrl, nodes }) => ({
        id,
        impact,
        description,
        helpUrl,
        nodes,
      }),
    );
    const problems = {
      status: response?.status(),
      intersectionVisibilityIncomplete: scrollEvidence.intersectionTimeouts > 0,
      imageSettleTimedOut: imageSettle.timedOut,
      themeMismatch: details.theme !== testInfo.project.use.colorScheme,
      noVisibleHeading: !details.headings.length,
      overflow: details.overflow > 1,
      pageErrors,
      failedAssets,
      invalidLinks,
      pendingImages: imageSettle.pending,
      imageDecodeErrors: imageSettle.decodeErrors,
      missingFragments,
      brokenImages,
      brokenTargets,
      violations,
    };
    const hasProblems =
      !response?.ok() ||
      problems.themeMismatch ||
      problems.noVisibleHeading ||
      problems.overflow ||
      imageSettle.timedOut ||
      scrollEvidence.intersectionTimeouts > 0 ||
      [
        pageErrors,
        failedAssets,
        invalidLinks,
        imageSettle.pending,
        imageSettle.decodeErrors,
        missingFragments,
        brokenImages,
        brokenTargets,
        violations,
      ].some((items) => items.length > 0);
    const stem = `${entry.pattern.replace(/[^a-z0-9-]/gi, "_") || "home"}-${testInfo.project.name}`;
    writeFileSync(
      path.join(evidenceRoot, `${stem}.json`),
      JSON.stringify(
        {
          template: entry,
          viewport: testInfo.project.use.viewport,
          project: testInfo.project.name,
          details,
          imageSettle,
          encounteredImages,
          scrollEvidence,
          canceledPrefetches,
          obsoleteImageCancellations,
          problems,
          internalTargets: targetStatuses,
          axeIncomplete: axe.incomplete,
          limits: [
            "Representative route per template, not every catalog entry.",
            "Initial and lazily rendered state only; no forms submitted.",
            "Local target HEAD checks only at 1440/light; per-worker cache avoids repeat requests.",
            "External links recorded only; images assessed as browser-loaded, without separate remote probes.",
            "Only same-page fragments checked; cross-page anchors and text fragments untested.",
            "Actual encountered img elements are marked individually, avoiding hidden duplicates with identical URLs. Rendered encountered/eager images receive bounded decode/settle; hidden exclusions are recorded and completed broken images still fail.",
            "Canceled prefetches and canceled images proven absent from the final DOM are separately recorded exclusions; current image and other asset failures still fail.",
            "Axe cannot establish complete WCAG conformance.",
          ],
        },
        null,
        2,
      ),
    );
    if (entry.route === "/" || (hasProblems && claimFailureScreenshot()))
      await page.screenshot({
        path: path.join(evidenceRoot, `${stem}.png`),
        fullPage: false,
      });
    expect
      .soft(
        scrollEvidence.intersectionTimeouts,
        "Image visibility observers completed",
      )
      .toBe(0);
    expect
      .soft(response?.ok(), "Page returns successful HTTP status")
      .toBe(true);
    expect
      .soft(
        imageSettle.timedOut,
        "Encountered images settle within five seconds",
      )
      .toBe(false);
    expect.soft(problems.themeMismatch, "Requested theme applied").toBe(false);
    expect.soft(problems.noVisibleHeading, "Visible h1 exists").toBe(false);
    expect
      .soft(details.overflow, "Document overflow in pixels")
      .toBeLessThanOrEqual(1);
    for (const [name, items] of Object.entries({
      pageErrors,
      failedAssets,
      invalidLinks,
      pendingImages: imageSettle.pending,
      imageDecodeErrors: imageSettle.decodeErrors,
      missingFragments,
      brokenImages,
      brokenTargets,
      violations,
    }))
      expect.soft(items, name).toEqual([]);
  });
}
