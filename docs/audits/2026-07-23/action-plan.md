# Action Plan — Mythos Atlas Launch Audit (2026-07-23)

Viability: **NEEDS WORK**. Adversarial: XFF spoof downgraded (Vercel overwrites); Hygraph-client-token claim killed; resolveLocation downgraded (pages use JSON).

## Launch Blockers

- [x] **Upgrade Next.js to 16.2.11 for Jul 2026 security release** — Quick fix (<15 min) (`SEC-01`)
  - Where: `apps/web/package.json (next@16.2.9)`
  - Resolved next@16.2.9 is vulnerable (<16.2.11). pnpm audit reports multiple High GHSAs (incl. rewrite SSRF / image-opt DoS). Fix: pnpm add next@16.2.11 --filter web; re-run pnpm audit.

- [x] **Fix open redirect on /api/preview/exit** — Quick fix (<15 min) (`SEC-02`)
  - Where: `apps/web/src/app/api/preview/exit/route.ts:12-24`
  - Unauthenticated GET accepts redirect= and passes it to new URL() then NextResponse.redirect, allowing absolute external URLs. Also harden /api/preview slug similarly. Fix: allow only same-origin relative paths starting with / and rejecting //.

- [x] **Require Upstash for Oracle rate limits in production** — Small (<1 hr) (`SEC-03`)
  - Where: `apps/web/src/lib/oracle/rate-limit.ts; .env.example:26-27`
  - Without UPSTASH\_\* env vars, rate limiting is per-process Map. On Vercel this multiplies the 10/hr budget across instances and resets on cold start — default spend-abuse path for ANTHROPIC_API_KEY. Fix: fail closed in production if Upstash unset; document required env vars.

- [x] **Wire flagship Knowledge Quiz into ProgressContext** — Small (<1 hr) (`UX-01`)
  - Where: `apps/web/src/components/quiz/MythologyQuiz.tsx:57-187`
  - MythologyQuiz only writes mythos_quiz_highscore localStorage; quick/relationships quizzes update progress. Main /quiz completion does not affect XP/achievements/leaderboard. Fix: call progress APIs on completion like quiz/quick.

## This Sprint

- [x] **Remove false offline claim from install prompt** — Quick fix (<15 min) (`FUNC-04`)
  - Where: `apps/web/src/components/pwa/InstallPrompt.tsx:108-109`
  - InstallPrompt promises offline reading but next-pwa is a no-op. Remove offline copy until SW returns, or re-enable PWA.

- [x] **Short-circuit background sync when no service worker** — Quick fix (<15 min) (`FUNC-03`)
  - Where: `apps/web/src/lib/background-sync.ts:85; next.config.ts:12-15`
  - PWA/SW disabled but registerBackgroundSync awaits navigator.serviceWorker.ready which never settles. Fix: return early unless an active registration exists.

- [x] **Harden Oracle: require Origin + bound message size** — Quick fix (<15 min) (`SEC-04`)
  - Where: `apps/web/src/app/api/oracle/route.ts:68-78,22-30`
  - Origin check skipped when header absent; MessageSchema has no max length/count. Fix: reject missing Origin for POST; add zod .max on content and messages array.

- [x] **Remove or lock down dead Hygraph preview/revalidate surface** — Small (<1 hr) (`SEC-05`)
  - Where: `apps/web/src/app/api/preview/*; hygraph routes`
  - Static-JSON app still ships preview/revalidate/hygraph API routes. Dead attack surface. Prefer delete unused routes per AGENTS.md data path.

- [x] **Add HSTS (and tighten CSP when feasible)** — Quick fix (<15 min) (`SEC-06`)
  - Where: `apps/web/next.config.ts:60-85`
  - headers() omit Strict-Transport-Security. Add HSTS max-age with includeSubDomains. CSP still has unsafe-inline/unsafe-eval (defense-in-depth gap).

- [x] **Fix resolveLocation to match slug like other entity resolvers** — Quick fix (<15 min) (`FUNC-01`)
  - Where: `apps/web/src/app/api/graphql/route.ts:249-251`
  - resolveLocation only checks location.id; deity/creature/artifact/story also match slug. GraphQL location(id: $slug) returns empty data. Fix: id === id || slug === id. Note: location App Router pages import locations.json directly (id-as-slug), so user-facing pages work; bug affects GraphQL API consumers only.

- [x] **Move SEO prose below primary interactive content** — Small (<1 hr) (`UX-02`)
  - Where: `apps/web/src/app/quiz/page.tsx:134-169; bookmarks/page.tsx`
  - Long SEO blocks sit above MythologyQuiz and bookmark grid, pushing core tasks below the fold especially on mobile.

- [x] **Make pantheon detail theme-aware** — Small (<1 hr) (`DES-01`)
  - Where: `apps/web/src/app/pantheons/[slug]/PantheonPageClient.tsx`
  - Hardcoded midnight/parchment cards ignore ThemeProvider light mode used elsewhere.

- [x] **Replace everyone-ICP mission speak with a sharp learner job** — Medium (<4 hr) (`WRITE-02`)
  - Where: `about/page.tsx:68-71; hero`
  - About targets everyone. Pick study-loop ICP and rewrite hero/about to that job.

- [x] **Align Oracle UI visibility with API readiness** — Small (<1 hr) (`FUNC-02`)
  - Where: `LayoutEffects.tsx vs oracle/route.ts`
  - Non-prod shows Oracle without ANTHROPIC_API_KEY → 503 on first message. Gate UI on same condition or surface a clear disabled state.

## Next Sprint

- [x] **Decide: full i18n for content pages OR stop implying locale coverage** — Large (>4 hr) (`WRITE-01`)
  - Where: `HeroSection, about, privacy, terms, contact`
  - LanguageSwitcher exists but marketing/legal/home content is English-only hardcoded; message keys for hero are orphaned. Either wire next-intl or narrow locale UX to Oracle/nav only and document that.

- [x] **Break template features-grid** (deity hero slate/amber → brand tokens: done) — Medium (<4 hr) (`DES-02`)
  - Where: `FeaturesGrid.tsx; DeityPageClient hero`
  - FeaturesGrid is generic icon-card SaaS pattern; deity hero uses slate/amber not brand tokens.

## Backlog

- [ ] **Pin codeql.yml reusable workflow off `@main`** — Supply-chain (wave2)
- [ ] **Widen vitest coverage.include** — Testing gate is decorative (wave2)
- [ ] **Keyboard alternatives for KnowledgeGraph + Leaflet map** — a11y High (wave2)
- [ ] **Verify production soft-404 HTTP status for missing entity slugs** — SEO (wave2)
- [ ] **Drop or implement real locale URL hreflang** — SEO (wave2)
- [ ] GraphQL body size + rate limit (wave2)
- [ ] Locations empty state + progress zero-state CTA (wave2)
- Commercial PMF experiment (viability)
- Full content i18n
- Real PWA service worker
- Live DAST against mythosatlas.com when network allows

- [x] **Triage full-tree gitleaks noise; keep .history out of scans** — Small (<1 hr) (`SEC-08`)
  - Where: `repo root (.history / full-tree gitleaks)`
  - Full-tree --no-git gitleaks reported 49 leaks over ~5GB (likely .history/node_modules). apps/web/src clean. Ensure .history is gitignored and excluded from secret scans; spot-check any tracked hits.

- [x] **Prefer platform IP helper over raw X-Forwarded-For** — Quick fix (<15 min) (`SEC-07`)
  - Where: `apps/web/src/app/api/oracle/route.ts:92-95`
  - Skeptic downgraded spoof risk on Vercel (platform overwrites XFF) but pattern is still fragile if hosting changes. Use request IP from platform API.

## Totals

- Launch blockers: 4 (~2.5h)
- This sprint: 8
- Next sprint: 2
- Backlog: 1

**If you only do one thing:** `pnpm add next@16.2.11 --filter web` then fix `/api/preview/exit` open redirect.
