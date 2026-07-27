# Phase 0 — Lighthouse Baseline (BEFORE)

**Captured:** 2026-07-26 (against live production https://mythosatlas.com/)
**Tool:** lighthouse MCP 12.8.2 · **Device:** desktop · throttling on

## Scores

- **Performance: 30 / 100** (0.30)
- Accessibility: **100 / 100** (already excellent — do not regress)

## Metrics

| Metric                       | Value        | Score    |
| ---------------------------- | ------------ | -------- |
| First Contentful Paint       | 1.6 s        | 0.47     |
| **Largest Contentful Paint** | **10.9 s**   | **0**    |
| **Total Blocking Time**      | **2,800 ms** | **0**    |
| Time to Interactive          | 13.6 s       | 0        |
| Speed Index                  | 6.0 s        | 0.01     |
| Cumulative Layout Shift      | 0.003        | 1 (good) |

## Read

- The site is accessible (100) and layout-stable (CLS 0.003) but performance-critical:
  LCP 10.9s and TBT 2.8s. Main-thread saturation (three simultaneous blurred orbs +
  live R3F canvas + tsparticles, all on the LCP screen) is the prime suspect for both.
- **LCP 10.9s is severe and specific** — investigate the actual LCP element during
  execution (likely the hero, but confirm it isn't a late-loading image/font). The
  `<h1>` is server-rendered visible, so a 10.9s LCP suggests the LCP node is something
  else (hero-columns.webp overlay, or paint blocked behind hydration/3D).

## Regression gate

Phase 0 "after" (Task 6) must show Performance ≥ 30 and ideally ≥ 90 desktop;
Accessibility must stay 100.
