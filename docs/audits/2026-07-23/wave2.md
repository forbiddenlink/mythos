# Wave 2 findings — Mythos Atlas (2026-07-23)

Pre-tier + stack-relevant full prompts: a11y, seo, perf/caching, ai/abuse/api/pwa/ratelimit, testing/cicd/obs/gha, content/onboarding/darkmode/env/deploy/legal, gdpr/legaldocs/third-party-scripts, dns/deploy/incident/launchday/busfactor/costaudit.

## Fixed in this wave (code)

| Finding                                            | Fix                                                               |
| -------------------------------------------------- | ----------------------------------------------------------------- |
| Analytics/SpeedInsights before consent             | `ConsentGatedAnalytics`                                           |
| GPC ignored                                        | `hasGlobalPrivacyControl` + banner note                           |
| No Cookie Settings reopen                          | Footer button + event                                             |
| Sentry client before consent                       | `ConsentGatedSentry`; instrumentation-client no longer auto-inits |
| Oracle uncapped output                             | `maxOutputTokens: 800`                                            |
| Quiz route missing Origin                          | Shared `forbiddenUnlessSameOrigin`                                |
| No global AI spend cap / kill switch               | `checkGlobalOracleBudget` + `ORACLE_KILL_SWITCH`                  |
| Hero LCP opacity:0                                 | Static H1 (no framer initial hide)                                |
| Dual `priority` images on deity                    | Background image no longer priority                               |
| Knowledge graph colors pull ReactFlow              | `lib/pantheon-colors.ts`                                          |
| Skip-link under sticky header                      | `scroll-mt-16` on `#main-content`                                 |
| robots.txt 500 (public vs app)                     | Deleted `public/robots.txt`; merged disallows                     |
| Sitemap vs robots conflict                         | Removed `/review`, `/progress`, `/llms.txt` from sitemap          |
| CollectionPageJsonLd on deity detail               | Listing-only via server `deities/page.tsx`                        |
| Soft-404 meta indexable                            | `robots: noindex` in missing-deity metadata                       |
| Wrong Live Demo URL                                | README → mythosatlas.com                                          |
| GHA mutable tags (scorecard/ally/repro/test perms) | SHA pins + `permissions: contents: read` on Test                  |
| Sentry 100% traces                                 | Default sample rate 0.15 via env                                  |
| No a11y statement / AI disclosure                  | `/accessibility` + Oracle `aiDisclosure`                          |
| No incident runbook                                | `docs/ops/incident-runbook.md`                                    |
| vercel install unlocked                            | `--frozen-lockfile`                                               |
| Dark mode native chrome                            | `color-scheme` on `:root` / `.dark`                               |

## Still open (prioritized)

### Medium / deferred

1. Knowledge graph canvas itself still mouse-first (keyboard list fallback now ships)
2. Soft-404 **HTTP status** — metadata is noindex; confirm prod `notFound()` returns 404 status
3. GraphQL still lacks per-IP rate limit (body size + CDN cache headers added)
4. Bus factor / private DSAR email
5. Full content i18n; real PWA/SW; CSP nonces
6. Homepage remains content-dense below the fold

### Fixed since wave2.md first draft

- codeql.yml pinned to SHA
- Coverage include documented as honest scoped gate (+ safe-redirect)
- PWA manifest `display: browser`; dropped false app-capable meta
- Misleading hreflang removed
- Knowledge graph keyboard deity list + region label
- Quiz vs Oracle rate-limit prefixes separated
- GraphQL query size caps + Cache-Control
- Entity not-found metadata helper (`generateNotFoundMetadata`)
- Cookie banner footer scroll-padding
- Upstash misconfig cold-start warning

## Pack coverage this session

**Done:** quick tier + wave2 pre prompts above + gdpr/legaldocs/third-party-scripts + dns/deploy/incident/launchday/cost/busfactor skim.

**Not run / skip for stack:** stripe, supabase, craft, drizzle, prisma, betterauth, msal, resend, paywall-ux, multitenancy, webhooks, agent-commerce.
