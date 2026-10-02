# Report: distinctive redesign v2 (design/distinctive-v2)

Written against: 7e7c63b9 (origin/main, 2026-10-01). Not pushed, not merged.

## Signature moves
1. Plates: every painting is a mounted plate (ivory mat, gilt keyline, tradition-colour tab).
2. Running heads and Roman section numerals (entity pages and home), footer colophon.
3. Leader-dot index: the home page opens as a title page with one frontispiece plate and an index of all 26 traditions.
Also: entity pages and info pages use a 41rem reading column plus a 26rem marginalia column with a gilt rule.

## Independent scores (fresh-context sonnet reviewer, stills only, 3 rounds)
Before / after average: home 3.0 to 4.4, deities 3.3 to 4.4, Zeus 3.6 to 4.5, Greek pantheon 3.6 to 4.5, Titanomachy 3.6 to 4.4, quiz 3.3 to 4.3, about 3.4 to 4.3, atlas 3.2 to 4.0, family tree 2.8 to 3.6.
Under 4 after: atlas (point of view 3: the reviewed stills use reduced motion, so the star map shows its resting banner) and family tree (craft 3: node text small, wide trees still pan). Both are marked not done.

## Lighthouse mobile, main vs branch, same method (3 runs each)
- Simulated (default throttling), home: main LCP 6.3 to 6.4s, branch 6.1 to 6.2s. Same on /deities/zeus and /stories (about 6.0 to 6.3 both). Perf score 74 to 76 both; a11y 100, best practices 96, SEO 100 both; CLS 0.
- Applied (devtools) throttling, home: main LCP 4.84s (FCP 1.94s), branch 2.12s (FCP 2.12s). /deities/zeus and /stories: 2.1s both.
- Cause of the unexplained 6s: Lighthouse's simulated LCP counts every request issued before the first paint (about 900 KB: 4 fonts 396 KB, 37 script chunks 388 KB, CSS, document) on a 1.6 Mbps link, so it lands near 6s whatever paints. It is a payload ceiling, not a slow element. Separately, on main the home LCP element was a CSS background image (hero-columns.webp, found late, low priority): real 4.84s. The branch replaces it with a priority image: 2.12s.
- Not fixed: the simulated figure. Lowering it needs less first-load JavaScript or smaller fonts (needs-approval.md). First-load JS is identical to main (home 316.3 KB, bundle budget passes).

## Final gate (after last commit 7cd079c2 plus doc commit), exit codes
pnpm lint 0; tsc --noEmit 0; biome:check 0 (84 warnings, 31 infos, same as main); knip 0; build_image_provenance --check 0; pytest scripts/tests 0 (12 passed); vitest coverage 0 (1396 passed); pnpm build 0; bundle:budget 0; e2e 256 passed (0).
Other QA: axe wcag2a/aa/21a/21aa/22aa 0 violations, both themes at 390, on 24 routes; no horizontal overflow at 320/390/768/1280/1920; zero console errors or hydration warnings; no 4xx/5xx on those routes; chromium, firefox, webkit smoke on 3 routes OK; OG image 1200x630 PNG; CSP identical in structure to main.
200% text: two routes regressed (/stories, /stories/titanomachy), fixed; the others that overflow in my crude test overflow on main too.

## Needs approval
See needs-approval.md.

## Not done or caveats
Family tree redesign; atlas star map judged only in its reduced-motion state; no images generated (budget unused); simulated LCP not lowered; analytics: no tracking call, event name or data attribute appears in the diff.
Process note: one pkill by pattern (my own screenshot script) was run by mistake early on; and a port clash (another session on 3464) moved this run's server to 3484.
