# Atlas discovery and visual depth implementation plan

> **For agentic workers:** Use the executing-plans workflow for owned tasks and the parallel-agents workflow for independent domains. Preserve other workers' changes.

**Goal:** Improve discovery, visual exploration, mobile delivery and release confidence without erasing scholarly uncertainty or adding accounts.

**Architecture:** Extend the existing server-rendered catalog and scoped client interactions. Keep raw source data, image provenance, static reading alternatives and existing URLs intact. Load optional visual tools on demand.

**Tech Stack:** Installed Next.js 16.3.8, React 19, Tailwind 4, Radix, Leaflet, Vitest and Playwright; Node 22.23.1 via mise.

**Spec:** User-approved October 18 review in this chat: all six priorities plus artifact inspection, focused relationships and a complete flagship journey. User explicitly permits visual design here.

## Constraints and choices

- Preserve the illustrated-atlas visual identity; no new framework or account system.
- Prefer improvements to existing pages over adding another destination to navigation.
- Use conservative browsing categories without changing raw domain statements.
- New historical claims require inspected primary sources; no guessed artifact labels or forced equivalences.
- Preserve existing untracked research files. Do not access secrets, personal records, CRC or agency client resources.
- No live emails, payments or provider requests in tests. No deployment is implied by local implementation.
- Real participant testing and physical-device/screen-reader testing remain explicit external work, not simulated passes.

## Review focus

1. Old domain URLs and sparse/uncertain traditions remain reachable.
2. Dialog keyboard focus, zoom overflow and closing behavior remain usable at 320px.
3. Relationship traversal reverses direction correctly, terminates on cycles and distinguishes uncited edges.
4. Map/source failures leave meaningful reading alternatives and no invented links.
5. Visual tests are deterministic across fonts, theme, motion and daily content.

## Tasks

- [x] Domain browsing: 72 conservative categories and aliases retain legacy filters and cover all 360 deities. Discoverability tests added.
- [x] Journey experience: quieter regional map, resolved catalog links and source context for all 14 Odyssey stops, keyboard/static reading alternatives retained.
- [x] Source comparisons: three researched additions bring coverage to ten stories; mobile cards and a wrapping dated chronology added.
- [x] Artifact inspection: on-demand accessible zoom dialog, viewport fit, fallback and focus recovery; four museum-supported Nataraja explanations.
- [x] Relationship exploration: focused two-figure path within Family Tree with directed labels, provenance and explicit evidence gaps.
- [x] Reading hierarchy: native family disclosures preserve answers and structured data; checked excerpts retain unrelated catalog source notes.
- [x] Performance implementation and diagnosis: confirmed LCP mask receives an anonymous-CORS preload; frontispiece responsive sizes corrected; bundle budgets pass. Equivalent deployed timing acceptance remains open; no speedup claimed.
- [x] QA infrastructure: six representative screenshot scenes produce 24 width/theme comparisons; 69-template sweep prepared. Functional and data regression tests added.
- [x] Research/evidence: primary-text and content-trust records written; audit report and existing participant kit updated.
- [x] Initial implementation QA verification: Chromium rerun (273 passed), other-engine checks, all 24 unchanged visual comparisons and 414-configuration template coverage recorded. The Firefox context failure and font-cache mechanism were addressed in the subsequent continuation below; production and real participant/device acceptance remain open.
- [x] Independent final review: actionable findings resolved and final source-table desktop light/dark views inspected again.

## Verification record

Baseline from the initial review: 1,681 unit tests, typecheck and ESLint passed. Live mobile Lighthouse performance 81, LCP 5.0s, CLS 0.001, TBT 13ms (one lab run, not field data). No claim of a causal performance fix until diagnostics and comparable measurements support it.

Original implementation verification: 1,715 unit tests across 183 files passed with 80.24% line coverage; TypeScript, ESLint, unused-code checks, production build and bundle budgets passed. The release build covers 1,980 CSP pages. All 273 Chromium functional checks and 24 unchanged visual comparisons passed; all 69 templates received six width/theme checks plus corrected affected-route follow-ups. A browser check confirms one request for the preloaded LCP mask, without establishing a loading-speed improvement. The production dependency audit reported zero vulnerabilities across 726 dependencies. Results and the subsequent Firefox harness diagnosis are recorded in the [audit report](../../audits/2026-10-18-improvements-and-review.md). Continuation verification appears below. No commit or deployment was created.

The producing deployment restored Vercel build cache and invoked Next directly, ruling out a Turbo-only fix for the observed font-query mismatch. Producing-host CSS remains protected by Vercel SSO. Subsequent minimal Next 16.3.8 builds reproduced stale font CSS after reusing a webpack cache across deployment IDs. A guarded filesystem cache-version suffix now includes `NEXT_DEPLOYMENT_ID`; two further fixture builds produced matching CSS/HTML font URLs. This is locally demonstrated cache invalidation, with production cold-browser acceptance still required after deployment. Raw browser/performance evidence stays in ignored `functional-review/evidence/2026-10-18/`; versionable source research is under `design-research/`.

## Subsequent source and cache continuation

- [x] Attach inspected Greek/Norse passages to 24 existing relationships without changing edges or dispute flags. Coverage is now 57/362 (15.7%); 305 lack structured passages. All 70 focused tests, TypeScript and ESLint pass.
- [x] Reproduce stale deployment identifiers in minimal Next builds sharing a webpack cache; verify guarded deployment-ID cache-version invalidation with two new IDs and one font request matching the preload in cold Chromium. Cache reuse remains available for unchanged IDs; deployment-ID changes may lengthen builds.
- [x] Repeat the full unit suite (1,741 tests/184 files), TypeScript, changed-file ESLint and production build (1,980 CSP pages) after continuation edits. Serial unit rerun resolves concurrent-build timeouts without changing limits.
- [x] Correct bundle-budget accounting for chunk URLs with deployment queries/fragments; all four corrected budgets and six framework/script tests pass.
- [x] Record focused continuation browser verification: all nine tile-failure/no-JavaScript/font checks pass in Chromium, Firefox and WebKit (12.57 seconds), with no skips or flaky cases. Independent final script/test review found no actionable issue; final diff whitespace check passes. Earlier broad browser results remain earlier-build evidence.
- [x] Isolate Firefox no-JavaScript context failure to inherited consent storage state. The narrowed empty-storage case retains its no-JavaScript assertions and passes in isolation and the final three-engine run.
