# Reviewed visual regression references

The separate `apps/web/playwright.visual.config.ts` configuration runs 24 Chromium viewport comparisons: six scenes at 390 × 844 and 1440 × 900 in light and dark themes. Scenes cover the homepage, Zeus’s family reading section, the Osiris source chronology, its source evidence cards/table, a directed Athena-to-Zeus Connection chain, and the Odyssey’s selected Cyclopes stop. These are bounded viewports, not full-page images. Section captures leave the sticky header's height plus 24 pixels above the target so headings remain visible. The separate evidence scene makes the mobile source cards part of the regression coverage.

References live under `apps/web/visual/__screenshots__/`, separated by named width/theme projects. The regular `e2e` directory and its Linux workflow do not discover this suite.

Use macOS 26 ARM64, the repository’s Node 22 runtime, frozen pnpm lockfile, and the Chromium revision installed by this repository’s Playwright. Both the local configuration and the `macos-26` GitHub workflow reject another OS major version or architecture. OS patch versions, fonts, and browser revisions can still change rendering. Inspect unexpected differences and create a reviewed matching reference when appropriate; do not widen pixel tolerances to hide platform differences. See [Playwright’s platform guidance](https://playwright.dev/docs/test-snapshots).

The suite fixes the date, timezone, locale, theme, viewport, and pixel ratio; requests reduced motion; waits for fonts and visible image decoding; disables screenshot animations; and removes the pointer from hover targets. Only remote OpenStreetMap raster tiles are replaced with a deterministic transparent PNG. Route lines, markers, controls, source text, and reading content remain unmasked.

Every scene allows zero differing pixels beyond its color threshold. Four scenes use threshold `0`; only `deity-family.png` and `family-connection.png` use `0.1` because repeated captures on the same Mac/browser varied at rounded clipping edges. These narrowly scoped tolerances do not provide a general pixel-count allowance (`maxDiffPixels: 0`). The suite is not described as literally bit-identical.

## Generate and review references

Build the production application first. The visual configuration always owns its production server on port 3118 and fails if that port is occupied; it never builds. Use `VISUAL_PORT=3119` for a separate available port.

The visual server sets `VIPS_CONCURRENCY=8`, which Next 16.3.8 halves to four Sharp workers in production, matching the reviewed references. Sharp's AVIF encoder produces different bytes at different worker counts: the hosted run `39231899093` used one worker, and its homepage portrait payloads were reproduced exactly locally at that count. Four workers reproduce the existing reference cache payloads. The suite clears only generated `.next/cache/images` before starting its server because those cache keys omit encoder concurrency. These controls apply only to the visual server. The family scene deliberately tests a warmed navigation: it decodes the priority Zeus portrait, reloads, decodes it again, and then scrolls. Chromium can choose a responsive candidate while parsing a lazy image before its download begins; decoding immediately before scrolling alone did not stabilize the first cold run. Warming the portrait before parsing makes Chromium consistently reuse its larger candidate for the central medallion. The homepage remains a cold navigation, and the real portrait images remain unmodified.

From the repository root, using the installed Node 22.23.1 runtime:

```sh
mise exec node@22.23.1 -- pnpm --filter web exec playwright install chromium
mise exec node@22.23.1 -- pnpm --filter web build:ci
mise exec node@22.23.1 -- pnpm --filter web visual:update
```

Review every newly generated PNG at both widths and themes, including legibility, clipped content, portrait placement, and citation/directional labels. Then run an unchanged comparison:

```sh
mise exec node@22.23.1 -- pnpm --filter web visual
```

Commit approved PNGs alongside their UI change. Use `VISUAL_PORT` to select another local port, consistently for both server and test commands. To inspect discovery without starting a browser or server:

```sh
mise exec node@22.23.1 -- pnpm --filter web visual --list
```

The configuration uses `updateSnapshots: "none"` locally and in CI: missing and changed references fail. Only the explicit `visual:update` command overrides this to write references. Failed comparisons retain traces and expected/actual/diff screenshots in `visual-test-results/`, plus the HTML report under `playwright-report/visual/`; CI uploads both on failure. The output directory is separate from regular functional-test results so another suite cannot clear its evidence. Download those artifacts before deciding whether a change is intentional. References are never regenerated or accepted automatically by CI.
