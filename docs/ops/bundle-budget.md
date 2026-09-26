# Bundle-size budget

CI fails when the first-load JavaScript of a key route grows past its budget.
The check is `apps/web/scripts/check-bundle-budget.mjs`
(`pnpm --filter web bundle:budget`). It runs in the **E2E Tests** job of
`.github/workflows/test.yml`, right after `pnpm --filter web build`, so it
reuses that build and adds no build time.

## What is measured

For each route the script adds up, gzip-compressed:

- the shared root chunks in `.next/build-manifest.json` (`rootMainFiles`:
  webpack runtime, React, Next's app runtime), and
- every chunk listed for the route's client components in
  `.next/server/app/<route>/page_client-reference-manifest.js`.

Code behind `next/dynamic` / `import()` inside client components is not in
that manifest and does not count. Polyfills (served only to legacy browsers)
are excluded.

For a dynamic route the manifest covers every client component the route
_can_ render, so the number is an upper bound for any one page. On
2026-09-26 the loaded `<script>` tags summed to 319.0 KiB for `/` (exact
match), 845.1 KiB for `/deities/zeus` (manifest: 895.9) and 401.7 KiB for
`/stories/trojan-war` (manifest: 592.9).

## Budgets

| Route             | Measured 2026-09-26 (KiB gz) | Budget (KiB gz) |
| ----------------- | ---------------------------- | --------------- |
| `/`               | 320.3                        | 350             |
| `/deities/[slug]` | 401.9                        | 445             |
| `/stories/[slug]` | 421.4                        | 465             |

Budgets are the measurement plus about 10%. The detail routes are heavy
because several client components import whole JSON catalogs; when that
work lands, re-measure and lower the budgets so the gain cannot regress.

## Running it locally

```bash
pnpm --filter web build
pnpm --filter web bundle:budget
```

## When it fails

1. Look at the table the script prints to see which route grew.
2. Run `pnpm --filter web analyze` to find the new or larger modules.
3. Prefer trimming: lazy-load with `next/dynamic`, move data work to server
   components, or pass only the fields a client component needs.
4. If the growth is intended, raise the budget in both
   `apps/web/scripts/check-bundle-budget.mjs` and the table above, and say
   why in the pull request.
