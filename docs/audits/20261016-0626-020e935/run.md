# Mythos audit-pack run

- Pack: /Volumes/LizsDisk/_reference/audit-prompt-pack.html, v5.2, 155 items.
- Repo: /Volumes/LizsDisk/mythos; main; 020e935d0284a19ee59e36ec9a34f7c515a099ef; dirty with prior QA fixes and pre-existing research outputs.
- Scope: apps/web and root build/CI supporting it. No other live app.
- Mode: repair and verify, authorized by original request to fix/improve and follow-up to apply pack.
- Target: local production build; external advisory reads only. No production mutations, sends, deployment or secret values. A frozen-lockfile install with package scripts disabled synchronized local tooling; no manifest/lockfile changes.
- User goal: readers browse/read/search, retain learning and review; optional Oracle/newsletter must respect consent and bounded operations.
- Audience/device priority/brand tone: not supplied; no design/brand changes.
- Time: finish applicable coverage once; unknown live-service settings stay uncovered.
- Prior evidence: docs/audits/2026-10-16-qa.md; 1585 units, 321 browser checks, 414 template cases. Reuse unchanged results, distinguish initial build from final rebuilt checks.
- Old .audit-report.md is August 12 and stale; not evidence for current dependencies. Precheck fallback uses live pnpm audit and source inspection, avoids tool secret-prefix scans.
- Run folder remains untracked; .gitignore untouched.

## Confirmed repair plan

1. Sentry consent import/shutdown races, regressions.
2. Progress streak rollover during continued activity, regression.
3. Weekly digest shared concurrency guard and safe failure/retry, regressions.
4. Override verification same-major and selector false greens, fixture regressions.
5. Turbo environment/cache inputs and SHA-bound Dependabot merge, dry-run/config validation.
6. Fresh-context review, relevant checks, coverage matrix, action and provisional release gate.

Independent read-only reviews confirmed candidates; findings deduplicated by root cause. Advisory braces3.0.3 is in ESLint dependency path, no public request path established and no patched version published. No arbitrary dependency upgrade.

## Completed checks before final browser run

- 1599 unit tests in164files passed on pinned tooling, coverage gates met.
- Seven override fixture tests pass; actual lockfile floor verification passes.
- Actual newsletter lock helper + Upstash SDK tested through local HTTP bridge against empty Redis; atomic acquire, stale release, TTL1800 and retry passed. Redis stopped, no persistence.
- Dummy provider env values produced identical Turbo hashes before repair and distinct hashes afterward; .env.local became a tracked build input. Values were fake and no real env file values were displayed.
- Independent four-area reviews and skeptic follow-up found no introduced blocker.
- Initial lint found one callback dependency warning; corrected by capturing stable updateStreak function. Targeted lint and provider regression rerun.
- Initial coverage under concurrent load exposed lazy-import scheduling race in test. Sync act now commits visibility before separate async import settlement; full pinned coverage passes.
- Shellcheck-enabled actionlint reports pre-existing SC2034 unused loop variable. Schema/syntax actionlint with shellcheck disabled passes; no workflow rule was weakened.
- Environment-manifest name scan blocked by command guard; no sensitive file values read. Coverage records manifest inspection as not performed.

## Final verification and working state

- Work moved from main to local branch `fix/audit-pack-qa`, at the same base commit. Changes remain uncommitted; pre-existing research outputs are preserved.
- Final root production build passes: 1,986 static pages and CSP hashes for 1,962 pages. Browser telemetry keys were disabled for final journeys; Oracle UI was enabled for mocked tests.
- All 258 Chromium tests pass on that build, including both mobile midnight journeys.
- Final type check, formatting, bundle budgets, Biome and knip pass. Biome retains existing warnings; full ESLint passed with one introduced dependency warning, then targeted ESLint passed cleanly after its correction.
- Bundle sizes: home 277.0/310 KiB gzip, deity 322.8/360, story 312.3/350, atlas 284.0/315.
- First final Firefox/WebKit attempt could not launch: the pinned Playwright browser revisions were absent. Matching Firefox and WebKit installed; rerun recorded separately. This was an environment failure, not 66 demonstrated app defects.

- Final Firefox/WebKit rerun: all 66 tests pass (33 per browser) in 2.9 minutes. Final browser total is 324 passing tests; no retries used to mask test failures.
- Report structure checked: 155 unique catalog dispositions, required report files present; final diff whitespace check clean.
