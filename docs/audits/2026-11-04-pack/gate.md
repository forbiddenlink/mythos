# Mythos Atlas release gate

Snapshot as of 2026-11-05, main `1a6f7219` (PRs #288, #290 merged). Tier: full. Verdict: **Go**. No Fail rows; Partial rows are listed in the action plan.

## Core

| Row                                            | State   | Evidence                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary flow end to end                        | Pass    | CI E2E (Playwright, production build, Ubuntu) green on #289 merge `b988e108` and on #288 head `4f37e395`; last 5 main runs green                                                                                                                                                                                                                                                |
| Loading, error, empty states triggered         | Partial | E2E covers search empty state and quiz miss; Oracle error path covered by unit tests only, Oracle flag is off in prod                                                                                                                                                                                                                                                           |
| No reachable High/Critical advisory            | Pass    | `pnpm audit --audit-level=high`: "No known vulnerabilities found" (run 2026-11-04)                                                                                                                                                                                                                                                                                              |
| No secrets in client bundles or history        | Pass    | precheck NEXT_PUBLIC_ name scan clean; gitleaks pre-commit hook on every commit; only public-by-design NEXT_PUBLIC_ values                                                                                                                                                                                                                                                      |
| Server mutations validate input in the handler | Pass    | `oracle`, `search`, `quiz`, `newsletter`, `newsletter/confirm`, `analytics/events`, `csp-report` read through `readJsonBody` with a byte cap and 413 path; `analytics/events` checks `isAnalyticsEventName` (route.ts:62); ingest cap added in #289. `newsletter/webhook` capped at 64 KB in #290 (`2bd76313`). Cron routes take no body; their `CRON_SECRET` check not re-read |
| Data isolation                                 | N/A     | No accounts; progress and bookmarks live in the visitor's own localStorage                                                                                                                                                                                                                                                                                                      |
| Payments                                       | N/A     | Stripe payment links only, no webhook or entitlement in this app                                                                                                                                                                                                                                                                                                                |
| Error tracking live, alert reaches a human     | Partial | Sentry receives events; alert delivery to a human never proven (OPS-008); source maps not uploaded (OPS-002)                                                                                                                                                                                                                                                                    |
| Rollback path known and tested                 | Pass    | Vercel instant rollback; `ORACLE_KILL_SWITCH` documented; the vercel.app redirect change was applied and verified live this session                                                                                                                                                                                                                                             |
| Backups and restore                            | N/A     | No user data stored server-side; content is git-tracked JSON                                                                                                                                                                                                                                                                                                                    |
| Privacy policy and terms linked                | Pass    | `/privacy` and `/terms` linked from the footer (crawl: both 200)                                                                                                                                                                                                                                                                                                                |
| audit-crawl: links, page errors, axe           | Partial | Prod crawl of 80 pages: brokenInternal 0, pageErrors 0. Its "axeViolations 0" is NOT evidence: the site CSP blocked the crawler's injected script. Separate run, @axe-core/playwright 4.14 on `/deities/zeus` and `/locations`: 0 button-name and link-name violations. Full WCAG axe across routes: not inspected                                                              |
| audit-slop                                     | Pass    | precheck slop section; findings fixed in earlier PRs (see findings-product.json)                                                                                                                                                                                                                                                                                                |

## Product and content

| Row                                 | State   | Evidence                                                                                   |
| ----------------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| Mobile 390px                        | Pass    | Visual suite has reviewed 390 light and dark baselines, zero-tolerance diff, green on #288 |
| No fabricated stats or testimonials | Pass    | `/support` counts read live from the data files (#282)                                     |
| Custom favicon, OG image, 404       | Pass    | crawl.md and visual screens                                                                |
| Time and DST                        | N/A     | Only the daily myth rotates by date; no expiries                                           |
| Long and extreme content            | Partial | Visual scenes cover long deity pages; not stress-tested with synthetic extremes            |
| No stale data after mutation        | N/A     | Static content, no server mutations of shown data                                          |
| Design judged against spec          | Pass    | Visual findings judged against `design-system.txt` and `.impeccable.md`                    |

## Security

| Row                                   | State         | Evidence                                                                                                                                                                     |
| ------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Security headers on deployed response | Pass          | `curl -sI https://mythosatlas.com`: nonce CSP, HSTS 2y preload, X-Frame-Options DENY, referrer and permissions policies present                                              |
| Rate limits on expensive endpoints    | Pass          | Oracle and newsletter use Upstash buckets that fail closed in production                                                                                                     |
| Auth                                  | N/A           | No authentication                                                                                                                                                            |
| Uploads                               | N/A           | No uploads                                                                                                                                                                   |
| AI endpoints capped with kill switch  | Pass          | Per-IP limits fail closed in production (rate-limit.ts:186-228), daily request and token caps, `ORACLE_KILL_SWITCH`; Oracle refused server-side while the public flag is off |
| Server-only modules                   | Pass          | No service-role keys exist; provider keys read only in route handlers                                                                                                        |
| Supply chain                          | Pass          | Lockfile committed; `--frozen-lockfile` in test.yml:32/78/114, visual.yml:54, browser-smoke.yml:42; every `uses:` pinned to a 40-hex SHA (reviewer grep)                     |
| Active scan (DAST)                    | Not inspected | Not run; recorded as a coverage gap                                                                                                                                          |

## Stack

| Row                                                       | State   | Evidence                                                                                                                          |
| --------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Supabase, Stripe subscriptions, auth library, ORM, Python | N/A     | Not installed                                                                                                                     |
| Production env vars complete                              | Partial | `.env.example` lists every variable the code reads; `SENTRY_AUTH_TOKEN` unset in Production (OPS-002); orphan Axiom var (OPS-007) |

## Coverage gaps

- Full-route WCAG axe sweep (the crawler's axe was blocked by CSP).
- Active DAST scan.
- Proven alert delivery to a human (OPS-008).

## Review

Fresh-context reviewer (Sonnet, 2026-11-04) checked every Pass row. Verdict: rows held except two. The server-mutation row moved to Partial (uncapped webhook body), then back to Pass once #290 merged; and the supply-chain citation was corrected. Not re-read by the reviewer: Oracle daily cap code, cron auth code.
