# Mythos Atlas review and next steps — October 8, 2026

## Recommendation

Prioritize dependency correctness, editorial consistency, and evidence about reader behavior. Mythos Atlas already has enough breadth to test whether people find it useful. The next substantial improvement should make a reader's progression from discovery to reading, evidence, practice, and return more dependable.

Keep the existing visual direction. Product/UI and editorial design decisions should go to Claude under the repository's routing instructions; mechanical implementation and verification can stay in Codex.

## Scope and verification

- Local source reviewed at `b8f7a843`; existing untracked audit evidence was preserved.
- GitHub main independently inspected at `8d776cc859f1bf033a9cb4b210cd81757e8d7860`, seven commits ahead. Main has font subsetting, deferred animation/features, tighter bundle budgets, icon cleanup, a DOMPurify override update, and Sentry replay changes. Do not repeat those completed tasks.
- Live browser inspection covered the homepage, plain-spelling name search, Paths, Zeus at 390px, daily myth loading after scrolling, and the mobile Atlas. Search correctly returned Cú Chulainn first for `Cu Chulainn`; the daily myth loaded when its section approached the viewport. The Atlas provides linked textual figures alongside its canvas.
- Local checks used installed Node 22.23.1, compatible with the project's Node 22 runtime family. Exact `.nvmrc` version 22.22.2 is not installed locally.
- Full bounded unit coverage: **143 files / 1,419 tests passed**. Coverage: lines 75.71%, statements 74.48%, functions 78.91%, branches 64%; configured gates passed. The earlier unrestricted run had timeouts under severe machine load and was stopped, then replaced by this completed run.
- ESLint, TypeScript, knip, and image-provenance freshness check passed.
- Repository-wide Biome returned six errors, all in ignored local files: two in `apps/web/audit_codebase_images.js`, four in `design-research/prototypes/*.html`. This is local tooling scope pollution, not evidence of six shipped app defects. Main's [latest Test workflow passed](https://github.com/forbiddenlink/mythos/actions/runs/37738870391).
- Current registry audit of the local production dependency graph: nine advisories, including two high severity. Main's manifests, immutable lockfile, and framework patch were separately inspected to distinguish already-fixed DOMPurify from unresolved Next/source-map-js versions.

No source changes, deployment, actual newsletter submission, payment, or model request was made. This is a broad code/data/health review with targeted live inspection, not an exhaustive browser retest, penetration test, or fresh performance benchmark. Raw check logs are temporary under `/private/tmp/mythos-review/`.

## 1. Fix the dependency upgrade that does not actually resolve — first

At the inspected main commit, `apps/web/package.json:48` declares Next **16.3.8**, but `package.json:79` overrides Next to **>=16.2.11**. The lockfile importer at `pnpm-lock.yaml:190` still installs **16.3.6**, with `next@16.3.6` patched. The security update commit changed only the app manifest.

The 33-line patch fixes an aborted internal-image request/cache hang. It does not implement the remote-image SSRF fix described in the [Next advisory](https://github.com/advisories/GHSA-cjq9-62q9-8jv4), whose patched version is 16.3.8. A green frozen-lockfile install does not prove the declared app version is installed when a root override replaces it.

Main also retains `source-map-js@1.2.1` (`pnpm-lock.yaml:5981`); the [current advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) identifies 1.2.2 as fixed. Presence of this dependency is not proof that an attacker can reach its vulnerable path in Mythos.

**Action:** align the Next override and lock resolution with the patched release; review whether the internal-image patch must be ported or is superseded; update source-map-js; regenerate the lockfile. Add a regression check for the resolved framework version so manifest-only upgrades cannot masquerade as completed security upgrades.

**Done when:** clean frozen installation resolves the intended versions; production audit clears these advisories; production build, image/cancellation regression, CSP, OG routes, bundle budgets, and relevant browser tests pass. Verify the actual deployed artifact separately. The production site's resolved framework version was not established in this review.

## 2. Make the catalog agree with itself

Current local catalog: 359 deities, 37 heroes, 162 stories, 103 creatures, 76 artifacts, 184 locations, 85 sources, 352 relationship records, eight journeys, and 12 collections. There are 27 pantheon records but 26 with deities; the unused `african-pantheon` record explains the different counts.

The strongest concrete example is [Zeus](https://mythosatlas.com/deities/zeus). Its biography and origin name Cronus and Rhea (`apps/web/src/data/deities.json:18–19`), while its generated family FAQ names only Cronus. There is no Rhea deity entry, and the parent edge is only Cronus (`relationships.json:1422`). The FAQ faithfully describes the graph (`src/lib/deity-faq.ts:47`); the problem is incomplete editorial data, not a failed renderer. A generic uncertainty caveat cannot substitute for completing a known missing relationship.

Thirty-five deities have no relationship edges. All 352 relationship records lack structured source/passage identifiers, and nine are marked disputed. Existing tests validate references, types, and minimum graph coverage; these do not establish that claims match the biographies or original sources.

**Action:** review a bounded set of high-traffic figures first; reconcile prose, graph, quiz answers, and FAQ output. Attach source and passage evidence to relationships, with variant-specific alternatives where warranted. Build an exception list for editorial review instead of guessing missing edges from prose automatically.

**Done when:** the first 20 reviewed figures have consistent source-backed parentage and variant handling across every consuming surface, with regression tests for the verified examples.

## 3. Deepen evidence before another broad expansion

Every deity/hero/creature/artifact/location has primary-source notes, and every story has citation sources. That is good structural coverage; it is not the same as claim-by-claim verification.

Structured primary-source excerpts occur on 16 of 359 deities and 11 of 162 stories. Their 40 excerpts are all marked verified in the data; this review did not independently reverify the quotations. Forty-two stories have variants. Of 85 sources, 35 have external URLs and 37 have character links. A missing external URL is not automatically a defect, but a reader still needs a usable edition and locator.

**Action:** upgrade the most-read entries with edition, translator, passage, and links between each significant variant and its evidence. Prefer complete source trails for 20 useful entries over another hundred thin entries. Review living traditions and cross-tradition comparisons with appropriate subject expertise.

**Done when:** readers can identify which text supports a claim, locate the passage, and explain which interpretation is uncertain. Test that task with unfamiliar readers.

## 4. Run the reader study, then improve one complete learning route

The existing `docs/audits/2026-09-23-reader-test-kit.md:1` remains explicitly “not yet run.” Automated tests cannot answer whether first-time readers understand Paths, trust comparisons, or want to return.

Paths already groups themes, journeys, study guides, and personalized reading. Daily myths, quizzes, review, bookmarks, and backup/restore already exist. The useful question is whether these pieces help one person complete a coherent session.

**Action:** run five short sessions with unfamiliar readers, including mobile readers. Ask them to find an unfamiliar myth, explain one source-backed variant, save it, practice, and find it again. Observe without coaching. Choose the most repeated obstacle and improve that route.

**Done when:** at least four of five readers complete the core tasks without help in a follow-up check. Treat this as qualitative evidence, not a statistically representative score.

## 5. Measure useful sessions and verify the return promise

The event contract already includes entry views, search, reading progress, quiz completion, bookmarks, study sessions, newsletter signups, and support (`src/lib/analytics/events.ts:14`). PostHog is consent-gated and autocapture is off (`components/analytics/ConsentGatedPostHog.tsx:67`). There are no explicit path/journey start or completion events in the contract.

**Action:** confirm delivery to Mythos-specific analytics and define one useful-session funnel. Measure reading plus a meaningful follow-on action and seven-day return among consenting readers. Add only events needed to understand path completion and abandonment; use aggregate failure/zero-result search signals without collecting raw search text. Actual analytics delivery, traffic, retention, and search demand were not inspected here, and shared fleet analytics should not be queried broadly.

The app advertises a weekly email myth. Repository code verifies contact/segment signup (`src/lib/newsletter.ts:81`); it does not establish that weekly broadcasts are prepared and sent. This may already be managed in Resend outside the repository.

**Action:** verify the actual weekly editorial/send process and unsubscribe behavior using an authorized test destination. Judge success by delivery and subsequent useful visits, not signup acceptance alone.

## 6. Finish mobile performance and browser confidence with current measurements

The October 1 audit recorded Atlas mobile performance 49, TBT 1,600 ms, and roughly 1.2 MB, plus museum-image cookie findings. These are historical observations, not current field results. Its detail-page backdrop finding no longer matches the current DetailHero implementation and should not be treated as an outstanding fix without remeasurement.

Main has already reduced fonts and initial bundles; its budgets are home 310 KiB, deity 360 KiB, story 350 KiB gzip. Preserve those gains.

**Action:** measure the current deployment on representative mobile conditions and use available consented field vitals. If the 3D Atlas remains slow, evaluate deliberate activation and a lightweight default while preserving its existing linked text alternative. Inspect museum image delivery separately. Run Safari/WebKit and Firefox journeys: Playwright supports them behind `QA_ALL_BROWSERS=true`, but normal CI uses Chromium only (`apps/web/playwright.config.ts:53`).

**Done when:** agreed mobile loading/interaction targets are met on current pages, and reading, search, bookmark persistence, review, export, and sharing work across the supported browsers.

## Suggested sequence

1. **First:** correct resolved dependencies; verify a clean install/build and deployed version. Refresh this checkout without disturbing existing local evidence.
2. **Next:** reconcile the first 20 important entries and establish structured relationship evidence; start reader sessions and confirm analytics delivery concurrently.
3. **Then:** repair the most repeated reader obstacle and test one complete learning route; verify weekly digest operations.
4. **After measurements:** optimize the current mobile bottleneck, expand cross-browser checks, and select source-backed content additions based on observed reader demand.

Defer accounts/cloud sync, a database migration, more AI tools, another visual overhaul, and large unprioritized catalog expansion until evidence justifies them. Browser-local progress already has backup/recovery; cloud sync introduces a real new service and privacy/support responsibilities. The static JSON architecture remains appropriate for the current catalog and request pattern; this review found no requirement that warrants replacing it.

## Implementation record — 2026-10-08

Implemented on `codex/app-next-steps` after the review was approved:

- Next.js now resolves to the exact app pin, 16.3.8, including its rebased image
  disconnect patch. A regression check compares manifest, override, importer
  resolution and installed version; the production dependency audit reports
  zero advisories after the lockfile update.
- Added passage/edition evidence for 33 relationship claims within a bounded
  20-figure Greek review. Added Rhea and the six maternal edges; synchronized
  the learning roster. This does not claim all biographies or the wider
  catalog are fully verified. The review manifest records remaining gaps.
- Family pages display claim-specific relationship sources. Disputed edges
  remain in the full relationship data but are excluded from canonical family
  summaries and quiz answers. Quiz distractors also exclude every possible
  valid relative, including disputed variants.
- Explicit journey-stop and learning-path selection events have bounded
  contracts, catalog validation and delivery-aware responses. Consent
  withdrawal disables capture; reacceptance resumes it. Browser/server
  project and upstream-origin precedence now agree.
- Atlas scene dependencies load only for its existing canvas state. Browser
  network checks verify static reduced-motion/no-WebGL modes skip six scene
  chunks (255,008 gzip bytes), while opt-in and normal canvas still load them.
  Atlas first-load JS now has a 315 KiB gzip CI budget.
- Added scheduled/manual Firefox and WebKit smoke coverage using existing
  reader/recovery cases. Local smoke completed 26 cases successfully.
- Biome honors gitignored prototype/audit output. ESLint rules were preserved.

The PostHog project was checked using aggregate data only: the seven-day
window contained October 1 web-vital events, but no entry, quiz, bookmark or
newsletter events and no later vitals. That is a delivery/measurement gap,
not evidence that no one used the app. Recheck after deploying the fixes;
confirm consented browser events and server captures reach the same dedicated
project before using the funnel to choose features.

Remaining human/external work: run the prepared reader sessions; arrange
bounded subject-specialist review; approve a digest test destination and verify
received delivery/unsubscribe before scheduling broadcasts. The dedicated
newsletter segment exists, but no messages were sent and weekly delivery was
not proven. Operational steps are in `docs/ops/incident-runbook.md`.

Mobile lab evidence and limitations are in
`docs/audits/2026-10-08-mobile-performance.json`. Host contention produced
large timing variance; the deferred-chunk proof is stronger evidence than a
single score comparison. Final release checks are recorded below when complete.

Final local verification: 153 unit files / 1,492 tests passed; gated coverage
76.26% lines, 75.06% statements, 79.26% functions, 65.5% branches. Production
build, full TypeScript, ESLint, knip, image provenance, framework regressions,
override checks and all four bundle budgets passed. Biome passed with existing
90 warnings and 30 informational diagnostics; no rules were relaxed. Firefox
and WebKit smoke: 26 passed. A separate mobile browser check confirmed visible
relationship evidence and navigation to Rhea.
Chromium full suite: 256 passed. Final code review found no remaining major or
critical issues within the changed scope. These are local results, not proof
that the production deployment or its external integrations have been updated.
