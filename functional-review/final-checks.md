# Final verification record

The final verified application runs locally at `http://127.0.0.1:3002`. Port 3000 is also used by a different project; the interrupted `browser-verified.log` run is excluded. The interrupted `browser-verified-3002.log` run used a normal build with the optional Oracle UI disabled; the suite requires `build:ci` to enable its mocked Oracle scenarios. Final verification uses that documented build command. The earlier full `browser-final.log` run found four share fallback failures, which were fixed. Logs are retained as diagnosis history, not represented as passing runs.

| Check                                   | Actual result / evidence                                                                                                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full unit coverage                      | 134 files / 1,369 tests passed; `evidence/unit-final.log`                                                                                                                                               |
| New persistence helper after final edit | 4 passed; `evidence/persistence-final.log`                                                                                                                                                              |
| Breadcrumb regression                   | Reproduced before fix; 5 tests passed after fix; `evidence/breadcrumb-before.log`, `breadcrumb-final.log`                                                                                               |
| ESLint                                  | Full final-source run passed (`lint-complete.log`); targeted sharing/helper and breadcrumb files also passed                                                                                            |
| TypeScript                              | Passed, `evidence/types-final.log`; production build also typechecks                                                                                                                                    |
| Biome changed files                     | Passed with two warnings in `evidence/biome-final.log`: the intentional review retry dependency and pre-existing progress mount effect. Breadcrumb files pass `breadcrumb-biome.log`. No rule weakened. |
| Unused code                             | knip passed, `evidence/knip.log`                                                                                                                                                                        |
| Bundle budgets                          | Home 310.6 KiB, deity 355.0 KiB, story 344.6 KiB gzip; all within configured limits, `evidence/bundle-final.log`                                                                                        |
| All-template browser inspection         | 134 desktop/mobile captures of 66 templates plus invalid-route recovery; no page exceptions, document-width overflow or broken loaded images. `page-evidence.json`, `evidence/pages/`                   |
| Additional complete journeys            | Six passed: desktop/mobile Anki failure/retry with actual file content, PDF download with valid header, review completion and reload persistence. `evidence/exports.json`                               |
| Share failure accessibility             | Desktop/mobile popover scans returned no WCAG A/AA violations; `evidence/recovery-a11y.json`                                                                                                            |

The 1,319-path internal-link inventory found one broken generated breadcrumb. The fix is covered by a failing-then-passing unit test and an additional final browser check. Static manifest/public-file matches establish existence, not complete destination behavior. External citations and payment/provider endpoints were not live-tested.

The final production build passed (`evidence/build-complete.log`), including TypeScript and all 1,950 generated pages. Final browser suite results are appended below. No deployment or real external message/payment occurred.

Repository-wide Biome failed with 3,594 errors: 3,588 in generated `apps/web/playwright-report/index.html`, two in the pre-existing `apps/web/audit_codebase_images.js`, and one each in four earlier design prototypes. Generated reports and prototypes are outside the active application source review. These files were not rewritten and lint rules/ignores were not weakened. See `evidence/biome-summary.json` and `biome-repository.log`.

## Completed browser verification

**246 / 246 browser tests passed in 2.7 minutes** against the final production build on `127.0.0.1:3002` (`evidence/browser-complete.log`). The final build includes the breadcrumb and fallback-focus fixes. All 9 newly added recovery browser cases passed; 4 new persistence unit cases and 1 new breadcrumb case were added (14 new regression cases total). The final breadcrumb browser checks also passed at desktop/mobile (`evidence/breadcrumb-browser.json`). Existing core unit suite coverage passed as listed above; the later breadcrumb change was verified with its complete 5-test unit file rather than repeating the full suite.

No material reproduced functional bug remains unresolved within the tested local scope. Live integrations and exhaustive control/content/device coverage remain limited as stated in coverage.md. The preview remains running on port 3002.

## Repository handoff

The full screenshot archive remains locally under `design-research/`, `auth-review/` and `functional-review/evidence/`; only selected failure/recovery screenshots, inventories, reports and final logs are included in the pull request. Screenshot paths in the detailed inventories refer to that local archive when not present in a fresh checkout. Retired `apps/api` and unrelated local audit utilities are excluded.

## Pre-merge verification

Fresh full unit coverage run: **1,370 tests in 134 files passed**, with all thresholds met (`evidence/premerge-unit.log`). Independent code review found no material runtime/security regression. Its test-artifact finding was fixed by writing recovery screenshots with `testInfo.outputPath`; bulky raw inspection JSON remains in the local archive. Staged-code Biome and secret scan passed. The nine affected recovery E2E tests were rerun after changing their output paths; see `evidence/premerge-recovery.log`.
