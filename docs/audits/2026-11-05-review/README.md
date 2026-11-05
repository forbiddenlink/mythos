# Mythos Atlas review — November 5, 2026

## Result and scope

The app has a coherent illustrated-atlas identity and substantial working infrastructure. The most valuable next work is making its existing learning features more trustworthy and easier to use. This pass fixes confirmed quiz behavior, reading accessibility, and navigation issues. It is **not a complete release sign-off**: local browser execution and server binding were blocked in this session, so the changed UI still needs the repository's Playwright and visual gates.

The checkout was safely fast-forwarded from `7fdcaaef` to `c8573a24` (`main`, release 1.17.0). Existing changes to `apps/web/AGENTS.md` and existing untracked November 4 screenshots were preserved. Changes from this review are local and have not been deployed.

Inventory: **79 page templates, 16 route handlers, 222 unit/integration test files, 26 E2E specification files**, and the visual regression suite. Review included the app's structure, CI, installed framework guidance, recent audit/action plan, quiz logic, comparison semantics, source presentation, teacher navigation, API guards, and production browser samples. Inventory does not mean every line, generated record, or browser state was manually inspected.

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

## Verification

Final full unit/coverage run used **Node 22.23.1**, within the repository's supported major/range, and pnpm 10.34.9. The machine defaults to Node 26; early results from that runtime were superseded by the supported-runtime run. The exact `.nvmrc` patch is 22.22.2.

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

### Follow-up verification in progress

The local sandbox also denies binding specifically to `127.0.0.1:3145`, so changing the bind address does not resolve browser execution. A draft QA branch is being prepared for GitHub-hosted verification of this exact patch. It adds nine browser regression cases for active quiz layouts at 320/390/1440px in both themes, unique catalog-backed answers, suspended-tab expiry/restart, teacher anchor visibility, and source heading/filter semantics. Active quiz screenshots are retained as artifacts.

The existing Firefox/WebKit reader smoke now runs on relevant pull requests and includes quiz expiry. A new template QA workflow runs the existing full template sweep across both themes and three widths in three shards, preserving JSON and failure-image evidence, plus a fresh lockfile advisory scan. The existing 24-scene macOS visual comparison remains unchanged; no baselines have been regenerated. These added checks are not reported as passed until their runs finish.

| Priority | Improvement                                    | Why and acceptance criteria                                                                                                                                                                                                                                                 |
| -------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | Finish verification of this patch              | Run the 26-file E2E suite, template accessibility sweep, and macOS visual gate on a permitted runner. Exercise long quiz names at 320/390px, light/dark feedback, expired background rounds, teacher anchors, and source H2s. Review diffs before updating any screenshots. |
| 2        | Reduce mobile homepage LCP                     | Capture the LCP element and resource breakdown; compare repeat runs and field data if available. Optimize the measured cause while preserving the museum frontispiece and low CLS.                                                                                          |
| 3        | Extend verified reading trails                 | Build out the existing Inanna/Ibeji pattern: a short retelling, an exact source passage with edition/translator, a documented object, and one comparison question. Begin with a small reviewed set rather than blanket source labels.                                       |
| 4        | Make teachers' resources lesson-ready          | Add a few original 15–30 minute lessons with objectives, chosen reading, evidence questions, printable student activity and answer guidance. Verify any claimed standards alignment and age suitability; an automated reading-grade estimate alone is insufficient.         |
| 5        | Close the Quick Quiz learning loop             | Offer a post-round list of missed figures and a route into the existing review deck. The main quiz already has parts of this flow; extend it consistently rather than adding another progress system.                                                                       |
| 6        | Make journeys a signature feature              | Pair the current stop navigation with an optional source-passage view and a clear current-stop focus. Preserve disputed/mythical geography labels and keyboard access. Review the two missing journey covers from the previous audit before commissioning art.              |
| 7        | Finish operational evidence                    | Recheck prior source-map and alert-delivery gaps in the provider dashboards, then verify one actionable error reaches the owner. Do not assume old audit provider settings are still current.                                                                               |
| 8        | Improve source grouping with reviewed metadata | The source catalog has outgrown its hard-coded filters. Introduce explicit, reviewed tradition/type metadata so primary works do not disappear into a misleading academic category.                                                                                         |

## Research and inspiration

- [Getty: Gods, Heroes and Monsters](https://www.getty.edu/education/teachers/classroom_resources/curricula/mythology/) uses museum objects, discussion prompts, teacher background, and lesson plans. Adapt the teaching structure into original Mythos lessons, using the app's existing attributed objects and verified excerpts.
- [Getty lesson-plan index](https://www.getty.edu/education/for_teachers/curricula/mythology/lesson_plan_index.html) makes level, subject, and activity visible before opening a lesson. Apply that discovery pattern to the teachers hub once actual lesson content exists.
- [Perseus Scaife Viewer](https://scaife-reader.perseus.tufts.edu/) provides a primary-text reading environment; [its Odyssey catalog](https://atlas.perseus.tufts.edu/library/urn%3Acts%3AgreekLit%3Atlg0012.tlg002/) distinguishes editions and translations. This supports making edition/translation choices explicit in future reading trails.

These are design/product inferences from the referenced resources, not a claim of affiliation or scholarly review by those institutions. A Library of Congress reference request returned 403 and was not used as inspected evidence.

## Remaining limits

No full content fact-check, screen-reader session, Safari/Firefox E2E run, full-route axe sweep, active security scan, live Oracle model call, real newsletter subscription/send, payment, or production configuration change was performed. Existing source presentation already hides unchecked quotation wording through `CatalogSourceNotes`; the older audit's request to classify every source should not be interpreted as permission to label unverified passages as direct quotations.

The source-review changes and quiz logic have local automated evidence. Final screenshots and interactive validation of the changed build remain outstanding because of the execution restrictions above.

For the unavailable Codacy check, reset its MCP connection. If using GitHub Copilot, verify MCP access in [Copilot settings](https://github.com/settings/copilot/features), including any organization restrictions; contact Codacy support if reconnecting does not restore the server.
