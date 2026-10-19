# Atlas improvements and review — 18 October 2026

The approved improvements are implemented and available in a protected
[Vercel preview](https://mythos-ivmxbsu2r-elizabeth-emersons-projects.vercel.app).
This report records local and preview verification and the remaining evidence
gaps. Production is unchanged. This is not a complete historical fact-check
or a WCAG certification.

## Delivered

- **Discovery:** 72 conservative browsing categories cover all 360 deities.
  Original domain wording and legacy domain links remain supported; uncertain
  and specialized records stay discoverable without inventing classifications.
- **Connection explorer:** the existing Family Tree now includes a focused
  two-figure connection view. It states relationship direction, shows recorded
  evidence and dispute notes, and distinguishes missing evidence from a missing
  connection. A shortest catalog path is not a claim of historical certainty.
  A subsequent evidence pass adds inspected passages to 24 existing Greek and
  Norse relationships, raising structured passage coverage from 33 to 57 of
  362 records (15.7%). A further 17 inspected Egyptian and Japanese passages
  raise coverage to 74 of 362 (20.4%). Both additions preserve existing edges,
  relationship metadata, dispute flags, and earlier evidence.
- **Artwork inspection:** museum images open in a keyboard-accessible dialog,
  fit the viewport, and support zoom, scrolling, reset, image-failure recovery,
  and return focus. Four explanations on the Met's Nataraja follow its
  [museum record](https://www.metmuseum.org/art/collection/search/39328).
  Other works receive no invented annotations.
- **Journey reading:** the map is a quieter regional overview, with reading
  controls outside it and no forced flight between stops. All 14 Odyssey stops
  have checked local references and source locators. Reading remains available
  without JavaScript or map tiles. Existing Gilgamesh audio is optional.
- **Source comparisons:** Prometheus, Medusa, and the Titanomachy bring coverage
  to ten stories. Mobile source cards preserve every comparison field; the
  desktop table has proper headers. A wrapping dated chronology prevents
  overlapping labels. See the [primary-source evidence](../../design-research/myth-versions-source-evidence-2026-10-18.md).
- **Reading hierarchy and provenance:** native family disclosures reduce
  repeated visible text while preserving answers and matching structured data.
  Checked excerpts no longer hide unrelated catalog source notes. The
  [content review](../../design-research/content-trust-review-2026-10-18.md)
  separates verified excerpts from bibliography metadata.
- **Performance:** the measured homepage LCP artwork is preloaded with matching
  anonymous-CORS behavior. The frontispiece declares its actual responsive
  width. A reproduced Next.js font-cache defect now has a deployment-ID cache
  version guard; local fixture builds confirm that new IDs reach both font CSS
  and HTML. The new preview also has matching font preload/CSS URLs. Production
  acceptance remains open. No new dependency or asset service was introduced.
- **Release checks:** isolated screenshot comparisons and a reusable template
  sweep supplement the existing functional tests. The screenshot suite covers
  six scenes at two widths in both themes: 24 references, including source
  evidence cards/table and headings framed below the sticky header. Its local
  platform guard, explicit reference-update command, and narrowly scoped
  rounded-edge color tolerances are documented in the
  [visual regression guide](2026-10-18-visual-regression.md). The participant test script
  now covers the new discovery, inspection, relationship, source, and journey tasks.

## Verification

Local runtime: Node 22.23.1, within the project's pinned Node 22 range. The
following checks ran against local production builds, with external
submission/provider calls avoided. Deployed checks are scoped separately below.
The table distinguishes the original broad browser sweep from subsequent
source-evidence/cache continuation checks. The first continuation has 70 focused
data tests and 1,741 unit tests passing across 184 files (32.57 seconds), with
TypeScript, changed-file ESLint and a fresh 1,980-page CSP build passing. Four
five-second unit timeouts while a build ran concurrently were resolved by a
serial rerun without increasing timeouts. Nine final focused checks passed in
12.57 seconds: tile-failure reading, no-JavaScript reading and font preload reuse
in Chromium, Firefox and WebKit, with no skips or flaky cases. Independent
review of the bundle script and its regression tests found no actionable issue.
After the Egyptian/Japanese addition, all 1,758 unit tests across 184 files
passed in 27.50 seconds; its 87 focused data tests and focused ESLint also passed.
Independent citation review found no actionable issue in those 17 additions.

| Check                               | Result                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit tests and coverage             | Latest continuation: 1,758 tests across 184 files passed. Earlier coverage run: 1,715 tests across 183 files; lines 80.24%, statements 78.98%, functions 81.77%, branches 69.13%. Coverage percentages were not regenerated for the continuation.                                                                                                                                                        |
| Python generation guards            | 12 passed.                                                                                                                                                                                                                                                                                                                                                                                               |
| Image provenance                    | Current; check passed.                                                                                                                                                                                                                                                                                                                                                                                   |
| TypeScript and ESLint               | Passed; final production build also checks TypeScript.                                                                                                                                                                                                                                                                                                                                                   |
| Biome                               | Zero errors; 93 warnings and 29 informational diagnostics. These advisories were not all established as pre-existing.                                                                                                                                                                                                                                                                                    |
| Unused code/dependency check        | Passed.                                                                                                                                                                                                                                                                                                                                                                                                  |
| Production dependency audit         | Zero reported vulnerabilities across 726 dependencies at audit time.                                                                                                                                                                                                                                                                                                                                     |
| Production build and bundle budgets | Continuation release build passes with 1,980 CSP-covered pages. Corrected budget accounting includes deployment-query chunks: homepage 277.0 KiB, deity 330.2 KiB, story 317.7 KiB, atlas 284.0 KiB; all pass. Six framework/script regression tests pass.                                                                                                                                               |
| Chromium functional tests           | Original implementation release build: 273 passed in 1.8 minutes, including one LCP mask request with matching anonymous-CORS preload behavior. Final continuation focused checks are recorded below.                                                                                                                                                                                                    |
| Other browser engines               | Original focused checks: 44/45 passed; 14 further Firefox/WebKit source checks passed in 17.5 seconds. The original Firefox context failure was subsequently diagnosed and fixed. Final continuation: all nine tile-failure/no-JavaScript/font checks passed across Chromium, Firefox and WebKit in 12.57 seconds.                                                                                       |
| Visual regression comparisons       | Original implementation's 24 unchanged comparisons passed in 15.2 seconds without updating references. Only family portrait/connection rounded-edge scenes use color threshold 0.1; all scenes retain zero allowed differing pixels beyond their threshold.                                                                                                                                              |
| All-template sweep                  | All 69 templates at three widths in two themes covered (414 configurations). Initial run: 410 passed, four hidden/clipped-image runner false positives. Corrected selection and visibility checks passed all 18 homepage, family-tree and story follow-ups. Aggregate reports: zero axe violations, overflow cases, page errors, failed assets or bad local targets; 2,317 unique local targets checked. |
| Independent change review           | All actionable findings resolved; final source-table desktop light/dark views inspected again.                                                                                                                                                                                                                                                                                                           |

Raw browser and performance evidence is kept in the ignored
`functional-review/evidence/2026-10-18/` directory. Source tests and reviewed
visual references are versionable. The Vercel preview build completed
successfully; its checks are scoped below. No commit or production deployment
was created.
The original template-sweep evidence remains intact; corrected affected-route
results are labelled `final-followup` in a separate subdirectory.

## Preview deployment

The protected [preview](https://mythos-ivmxbsu2r-elizabeth-emersons-projects.vercel.app)
is ready (deployment `dpl_Cu72GjKXFe14FBquQptvwHWPeTjP`, target `preview`).
It was uploaded from the uncommitted working tree based on `4eb89a70`, including
the reviewed source additions and deployment exclusions. It is not a release
of an exact Git commit. Vercel completed the build in 2 minutes 56 seconds using
Next 16.3.8, pnpm 10.34.6 and Node 22. The project engine selected Node 22 over
the hosting default of Node 24; no hosting setting was changed.

Eight deployed route checks returned HTTP 200 with expected content: the home
page, Shiva, Odyssey, Perseus/Medusa, Family Tree, Divine Domains, Amaterasu and
Isis. Both preloaded fonts have exactly matching CSS URLs containing this
preview's deployment identifier. This establishes URL parity on this preview;
a remote cold-transfer count has not been measured. A normal in-app browser
visit also showed the Japan connection from Amaterasu to Ame-no-Uzume, including
the new Kojiki XVI edition metadata and passage link. In the deployed Shiva
artwork inspector, zoom changed from 100% to 150% and reset to 100%; the hand
drum explanation was present, and Escape closed the dialog and returned focus
to its trigger. Screenshots of both interactions are retained with the ignored
evidence. These checks do not replace the earlier local browser suite or
participant validation.

Deployment exclusions now omit generated visual-test output, local visual
assets and screenshot references. The packaging check contained 2,552 files
and 343,920,142 bytes, a reduction of 59,503,291 bytes from the earlier manifest.
No nonempty environment, QA-output, generated-evidence or reference-asset files
matched the checked exclusion patterns. These are manifest-check quantities,
not a claim of the final upload's exact byte count.

## Findings that need follow-through

1. **Production font duplication:** the live page preloads two fonts with one
   deployment query while its CSS requests identical bytes with an older query.
   The measured extra transfer was about 94.5 KiB. Current Turbo automatically
   hashes the deployment identifier; a missing explicit environment entry is
   not the cause. The producing deployment restored Vercel's build cache and
   ran Next directly from `apps/web`, without Turbo. Initial unauthenticated
   CSS requests redirected to Vercel SSO. Subsequent authenticated CLI access
   returned HTTP 200 for three CSS files on that producing deployment. Its
   preloads used deployment ID `dpl_5tY…`, while its CSS font URLs used
   `dpl_BeBD…`, confirming the mismatch on the producing host as well as the
   custom domain. Full identifiers and responses are recorded in the ignored
   `protected-production-font-comparison.json` evidence.
   Subsequent minimal builds using installed Next 16.3.8 reproduced the local
   mechanism: two deployment IDs sharing a webpack cache produced the first
   ID in font CSS and the second in HTML. Next's font loader embeds the ID,
   while its webpack cache configuration omits it. The existing webpack hook
   now appends `NEXT_DEPLOYMENT_ID` to the filesystem cache version when both
   are present. Two further fixture builds with different IDs produced matching
   font CSS/HTML URLs. This follows
   [webpack's cache-version invalidation contract](https://webpack.js.org/configuration/cache/#cacheversion).
   A cold Chromium navigation of the fixed fixture requested its font once at
   the preload URL. The guard preserves the existing cache version and reuse
   when the ID is unchanged; changing IDs invalidates the webpack cache and may
   lengthen deployment builds. Independent review found no actionable issue in
   this continuation.
   It proves the local mechanism and remedy, not that the live deployment is
   fixed. The new protected preview has matching preload/CSS font URLs; its
   remote cold-transfer count remains unmeasured. Production acceptance remains
   matching preload/CSS font URLs and one cold transfer per font after a
   production deployment. Protection settings are unchanged; authenticated
   CLI tooling handled access to protected deployment responses.
2. **Performance acceptance:** early LCP request discovery is demonstrated;
   the final browser check also confirms a single mask request. Overall speed
   improvement is not demonstrated. Live and local Lighthouse runs differ in
   protocol, image cache, and server conditions. Compare equivalent deployed
   measurements before claiming faster loading. The current diagnostic is in
   `functional-review/evidence/2026-10-18/home-performance-diagnosis.md`.
3. **Source depth:** 74 of 362 relationship records (20.4%) now have structured
   passage evidence; 288 still lack that field. Sixteen deity entries have
   source-status-labelled excerpts. The added evidence supports its
   specific relationships, without verifying whole biographies or all variants.
   Continue using verified locators and translations before adding large
   quantities of generated content. Existing bibliography fields alone do not
   verify every claim; the linked content review records deliberately unresolved
   relationship details.
4. **Real reader validation:** run the updated
   [participant script](../../design-research/usability-test-script.md) with five
   people, including phone users. Physical-device and screen-reader testing
   remain separate from automated browser checks. No participant results have
   been invented.

The earlier Firefox no-JavaScript harness failure was subsequently isolated to
inherited consent storage state. Giving that case an empty context storage state
retained its no-JavaScript assertions and passed the isolated Firefox check in
3.8 seconds. The final three-engine focused run then passed all nine cases.
These subsequent passes do not retroactively change the earlier 44/45 result.

Continuation review also found that bundle-budget accounting ignored route
chunks with deployment query strings, falsely reporting 130.5 KiB/four chunks
for every route. The script now strips URL queries/fragments before filtering
and deduplicating filenames. Its regression is covered in the existing framework
test suite, and the corrected route totals above still satisfy their budgets.

## Research basis and limits

Historical additions use inspected primary translations listed in the linked
evidence document. Technical decisions use installed framework documentation,
[LCP optimization guidance](https://web.dev/articles/optimize-lcp), the
[CSS masking fetch requirement](https://www.w3.org/TR/css-masking-1/#security),
and [Playwright screenshot guidance](https://playwright.dev/docs/test-snapshots).
The template sweep checks representative routes, not every generated URL or
every interactive state. It records automated accessibility findings, overflow,
runtime failures, loaded images, local links, and same-page fragments. External
link destinations and cross-page fragments are not exhaustively crawled.

Read-only API inspection found bounded input, same-origin, rate-limit, and
failure handling in the inspected search, quiz, and newsletter routes; see the
content review for exact scope. It was not an exhaustive penetration test or
live provider integration test.
