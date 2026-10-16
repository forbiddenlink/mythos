# Mythos Atlas audit-pack results

Applied audit-prompt-pack v5.2 to Mythos Atlas and repaired six additional confirmed engineering defects. The earlier review-count/deck midnight repairs are retained. All changes are local and uncommitted on `fix/audit-pack-qa`, based on `020e935d0284a19ee59e36ec9a34f7c515a099ef`.

## Repairs

- Consent withdrawal during Sentry loading now prevents initialization; consent restored during shutdown is honored.
- Reading, review and quiz activity after midnight advances the global streak without requiring a reload.
- Overlapping digest jobs use a shared token-owned lease, preventing simultaneous create/send runs. Upstash is now required even for draft creation; missing configuration returns 501.
- The dependency override gate checks all applicable resolved versions and range selectors, with seven regression fixtures.
- Turbo builds preserve service configuration and invalidate cache when local environment inputs change.
- Dependabot merging requires the exact SHA whose checks were inspected.

[Findings, proof and limitations](findings.md) · [Selected module work](modules.md)

## Verification

| Check                    | Result                                                                                                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit tests with coverage | 1,599 passing across 164 files; configured coverage gates pass. Lines 78.07%, statements 76.85%, functions 80.31%, branches 67.87%.                                          |
| Override checker         | Seven fixtures and actual lockfile floor gate pass.                                                                                                                          |
| Shared digest lease      | Actual helper and installed Upstash SDK against local Redis: single concurrent owner, token-safe release, 1,800-second expiry, retry after release.                          |
| Production build         | Root Turbo/webpack build passes; 1,986 static pages.                                                                                                                         |
| Chromium journeys        | All 258 pass on the final production build.                                                                                                                                  |
| Firefox/WebKit journeys  | All 66 pass (33 each) on the final build after installing matching browser revisions. Initial attempt could not launch; its failure log is retained.                         |
| Code checks              | Type check, formatting, knip and Biome pass. Biome retains warnings. Full ESLint passes; its one introduced callback warning was corrected and targeted lint passed cleanly. |
| Workflow checks          | Actionlint schema/syntax passes; optional shellcheck separately reports a pre-existing unused loop variable. No real merge performed.                                        |
| Bundle budgets           | Home 277.0/310 KiB gzip; deity 322.8/360; story 312.3/350; atlas 284.0/315. All pass.                                                                                        |

The full coverage run preceded the final stable-callback alias cleanup; all seven review-provider tests and targeted lint passed afterward, and the final build/type check covers the final source. Final browser journeys disabled telemetry keys and used mocked Oracle behavior.

Earlier same-session evidence is retained in [the initial QA report](../2026-10-16-qa.md): 414 template cases across widths/themes and 1,349 internal destinations checked against generated routes/public assets or HTTP. These were not all rerun after the engineering fixes and are not counted as new final-build tests.

## Remaining limits and next action

No confirmed Critical or reachable application High defect was established in the inspected local scope. Two dependency observations remain: an unpatched development-tool braces advisory and a conditional native libheif follow-up. Their upstream severity, installed versions and application reachability limits are recorded in findings.md.

Production settings, real email/AI delivery, branch protection, alerting, rollback, DNS and legal applicability were not verified. This is a local engineering result; no production-readiness verdict is issued. No code was pushed, merged or deployed, and no real digest or payment was sent.

The pack has 155 catalog items: seven execution/report items inspected, 80 partial, 41 not covered and 27 not applicable. Partial coverage does not imply the full prompt checklist passed. [Full coverage matrix](repo-map.md) · [Provisional gate](gate.md) · [Prioritized action](action.md) · [Run/evidence record](run.md).

Smallest next step: verify the repaired behavior on an owned protected preview with known Upstash configuration before promoting these local changes.
