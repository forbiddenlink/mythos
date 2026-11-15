# Audit pack run: 2026-11-15

Snapshot as of 2026-11-15. Written against: ab0e6419 (branch `fix/qa-pass-2026-11-15`, uncommitted working tree).
Mode: repair-and-verify. Nothing pushed, merged, deployed or sent.

## Gate

**GO for a pull request.** No open blocker or high finding in the code. The coverage gaps below are not passes.

| Check                              | Result                                   |
| ---------------------------------- | ---------------------------------------- |
| `tsc --noEmit`                     | exit 0                                   |
| `pnpm lint`                        | exit 0                                   |
| `pnpm biome:check`                 | exit 0 (114 warnings, unchanged)         |
| `pnpm knip`                        | exit 0                                   |
| Prettier on changed files          | clean                                    |
| `vitest run --maxWorkers=2`        | 243 files, 2329 tests pass               |
| `pnpm --filter web build`          | exit 0, 1999 prerendered pages           |
| Production crawl (120 pages)       | 0 broken internal links, 0 page errors   |
| Static link check (all 1999 pages) | 4 broken links found, fixed, re-verified |

## Fixed (evidence rung in brackets)

1. **Daily myth: the correct answer was the fourth option in 367 of 372 questions.** `src/lib/seeded.ts` lost precision in the generator multiply and read its weakest bits. Now 97 / 84 / 97 / 94 across the four positions, read from the rebuilt `/api/daily-myth`. Regression test in `daily-myth.test.ts`. [5] Side effect: the daily rotation order and daily challenges shift once on deploy.
2. **Four dead kin links** (`/deities/theseus`, `aeneas`, `arjuna`, `cu-chulainn`): hero relatives now link to `/heroes/...` through `kinHref` in `src/app/deities/[slug]/page.tsx`. All four resolve 200 on the rebuilt site. [5]
3. **Search prefix ranking**: "ze" listed maize gods above Zeus. Title-prefix bonus plus prominence in `src/lib/search-engine.ts`; Zeus is first in the palette. Test added. [5]
4. **Duplicate "Searching…" row** in the command palette removed (`GlobalSearch.tsx`). [5]
5. **Deity titles with parentheticals**: "Tuoni: Finnish God of Death and Underworld". [5]
6. **Compare page descriptions** were identical boilerplate; each now leads with the pair's own basis sentence. [5]
7. **Meta description cuts** no longer end on a dangling word (`lib/seo/description.ts`). [4]
8. **Over-long titles and descriptions** on guides, teachers, timeline, facts, paths, cosmology, oracle and the layout fallback. `/teachers` had no share image and now uses the site image. [5 for teachers, 4 for the rest]
9. **Quick quiz on a phone**: the round now scrolls into view on start, so the first question is not under the fold. [5]
10. **Copy**: five "No origin is told." filler lines removed from `deities.json`; em dashes removed from `creatures.json`, the artifacts page and two progress components. [4]
11. **Translations**: new test proves es, fr and de carry exactly the English keys. [4]
12. Stale comment in `src/i18n/request.ts` corrected.

## Independent review

A fresh-context reviewer on a different model read the diff with instructions to refute it. Verdict: no blocking finding in six areas. Two low-severity notes, accepted:

- A word that follows punctuation ("Kalevala" in "Finnish (Kalevala)") now ranks as a mid-word match in search.
- `/teachers` shares the generic site image, not a page-specific one.

## Rejected after checking

- "Three buttons with no accessible name" on deity pages: they are the citation copy buttons and carry screen-reader text.
- "Relationship endpoints unguarded": covered by `referential-integrity.test.ts:107-192`.
- Blank star map on `/atlas`: the browser pane was throttling animation frames. The map drew once frames ran.
- "Loading today's myth" stuck on the home page: it loads on scroll, by design.

## Open, not fixed

- Mobile cookie banner covers the bottom of the open nav menu and the lower quiz answers until dismissed.
- Language switcher translates the chrome only; article text stays English (the control's label says so).
- "Athtar: Canaanite God of Morning Star" reads oddly (needs an article).
- First keystrokes after opening search for the first time were dropped once. Not reproduced.
- `next.config.ts:2` imports `withSentryConfig` from a path that Sentry v11 removes.
- Shell runs Node 24.22.3; the repo pins 22.x.
- Carried from the earlier pack, not started: CODE-008 (15 duplicate dependency pins), STRAT-009, STRAT-012, STRAT-004, STRAT-005, STRAT-010.
- Owner-only: OPS-001/002/005/006/007/008/010, STRAT-003 (Giving Tuesday appeal, 2026-12-01), VIS-005, editorial STRAT-006/007/013/015.

## Not covered

- **Accessibility scan (axe)**: did not run. The app's content security policy blocked the crawler's script. "0 violations" in `crawl.md` is not a pass.
- **gitleaks and semgrep** timed out; **trivy** failed. Only osv-scanner completed (clean).
- No dynamic security testing. The security review was a read of the diff only.
- Newsletter sign-up, Oracle chat and the generated story quiz were not submitted, to avoid a real send or a paid model call.
- Translation quality was not judged; only key parity.
- Hands-on browser pass covered about 40 routes at desktop and 375px. Playwright end-to-end specs were not run.
