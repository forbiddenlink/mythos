# Mythos Atlas review — November 5, 2026

## Result and scope

The app has a coherent illustrated-atlas identity and substantial working infrastructure. The most valuable next work is making its existing learning features more trustworthy and easier to use. This pass fixes confirmed quiz behavior, reading accessibility, and navigation issues. Local server/browser execution was restricted, so the patch was pushed to a draft PR and tested on GitHub-hosted runners, with separate Vercel preview walkthroughs. Final hosted results and remaining limits are recorded below.

The checkout was safely fast-forwarded from `7fdcaaef` to `c8573a24` (`main`, release 1.17.0). Existing changes to `apps/web/AGENTS.md` and existing untracked November 4 screenshots were preserved. The fixes are on `codex/quiz-reliability-qa-20261105` in [draft PR #293](https://github.com/forbiddenlink/mythos/pull/293). Previews of commits `4b3541f` and `6cda744d` were built and inspected; production has not been changed. The completed hosted results below supersede the initial local execution limits; the detailed history is retained at the end of this report.

Inventory: **79 page templates, 16 route handlers, 223 unit/integration test files, 27 E2E specification files**, and the visual regression suite. Review included the app's structure, CI, installed framework guidance, recent audit/action plan, quiz logic, comparison semantics, source presentation, teacher navigation, API guards, and production browser samples. Inventory does not mean every line, generated record, or browser state was manually inspected.

## Completed verification

All five hosted workflows completed successfully for application commit **`de6c8452eb4aa7b02098e826ab663350db97a08d`**. Later changes in this PR only persist quiz screenshots and update this report; they do not change application behavior.

| Gate                                       | Completed result                                                                                               | Evidence                                                                                              |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Unit/integration and coverage              | **2,144 passed in 223 files**                                                                                  | [Test workflow](https://github.com/forbiddenlink/mythos/actions/runs/42035604364)                     |
| Full Chromium E2E                          | **290 passed**; no flaky results reported                                                                      | Same Test workflow                                                                                    |
| Firefox and WebKit journeys                | **30 passed**, including expired rounds and visible/focused manual-copy recovery                               | [Browser workflow](https://github.com/forbiddenlink/mythos/actions/runs/42035604209)                  |
| Template accessibility/layout/assets/links | **474 passed** across 79 templates, 320/768/1440px, both themes; shard 1 passed on a job retry after a timeout | [Template QA, attempt 2](https://github.com/forbiddenlink/mythos/actions/runs/42035604205/attempts/2) |
| Visual comparison                          | **24 passed** against original references; existing comparison settings retained                               | [Visual workflow](https://github.com/forbiddenlink/mythos/actions/runs/42035604393)                   |
| Lint, types and other static gates         | Passed, including Biome, knip, framework pin, image provenance and Python guard tests                          | Test workflow                                                                                         |
| CodeQL                                     | Passed                                                                                                         | [CodeQL workflow](https://github.com/forbiddenlink/mythos/actions/runs/42035605226)                   |
| Registry dependency advisories             | Passed (`pnpm audit --json` exit 0); native-library issue #178 remains separate                                | Template QA workflow                                                                                  |
| Production build and bundle budgets        | Passed; the final application preview is READY                                                                 | Test workflow and preview below                                                                       |

[Review the application preview](https://mythos-bu3fbvqzs-elizabeth-emersons-projects.vercel.app). It is built from the verified application commit above. Production has not been deployed by this review.

The template retry did not omit cases, increase time limits, or exclude rules. Intermediate runs also showed two tiny visual differences on unrelated scenes and a separate axe timeout; their causes have not been isolated. The successful results do not erase this test-stability follow-up. Exact pixel diagnostics were added for future visual failures.

The final evidence-only correction writes each active quiz screenshot to a concrete test output path before attachment and makes a missing screenshot upload fail visibly. Earlier successful Chromium runs did not retain these screenshots because the GitHub reporter kept body attachments in memory; no artifact is claimed for those runs. Subsequent screenshots are available under the PR's `quick-quiz-layouts` artifact with seven-day retention.

## Changes made

| Finding                                                           | Evidence                                                                                                                                                                                       | Local change                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Quick Quiz can mark another valid answer wrong                    | Wrong answers were selected by different deity ID alone. The current catalog has 31 entries with the exact domain `war`, before aliases.                                                       | New question generator excludes all names matching the selected domain, uses existing domain aliases, deduplicates answer names, skips uncertain/blank domains, and requires four distinct options. Questions explicitly refer to the atlas's catalog. |
| Answering can extend the 60-second round                          | The countdown effect depended on score and restarted its one-second interval after correct answers.                                                                                            | Round deadline is based on elapsed wall-clock time; answers cannot restart it. Inputs received after the deadline are rejected.                                                                                                                        |
| Feedback from an old round can affect a restarted round           | Untracked 800ms question-advance timeout survived round completion and restart.                                                                                                                | Advance timer is cleared at completion, restart, and unmount.                                                                                                                                                                                          |
| Browser storage errors can interrupt the quiz                     | Legacy high-score reads and writes were unguarded; malformed values could become `NaN`.                                                                                                        | Guarded storage access and nonnegative safe-integer validation. Results remain usable if storage is unavailable.                                                                                                                                       |
| Answer feedback is hard to read and not announced                 | Two fixed columns, no text wrapping override, dimmed disabled controls, and green text intended for a light surface.                                                                           | Stacked phone answers, wrapping, minimum target height, readable dark-mode success color, labelled answer group, and live textual correction.                                                                                                          |
| No recoverable state when questions cannot be generated           | Empty data could enter the playing state without a question.                                                                                                                                   | Keep the introduction visible and link to the quiz hub.                                                                                                                                                                                                |
| Progress values were only visual                                  | The shared Progress wrapper removed `value` before forwarding props to Radix, so assistive technology received an indeterminate state. Quick Quiz and bookmark reading bars also lacked names. | Forward the real value, label those two uses, express quiz time in seconds, and add determinate/indeterminate regression tests.                                                                                                                        |
| Source headings skip a level                                      | Production DOM is H1 followed by H3 for each source; card default is H3. Lighthouse accessibility score was 98.                                                                                | Source cards explicitly use H2. This confirms and fixes a real semantic defect; the limited Lighthouse tool did not expose individual audit failures, so the score's exact cause is not asserted.                                                      |
| Sources filter misrepresents its catch-all group                  | `Scholarly Reference` includes every work absent from a hard-coded list, including primary works.                                                                                              | Rename to `Other works & scholarship`; label the grouping `Collection`. More precise catalog classification remains editorial work.                                                                                                                    |
| Teachers must scroll past 26 worksheets to reach tools and guides | Production page and source order place both sections after all worksheet cards.                                                                                                                | Add visible section shortcuts with anchor offsets for the sticky header.                                                                                                                                                                               |
| Comparison summary can imply an attribute is shared by everyone   | Four-figure Sky Gods comparison lists War although only some selected figures have that catalogued domain.                                                                                     | Explain that highlights apply to at least two selected figures and do not establish a shared origin.                                                                                                                                                   |

The generator avoids ambiguity **within recorded domains and known aliases**. It cannot prove the scholarly completeness of the underlying catalog or recognize every historical synonym.

## Initial local verification

The initial full unit/coverage run used **Node 22.23.1**, within the repository's supported major/range, and pnpm 10.34.9. The machine defaults to Node 26; early results from that runtime were superseded by the supported-runtime run. The exact `.nvmrc` patch is 22.22.2.

| Check                                                 | Result                                                                                                                                                                                                                            |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full unit/integration suite and coverage gates        | **2,139 tests passed in 222 files**. Includes 16 new regression cases.                                                                                                                                                            |
| Coverage of configured modules                        | Statements 83.53%; branches 74.29%; functions 85.73%; lines 85.29%. This is the configured library/provider scope, not the whole UI.                                                                                              |
| Quiz regressions                                      | Ambiguous alternatives and aliases; duplicate names; uncertain/empty pools; 250 deterministic real-catalog questions; rapid-answer timing; wrong-answer feedback; denied storage; malformed scores; restart cleanup; late inputs. |
| Production build                                      | Successful supported-runtime build, including static generation and CSP hashes. Rebuilt again after the final Sources edit.                                                                                                       |
| TypeScript                                            | `tsc --noEmit` passed after the build.                                                                                                                                                                                            |
| ESLint                                                | No errors; two existing warnings in `AetherScene.tsx` and `CurrentYear.tsx`. Changed quiz code has no new warning.                                                                                                                |
| Framework verification                                | Six script tests passed; manifest, override, and installed Next.js 16.4.3 agree.                                                                                                                                                  |
| Image provenance                                      | `python3 scripts/build_image_provenance.py --check` passed.                                                                                                                                                                       |
| Built HTML                                            | Sources renders H1 followed by H2 source cards; all three teacher shortcuts resolve to existing section IDs in the generated page.                                                                                                |
| First-load JS budgets                                 | All four configured routes pass: home 286.4 KiB gzip, deity template 345.2, story template 334.2, atlas 293.8.                                                                                                                    |
| Biome                                                 | No errors; existing warnings/informational diagnostics remain.                                                                                                                                                                    |
| Knip                                                  | Passed; existing redundant `i18n.ts` entry-pattern hint remains.                                                                                                                                                                  |
| Fresh dependency advisory scan                        | **Blocked**: registry DNS/network access unavailable. Prior audit results are not reused as a fresh clean scan.                                                                                                                   |
| Python image-generation tests                         | **12 passed** using the installed Python 3.12.14 environment with pytest 9.1.1. The default Python lacked pytest; the supported alternate environment resolves that gap.                                                          |
| Local E2E, whole-template axe sweep, visual snapshots | **Blocked**: server startup returned `listen EPERM`; Playwright Chromium launch was denied by the macOS sandbox. Existing baseline images were not regenerated.                                                                   |
| Codacy                                                | No Codacy MCP tool was available in this session. ESLint, TypeScript, Biome, unit tests, and build were used; no Codacy result is claimed.                                                                                        |

Reproducible commands from the repository root:

```sh
pnpm --filter web test:coverage --maxWorkers=4
pnpm --filter web lint
pnpm --filter web build:ci
pnpm --filter web exec tsc --noEmit
pnpm --filter web bundle:budget
pnpm biome:check
pnpm knip
node --test apps/web/scripts/verify-framework.test.mjs
node apps/web/scripts/verify-framework.mjs
python3 scripts/build_image_provenance.py --check
```

Use the supported Node version. Run type checking after a build completes: Next rebuilds its generated type files, so these two operations should not run concurrently.

## Production browser review

Connected Chrome was used for fresh rendered inspection. Desktop and 390px phone views were inspected, with light and dark samples. These were the **deployed baseline**, not the un-deployed patch.

| Area                       | What was checked                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Home                       | Desktop and phone hero, primary calls to action, illustration/museum attribution, visual hierarchy.                 |
| Deities and Zeus           | Mobile filtering, no-results state, clearing filters, searching Zeus, opening its detail page.                      |
| Quick Quiz                 | Mobile introduction and active question; code and regression tests establish the correctness and timing defects.    |
| Compare                    | Mobile setup and the four-figure Sky Gods preset; shared attributes and individual descriptions.                    |
| Teachers and Paths         | Resource order, worksheet density, section discovery, collections and study-guide entry points.                     |
| Journeys and Odyssey       | Desktop index, journey entry, stop list, source links, map/reading relationship, both themes.                       |
| Sources                    | Desktop list, collection labels, source heading hierarchy.                                                          |
| Family tree                | Loaded genealogy, figure labels, zoom/pan controls, sibling/parent display.                                         |
| Atlas                      | Loaded star field and textual tradition directory.                                                                  |
| Stories and focused reader | Catalog shell and rendered Perseus/Medusa reading content.                                                          |
| Mobile navigation          | Menu opens with the current section marked, closes successfully, and the focused reader returns to its story entry. |
| Locations                  | Rendered catalog/filter/map shell; separate Lighthouse audit.                                                       |
| Review                     | Confirmed initial loading resolves to due cards and review-session entry point.                                     |
| Progress and bookmarks     | Existing saved state renders. No personal data reset or destructive storage changes were performed.                 |

Visual judgment: preserve the museum-led home, readable serif typography, illustration attribution, and focused reader. These are distinctive strengths. Keep improving navigation and educational accuracy before adding decorative effects. The graph/atlas labels merit a dedicated phone, keyboard, reduced-motion, and contrast review; a desktop screenshot alone cannot validate all graph interaction states.

The authenticated browser displayed a PostHog toolbar. Treat that as review-session context, not evidence that ordinary visitors see it.

## Fresh Lighthouse baseline

Raw evidence is in [lighthouse.json](./lighthouse.json). Lighthouse 13.4.1, mobile emulation, production URLs, November 5. Scores are lab samples, not field Core Web Vitals or full WCAG certification. Performance was measured only on the homepage, independently of the later parallel category checks.

| Route           |  Performance | Accessibility | Best practices | SEO |
| --------------- | -----------: | ------------: | -------------: | --: |
| `/`             |           83 |           100 |            100 | 100 |
| `/quiz/quick`   | Not measured |           100 |            100 | 100 |
| `/teachers`     | Not measured |           100 |            100 | 100 |
| `/deities/zeus` | Not measured |           100 |            100 | 100 |
| `/compare`      | Not measured |           100 |            100 | 100 |
| `/sources`      | Not measured |            98 |            100 | 100 |
| `/locations`    | Not measured |           100 |            100 | 100 |

Homepage metrics: FCP **1.7s**, LCP **4.5s**, total blocking time **60ms**, CLS **0.003**. The main measured weakness is LCP. Identify the actual LCP element and its request/render timing before changing image quality, preloads, fonts, or animation. No performance gain from this patch is claimed.

## Recommended next work

### Verification approach

The local sandbox also denies binding specifically to `127.0.0.1:3145`, so changing the bind address does not resolve browser execution. PR #293 provides GitHub-hosted verification of the patch. It adds ten browser regression cases for active quiz layouts at 320/390/1440px in both themes, unique catalog-backed answers, suspended-tab expiry/restart, teacher anchor visibility, source heading/filter semantics, and manual sharing recovery after browser API failure. The final screenshot-persistence correction retains active quiz screenshots as artifacts; earlier body-only attachments were not uploaded.

The existing Firefox/WebKit reader smoke now runs on relevant pull requests and includes quiz expiry. A new template QA workflow runs the existing full template sweep across both themes and three widths in three shards, preserving JSON and failure-image evidence, plus a fresh lockfile advisory scan. The existing 24-scene macOS visual comparison remains unchanged; no baselines have been regenerated. Each completed result is tied to its code revision below.

| Priority | Improvement                                    | Why and acceptance criteria                                                                                                                                                                                                                                         |
| -------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | Review and release the verified fixes          | Review PR #293, its preview and the final evidence below. Deploy through the normal release workflow after review.                                                                                                                                                  |
| 2        | Reduce mobile homepage LCP                     | Capture the LCP element and resource breakdown; compare repeat runs and field data if available. Optimize the measured cause while preserving the museum frontispiece and low CLS.                                                                                  |
| 3        | Extend verified reading trails                 | Build out the existing Inanna/Ibeji pattern: a short retelling, an exact source passage with edition/translator, a documented object, and one comparison question. Begin with a small reviewed set rather than blanket source labels.                               |
| 4        | Make teachers' resources lesson-ready          | Add a few original 15–30 minute lessons with objectives, chosen reading, evidence questions, printable student activity and answer guidance. Verify any claimed standards alignment and age suitability; an automated reading-grade estimate alone is insufficient. |
| 5        | Close the Quick Quiz learning loop             | Offer a post-round list of missed figures and a route into the existing review deck. The main quiz already has parts of this flow; extend it consistently rather than adding another progress system.                                                               |
| 6        | Make journeys a signature feature              | Pair the current stop navigation with an optional source-passage view and a clear current-stop focus. Preserve disputed/mythical geography labels and keyboard access. Review the two missing journey covers from the previous audit before commissioning art.      |
| 7        | Finish operational evidence                    | Recheck prior source-map and alert-delivery gaps in the provider dashboards, then verify one actionable error reaches the owner. Do not assume old audit provider settings are still current.                                                                       |
| 8        | Improve source grouping with reviewed metadata | The source catalog has outgrown its hard-coded filters. Introduce explicit, reviewed tradition/type metadata so primary works do not disappear into a misleading academic category.                                                                                 |

## Research and inspiration

- [Getty: Gods, Heroes and Monsters](https://www.getty.edu/education/teachers/classroom_resources/curricula/mythology/) uses museum objects, discussion prompts, teacher background, and lesson plans. Adapt the teaching structure into original Mythos lessons, using the app's existing attributed objects and verified excerpts.
- [Getty lesson-plan index](https://www.getty.edu/education/for_teachers/curricula/mythology/lesson_plan_index.html) makes level, subject, and activity visible before opening a lesson. Apply that discovery pattern to the teachers hub once actual lesson content exists.
- [Perseus Scaife Viewer](https://scaife-reader.perseus.tufts.edu/) provides a primary-text reading environment; [its Odyssey catalog](https://atlas.perseus.tufts.edu/library/urn%3Acts%3AgreekLit%3Atlg0012.tlg002/) distinguishes editions and translations. This supports making edition/translation choices explicit in future reading trails.

These are design/product inferences from the referenced resources, not a claim of affiliation or scholarly review by those institutions. A Library of Congress reference request returned 403 and was not used as inspected evidence.

## Remaining limits

### Functional coverage and its boundaries

| Area                                                 | Evidence in this review                                                                                                                       | Boundary                                                                                  |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Catalogs, detail pages, search, comparison, journeys | Production walkthrough, Chromium journeys, template sweep, catalog integrity suites                                                           | One representative URL per page template; not every generated record or editorial claim   |
| Reading, bookmarks, progress, review, backups        | Browser journeys plus persistence, migration, denied-storage, restore and midnight-boundary tests                                             | Local browser data; no cross-device account sync is claimed                               |
| Quizzes and sharing                                  | Unit timing/answer/storage cases, real-catalog question checks, active layouts in both themes, suspended-clock and failed-share browser cases | Answers follow recorded domains; live AI-generated quiz quality is not established        |
| Family tree, knowledge graph, atlas                  | Browser samples, keyboard escape tests, relation/path/layout unit suites, template accessibility checks                                       | Automated semantics are not a substitute for a full screen-reader or touch-device session |
| Newsletter, Oracle, analytics and request guards     | Existing API/unit suites cover validation, consent, budgets, rate limits and recovery with controlled providers                               | No real email sent, paid model call, webhook delivery or production incident exercised    |
| Responsive and visual behavior                       | 320/768/1440px template matrix in both themes; 320/390/1440px active quiz; existing 24-scene visual suite                                     | Browser viewport emulation and selected scenes, not every physical device                 |

### Existing native dependency follow-up

The successful npm advisory scan does **not** resolve [issue #178](https://github.com/forbiddenlink/mythos/issues/178). A fresh local inspection still resolves sharp **0.35.5**, libvips **8.18.7**, and libheif **1.23.5**; the local build reports AVIF input support. The [upstream libheif security release](https://github.com/strukturag/libheif/releases/tag/v1.23.6) is 1.23.6, while the [sharp changelog](https://sharp.pixelplumbing.com/changelog/v0.35.5/) still identifies 0.35.5 as its newest listed release at inspection. Next's remote image patterns are restricted to two Met Museum paths. This is evidence for retaining the existing investigation, not proof of remotely exploitable production exposure. The deployed Linux binary, exact decoder availability and hostile-input reachability still need controlled inspection; no custom native replacement was introduced.

No full content fact-check, screen-reader session, penetration test, live Oracle model call, real newsletter subscription/send, payment, or production configuration change was performed. Firefox/WebKit coverage consists of the selected reader and recovery journeys, not the entire Chromium suite. The template sweep covers representative URLs in all 79 templates, not every catalog entry. Existing source presentation already hides unchecked quotation wording through `CatalogSourceNotes`; the older audit's request to classify every source should not be interpreted as permission to label unverified passages as direct quotations.

Production and preview screens were inspected in the browser. CI retains visual failure artifacts; the final evidence correction adds reliable active-quiz screenshot uploads. The browser blocked a GitHub artifact download host, so pixel images from that failed transfer were not visually reviewed or used to approve new baselines. Exact pixel diagnostics were added to the visual workflow; comparison rules and reference images remain unchanged.

For the unavailable Codacy check, reset its MCP connection. If using GitHub Copilot, verify MCP access in [Copilot settings](https://github.com/settings/copilot/features), including any organization restrictions; contact Codacy support if reconnecting does not restore the server.

## Hosted follow-up and fixes

First hosted revision (`4b3541f`) results:

- [Test run](https://github.com/forbiddenlink/mythos/actions/runs/42027427083): lint/types/static checks passed; **2,141 tests in 223 files** passed with the same coverage percentages above. Chromium E2E: **287 passed, 2 failed**, both active-quiz light-mode timer contrast (2.2:1 versus 4.5:1).
- [Visual regression](https://github.com/forbiddenlink/mythos/actions/runs/42027427063): **24 passed**, with unchanged reference images.
- [Firefox/WebKit journeys](https://github.com/forbiddenlink/mythos/actions/runs/42027427304): passed.
- [Template QA](https://github.com/forbiddenlink/mythos/actions/runs/42027427600): **458 passed, 16 failed**. All failures were `label-content-name-mismatch`, concentrated in deity relationship edges, family-tree buttons, and knowledge-graph nodes. The fresh registry advisory scan passed (`pnpm audit --json` exited zero and its artifact was retained).
- [CodeQL](https://github.com/forbiddenlink/mythos/actions/runs/42027427900): passed.

The follow-up fixes use the existing accessible gold token for the timer, preserve question-count announcements when progress percentages are forwarded, give family relationships names containing their visible relationship text, separate family-node descriptions from visible names, and insert a text boundary between knowledge-graph names and domains. The full template sweep remains enabled with no excluded rules.

Score sharing now falls back from a failed native share to clipboard copying, then to a labelled manual-copy field. Cancellation is respected; successful copying is announced; transient copy feedback is cleared on restart/unmount. Three new unit cases and a browser failure-path case cover this flow. The focused local run passed **16 quiz/progress tests**, and existing family-tree suites passed **14 tests**. There are now ten new browser cases.

Manual preview inspection confirmed stacked/wrapping answers and correct/incorrect feedback at 390px dark and 320px light, a completed 60-second round, teacher anchors landing below the header, and corrected source headings/filter at 1440px. The weak light-mode timer contrast was visible and then independently confirmed by the browser test. Preview testing used a deployment-only ignored-build override because the project normally skips non-production builds.

Revision `6cda744d` passed all **474 template checks**, **2,144 unit/integration tests**, static gates and CodeQL. Subsequent browser testing found two further issues in the added recovery case: its original alert locator also matched Next's route announcer (fixed by scoping to main), then the manual-copy field was outside the phone viewport. The UI now focuses, selects and explicitly scrolls that field into view after a failed share (WebKit did not reveal it through focus alone); the test requires focus and viewport visibility. The focused component suite passes **14 tests**.

The visual checks passed 24/24 on the first revision. Later runs differed by three pixels on the dark desktop home scene, then ten pixels on the dark desktop journey scene. These are recorded as failures, not silently accepted or attributed to a specific rendering cause. Exact-pixel diagnostics are now available in CI logs without changing baseline comparison rules.

The `6cda744d` preview walkthrough confirmed the darker timer, stacked answers and correct feedback at a 320px viewport, plus knowledge-graph search and family-tree rendering/descriptions. The dense all-figure graph still presents an opportunity: make the existing Explore mode easier to discover, then show a selected figure's immediate connections before adding cross-pantheon parallels.

Revision `06654a30` passed all 24 visual comparisons against the original references. The same run had 473/474 template cases pass, with one `/games/memory` axe analysis exceeding the 90-second test limit; no accessibility violation was reported by that timed-out case. Its Firefox/WebKit run passed 29/30, leaving the WebKit recovery-field visibility issue. Revision `de6c8452` adds an explicit instant scroll and reruns the complete checks with all template rules retained.

The final `de6c8452` Firefox/WebKit run passed **30/30**, and its visual run passed **24/24** with unchanged reference images and comparison settings. Its first template attempt passed 473/474; the teachers page at 320px dark timed out during the scroll traversal. The single failed shard passed all 158 cases on retry, completing 474/474 across the three shards. The earlier timeout is retained in the history; its cause has not been isolated.
