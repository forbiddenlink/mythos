# CLAUDE.md

This file provides guidance to agents when working with code in this repository.

**Design system:** before generating any UI, read `apps/web/public/design-system.txt` (machine-readable token + component contract). Token SoT = `apps/web/src/app/globals.css`; philosophy = `.impeccable.md`.

## Project overview

Mythos Atlas is an interactive mythology encyclopedia. Live site: https://mythosatlas.com

It's a **pnpm + Turborepo monorepo** with two apps:

- **`apps/web`** - Next.js 16 (App Router) + React 19 frontend. Serves a GraphQL API from a Next.js route handler backed by static JSON data files. This is the primary app where most development happens.
- **`apps/api`** - Rust (Axum + async-graphql + SQLx) backend targeting PostgreSQL. Secondary/optional; mirrors the GraphQL API.

In practice, the web app is self-contained: its `/api/graphql` route handler reads directly from JSON files in `src/data/`, so the Rust API is not required for local development.

## Stack

- Next.js 16.3.4, React 19.2.8, TypeScript 6.0.3 (web app)
- pnpm 10.34.5 (`packageManager` field enforced), Turborepo
- Node v22.22.2 (see `.nvmrc`)
- Biome (`biome.json` at root) alongside ESLint/Prettier via Husky + lint-staged
- Rust (Axum, async-graphql, SQLx) for the optional `apps/api`

## Commands

Run from the monorepo root unless noted.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local  # add ANTHROPIC_API_KEY / Upstash for Oracle

pnpm dev                              # starts all apps via Turborepo (web on :3000)
pnpm --filter web dev                 # start only the web app

pnpm build                            # build all apps
pnpm --filter web build               # build only web (uses the configured --webpack plugin pipeline)

pnpm lint                             # ESLint for the web app
pnpm --filter web exec tsc --noEmit   # TypeScript type check (web)

pnpm --filter web test                # Vitest unit tests, run once
pnpm --filter web test:watch
pnpm --filter web test:coverage       # thresholds: 80% lines/functions/statements, 70% branches
pnpm --filter web exec vitest run src/__tests__/lib/search.test.ts   # single file

pnpm --filter web e2e                 # Playwright, headless Chromium (builds and starts production server on :3000)
pnpm --filter web e2e:ui

pnpm --filter web analyze             # webpack bundle analyzer (sets ANALYZE=true)

pnpm biome:check
pnpm biome:fix
```

Rust API (optional; requires Rust toolchain + PostgreSQL via docker-compose):

```bash
docker compose up -d                # Postgres on port 5435
cd apps/api && cargo watch -x run   # dev server on :8000
cargo test
cargo check
```

## Layout

- `apps/web/src/app/` - Next.js App Router pages, including `api/graphql/route.ts` and `api/oracle/route.ts`
- `apps/web/src/data/` - static JSON content: `pantheons.json`, `deities.json`, `stories.json`, `creatures.json`, `artifacts.json`, `locations.json`, `relationships.json`, plus game/progress data (`achievements.json`, `challenges.json`, `collections.json`, `journeys.json`, etc.)
- `apps/web/src/types/Entity.ts` - entity types (`Deity`, `Creature`, `Artifact`, `Story`, `Pantheon`, etc.) - the GraphQL route imports Zod-inferred types from `src/lib/schemas.ts`; keep these consistent with the entity interfaces
- `apps/web/src/components/ui/` - shadcn/ui components (new-york style), configured via `apps/web/components.json`
- `apps/web/messages/` - next-intl translation messages (en, es, fr, de)
- `apps/web/e2e/` - Playwright specs
- `apps/web/src/__tests__/` - Vitest unit tests, mirroring `src/` structure
- `apps/api/` - Rust backend (optional)
- `docs/` - project documentation

## Conventions

- **Path alias**: `@/*` maps to `apps/web/src/*` (tsconfig.json, vitest.config.mjs)
- **Provider stack** (`src/app/layout.tsx`): `NextIntlClientProvider > ThemeProvider > QueryProvider > BookmarksProvider > ProgressProvider > ReviewProvider > LeaderboardProvider > AchievementNotificationProvider`, then `Footer` (renders `FooterTools`, which gates the Oracle chat button on `NEXT_PUBLIC_ORACLE_ENABLED === "true"`) and `GlobalClientAddons` (command palette search, PWA/analytics hooks, optional install prompt). Progress, bookmarks, and achievements persist to localStorage via their providers.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)
- **Branches**: `feature/*`, `fix/*`, `docs/*`
- **Pre-commit**: Husky runs lint-staged (ESLint --fix + Prettier on staged `.ts`/`.tsx` files)
- **Unused vars**: ESLint allows unused vars prefixed with `_`
- **Build**: production builds use `next build --webpack` for the configured plugin pipeline; service-worker generation is disabled
- Key libraries: ReactFlow + D3 + React Three Fiber (visualizations), Leaflet (maps), Fuse.js (fuzzy search), cmdk (⌘K command palette), Framer Motion + GSAP, offline-status indicator and optional install UI (service-worker generation is disabled)

## Testing

- Unit: Vitest + `@testing-library/react`, jsdom environment. Tests in `apps/web/src/__tests__/`.
- E2E: Playwright, specs in `apps/web/e2e/`. Config pre-sets `mythos-cookie-consent` in localStorage to bypass the consent banner.
- CI (`.github/workflows/test.yml`, push/PR to main): lint + typecheck → unit tests with coverage (uploaded to Codecov) → E2E with Playwright (Chromium only).

## Env vars

From `apps/web/.env.example`:

- `ANTHROPIC_API_KEY` / `GROQ_API_KEY` - server-side credentials for the configured Oracle provider
- `ORACLE_PROVIDER` - optional `anthropic` or `groq`; default precedence is Anthropic when keyed, then Groq. A pinned provider never falls back to the other (missing key or construction failure = Oracle unavailable, logged)
- `GROQ_ORACLE_MODEL` - optional Groq model override; see `src/lib/oracle/provider.ts` for defaults
- `ANTHROPIC_ORACLE_MODEL` - optional override for the Oracle model
- `OPENAI_EMBEDDINGS_API_KEY` / `OPENAI_API_KEY` - optional, semantic Oracle grounding; inert until `src/data/oracle-embeddings.json` is generated with `pnpm --filter web generate:embeddings`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` - required in production for both Anthropic and Groq: shared per-IP limits and the global daily request/token caps fail closed without them. Only development can fall back to in-memory limits. Oracle requests with no determinable client IP are not pooled into one shared key: they use a stricter separate bucket (3/hr) keyed by a User-Agent + Accept-Language hash (`src/lib/oracle/client-identity.ts`)
- `ORACLE_KILL_SWITCH` - optional, disables Oracle and generated story quizzes; apply environment changes through the deployment configuration
- `ORACLE_DAILY_REQUEST_CAP` - optional global daily request cap (default 500, requires Upstash)
- `ORACLE_DAILY_TOKEN_CAP` - optional global daily Oracle token budget (default 2,000,000 estimated input+output tokens, reserved per request and settled to actual usage; requires Upstash, fails closed in production like the request cap)
- `NEXT_PUBLIC_ORACLE_ENABLED` - shows the footer Oracle control and the header/mega-menu `/oracle` links; the server also requires a configured provider. When the flag is off or no provider is configured, `/oracle` is `noindex` and left out of the sitemap
- `NEXT_PUBLIC_PWA_INSTALL_PROMPT` - optional install prompt, off by default
- `NEXT_PUBLIC_POSTHOG_KEY` / `POSTHOG_KEY` - product analytics. Without a key the app runs normally, `trackEvent` has no sink, and `/api/analytics/*` answers 501 instead of acknowledging events it cannot store
- `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_POSTHOG_ASSET_HOST`, `NEXT_PUBLIC_POSTHOG_UI_HOST`, `POSTHOG_HOST` - PostHog hosts; browser traffic is proxied through the `/ingest` rewrite in `next.config.ts`
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` - Search Console ownership token from the "HTML tag" method; public by design, and without it no verification tag is emitted
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` - error tracking
- `SENTRY_TRACES_SAMPLE_RATE` / `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` - trace sample rate (default 0.15); set both to keep server/client sampling in sync
- `NEXT_PUBLIC_SENTRY_REPLAY_ENABLED` - session replay, off by default

## Gotchas

- GraphQL's `src/lib/schemas.ts` contracts and `src/types/Entity.ts` interfaces must be kept in sync.
- Analytics events are a closed set in `src/lib/analytics/events.ts`, validated at runtime on both client and server. Add the name there first or the event is dropped. See `docs/analytics.md`.
- Use the configured `pnpm --filter web build` webpack pipeline; next-pwa is not active.
- Vercel Analytics/Speed Insights load only after cookie consent (and never when Global Privacy Control is on); `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` is unused by current code.
