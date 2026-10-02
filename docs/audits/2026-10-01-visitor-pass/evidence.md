# Visitor pass, 2026-10-01: evidence

Written against: 7e7c63b9 (origin/main). Snapshot, not a living doc.

Method: Playwright 1.63 (Chromium) against https://mythosatlas.com at 390px and
1440px; Lighthouse 13.5 mobile; axe-core 4.13 (wcag2a/aa, 2.1/2.2 aa, best-practice).
"After" numbers come from `next start` of this branch. A/B numbers come from a second
build of origin/main served on the same machine and measured alternately.

## Sweep scope
- Sitemap: 1732 URLs, all HTTP 200 (curl).
- Browser sweep: 136 pages (stratified ~6% of every route group, phone viewport):
  no horizontal overflow, no broken images, no missing alt, exactly one h1, no duplicate ids.
- 1089 distinct internal hrefs found on those pages: all 200 except `/gods-of` (308, intentional).
- Named pages at both widths: home, deity, location, creature, compare, quiz, atlas,
  changelog, search palette. `/search` and `/map` are not routes (404 is correct).

## Findings fixed

| # | Route | Before | After |
|---|-------|--------|-------|
| 1 | every page (footer) | `GET /llms.txt?_rsc=...` 404 + console error on 111 of 136 pages | 0 of 136 |
| 2 | every page (client bundle) | 1 CSP `eval` violation per page load; Lighthouse best-practices 96 | 0 violations; best-practices 100 (4 of 4 A/B runs) |
| 3 | search palette | exact names lose to stories/heroes: 25 of 757 exact-name queries not first (Hera, Prometheus, Theseus, Orpheus, Hou Yi ...) | 0 of 757 (11 new unit tests) |
| 4 | search palette, /deities, /heroes, /locations, /stories, creature/artifact galleries, compare picker | 54 of 60 accented names unfindable by their plain spelling ("Cu Chulainn", "Vainamoinen") | found, and ranked first |
| 5 | /deities, /heroes | axe heading-order (h3 straight after h1) | clean |

Screenshots: `before-search-*.png`, `after-search-*.png`. Lighthouse numbers:
`lighthouse-summary.json`.

## Measured, not fixed
- Home mobile LCP is a CSS background (`/hero-columns.webp`) not discoverable in the initial HTML.
  A `preload()` made it discoverable (resource load delay 193-328 ms to 7-10 ms), but the A/B
  Lighthouse LCP did not move (6.3-6.9 s base vs 6.2-6.5 s fix, host load average 20-70), so it
  was reverted. Needs a quiet machine to judge.
- Detail pages (deity, creature): LCP element is the lazy, blurred decorative backdrop in
  `components/layout/detail-layout.tsx`. `loading="eager"` plus `fetchPriority="high"` on the
  portrait did not move the simulated LCP, so reverted.
- /atlas mobile: performance 49, TBT 1600 ms, 1.2 MB (three.js scene).
- Creature pages hot-link `images.metmuseum.org` images that set third-party cookies
  (Lighthouse "uses third-party cookies", best-practices 77).
