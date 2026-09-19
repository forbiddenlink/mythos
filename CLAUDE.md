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
pnpm --filter web build               # build only web (uses --webpack flag for next-pwa compatibility)

pnpm lint                             # ESLint across all apps
pnpm --filter web exec tsc --noEmit   # TypeScript type check (web)

pnpm --filter web test                # Vitest unit tests, run once
pnpm --filter web test:watch
pnpm --filter web test:coverage       # thresholds: 80% lines/functions/statements, 70% branches
pnpm --filter web exec vitest run src/__tests__/lib/search.test.ts   # single file

pnpm --filter web e2e                 # Playwright, headless Chromium (auto-starts dev server on :3000)
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
- `apps/web/src/types/Entity.ts` - entity types (`Deity`, `Creature`, `Artifact`, `Story`, `Pantheon`, etc.) - the GraphQL route handler has its own inline types that must be kept in sync
- `apps/web/src/components/ui/` - shadcn/ui components (new-york style), configured via `apps/web/components.json`
- `apps/web/messages/` - next-intl translation messages (en, es, fr, de)
- `apps/web/e2e/` - Playwright specs
- `apps/web/src/__tests__/` - Vitest unit tests, mirroring `src/` structure
- `apps/api/` - Rust backend (optional)
- `docs/` - project documentation

## Conventions

- **Path alias**: `@/*` maps to `apps/web/src/*` (tsconfig.json, vitest.config.mjs)
- **Provider stack** (`src/app/layout.tsx`): `NextIntlClientProvider > ThemeProvider > QueryProvider > BookmarksProvider > ProgressProvider > LeaderboardProvider > AchievementNotificationProvider`, then `GlobalClientAddons` (command palette search, PWA/analytics hooks, optional install prompt, `LayoutEffects` for cursor + optional Oracle when `NEXT_PUBLIC_ORACLE_ENABLED` or non-production). Progress, bookmarks, and achievements persist to localStorage via their providers.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)
- **Branches**: `feature/*`, `fix/*`, `docs/*`
- **Pre-commit**: Husky runs lint-staged (ESLint --fix + Prettier on staged `.ts`/`.tsx` files)
- **Unused vars**: ESLint allows unused vars prefixed with `_`
- **Build**: production builds use `next build --webpack` (required for next-pwa compatibility; Turbopack is configured but plugins need webpack)
- Key libraries: ReactFlow + D3 + React Three Fiber (visualizations), Leaflet (maps), Fuse.js (fuzzy search), cmdk (⌘K command palette), Framer Motion + GSAP, next-pwa (service worker, offline caching, install prompt)

## Testing

- Unit: Vitest + `@testing-library/react`, jsdom environment. Tests in `apps/web/src/__tests__/`.
- E2E: Playwright, specs in `apps/web/e2e/`. Config pre-sets `mythos-cookie-consent` in localStorage to bypass the consent banner.
- CI (`.github/workflows/test.yml`, push/PR to main): lint + typecheck → unit tests with coverage (uploaded to Codecov) → E2E with Playwright (Chromium only).

## Env vars

From `apps/web/.env.example`:
- `ANTHROPIC_API_KEY` - Oracle AI chat feature
- `ANTHROPIC_ORACLE_MODEL` - optional override for the Oracle model
- `OPENAI_EMBEDDINGS_API_KEY` / `OPENAI_API_KEY` - optional, semantic Oracle grounding
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` - required in production for Oracle (shared rate limits across serverless instances); without them, production Oracle requests fail closed with HTTP 503
- `ORACLE_KILL_SWITCH` - optional, hard-disables Anthropic routes without a redeploy
- `ORACLE_DAILY_REQUEST_CAP` - optional global daily request cap (default 500, requires Upstash)
- `NEXT_PUBLIC_ORACLE_ENABLED` - shows the floating Oracle button (also requires `ANTHROPIC_API_KEY`)
- `NEXT_PUBLIC_PWA_INSTALL_PROMPT` - optional install prompt, off by default
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` - error tracking
- `SENTRY_TRACES_SAMPLE_RATE` / `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` - trace sample rate (default 0.15); set both to keep server/client sampling in sync
- `NEXT_PUBLIC_SENTRY_REPLAY_ENABLED` - session replay, off by default
- `NEXT_PUBLIC_GRAPHQL_URL` - only needed when using the Rust API backend instead of the built-in route handler

## Gotchas

- The GraphQL route handler's inline types and `src/types/Entity.ts` are two separate definitions that must be kept in sync manually.
- `next build` requires `--webpack`, not Turbopack, for next-pwa compatibility.
- Vercel Analytics/Speed Insights load only after cookie consent (and never when Global Privacy Control is on); `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` is unused by current code.
