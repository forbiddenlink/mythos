# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Mythos Atlas is an interactive mythology encyclopedia. It's a **pnpm + Turborepo monorepo** with two apps:

- **`apps/web`** — Next.js 16 (App Router) + React 19 frontend. Serves a GraphQL API from a Next.js route handler backed by static JSON data files. This is the primary app where most development happens.
- **`apps/api`** — Rust (Axum + async-graphql + SQLx) backend targeting PostgreSQL. This is a secondary/optional backend that mirrors the GraphQL API.

In practice, the web app is self-contained: its `/api/graphql` route handler reads directly from JSON files in `src/data/`, so the Rust API is not required for local development.

## Commands

All commands are run from the **monorepo root** unless noted otherwise.

### Setup

```
pnpm install
cp .env.example .env.local  # then add ANTHROPIC_API_KEY for Oracle feature
```

### Development

```
pnpm dev                     # starts all apps via Turborepo (web on :3000)
pnpm --filter web dev        # start only the web app
```

### Build

```
pnpm build                   # build all apps
pnpm --filter web build      # build only web (uses --webpack flag for next-pwa compatibility)
```

### Lint & Typecheck

```
pnpm lint                              # ESLint across all apps
pnpm --filter web exec tsc --noEmit    # TypeScript type check (web)
```

### Testing — Unit (Vitest)

Run from root or scoped to web:

```
pnpm --filter web test              # run all unit tests once
pnpm --filter web test:watch        # watch mode
pnpm --filter web test:coverage     # with coverage (thresholds: 80% lines/functions/statements, 70% branches)
```

Run a single test file:

```
pnpm --filter web exec vitest run src/__tests__/lib/search.test.ts
```

Tests live in `apps/web/src/__tests__/` mirroring the `src/` structure. Vitest uses jsdom, `@testing-library/react`, and the `@` path alias resolves to `apps/web/src`.

### Testing — E2E (Playwright)

```
pnpm --filter web e2e             # headless Chromium (auto-starts dev server on :3000)
pnpm --filter web e2e:ui          # interactive UI mode
```

E2E specs are in `apps/web/e2e/`. Playwright config pre-sets `mythos-cookie-consent` in localStorage to bypass the consent banner.

### Rust API (optional)

Requires Rust toolchain and PostgreSQL (via docker-compose):

```
docker compose up -d                # start Postgres on port 5435
cd apps/api && cargo watch -x run   # dev server on :8000
cargo test                          # unit tests
cargo check                         # type check
```

### Bundle Analysis

```
pnpm --filter web analyze    # opens webpack bundle analyzer (sets ANALYZE=true)
```

## Architecture

### Data Layer

All mythology content is stored as **static JSON files** in `apps/web/src/data/`:

- `pantheons.json`, `deities.json`, `stories.json`, `creatures.json`, `artifacts.json`, `locations.json`, `relationships.json`
- Plus game/progress data: `achievements.json`, `challenges.json`, `collections.json`, `journeys.json`, etc.

The GraphQL "API" is a **Next.js route handler** (`apps/web/src/app/api/graphql/route.ts`) that imports these JSON files directly and resolves queries via simple filter/find operations with Fuse.js for fuzzy search. There is no database required for the web app.

GraphQL queries are defined in `src/lib/queries.ts` and executed via a thin fetch-based client in `src/lib/graphql-client.ts`. Client-side caching uses React Query with 15-min stale time.

### Type System

Entity types are defined in `src/types/Entity.ts` (`Deity`, `Creature`, `Artifact`, `Story`, `Pantheon`, etc.). The GraphQL route handler also has its own inline type definitions — these should be kept in sync.

### AI Oracle

`/api/oracle` (`src/app/api/oracle/route.ts`) streams responses from Claude (Anthropic) via `@ai-sdk/anthropic` + Vercel AI SDK. Requires `ANTHROPIC_API_KEY`. Has IP-based rate limiting (10 req/hr).

### Provider Stack

The root layout (`src/app/layout.tsx`) nests providers in this order:
`NextIntlClientProvider > ThemeProvider > QueryProvider > BookmarksProvider > ProgressProvider > LeaderboardProvider > AchievementNotificationProvider`, then `GlobalClientAddons` (command palette search via `GlobalSearch`, PWA/analytics hooks, optional install prompt, `LayoutEffects` for cursor + optional Oracle when `NEXT_PUBLIC_ORACLE_ENABLED` or non-production).

Progress, bookmarks, and achievements persist to localStorage via their respective providers.

### Key Libraries

- **Visualization**: ReactFlow (family tree networks), D3 (hierarchical trees), React Three Fiber (3D artifacts), Leaflet (maps)
- **UI**: shadcn/ui (new-york style, `src/components/ui/`), Radix primitives, Framer Motion, GSAP
- **Search**: Fuse.js fuzzy search, cmdk command palette (⌘K)
- **i18n**: next-intl with 4 locales (en, es, fr, de). Messages in `apps/web/messages/`. Config entry: `apps/web/i18n.ts` → `src/i18n/request.ts`
- **PWA**: next-pwa with service worker, offline caching, install prompt

### Path Aliases

`@/*` maps to `apps/web/src/*` (configured in tsconfig.json and vitest.config.mjs).

### shadcn/ui

Configured via `apps/web/components.json` — new-york style, RSC-compatible, CSS variables enabled, Lucide icons. Components in `src/components/ui/`.

## Conventions

- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)
- **Branches**: `feature/*`, `fix/*`, `docs/*`
- **Pre-commit**: Husky runs lint-staged (ESLint --fix + Prettier on staged `.ts`/`.tsx` files)
- **Node**: v20+ (see `.nvmrc`)
- **Package manager**: pnpm 10+ (enforced via `packageManager` field)
- **Unused vars**: ESLint allows unused vars prefixed with `_`
- **Build**: Production builds use `next build --webpack` (required for next-pwa compatibility; turbopack is configured but plugins need webpack)

## Environment Variables

Required for full functionality (see `apps/web/.env.example`):

- `ANTHROPIC_API_KEY` — Oracle AI chat feature
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` — error tracking
- `NEXT_PUBLIC_GRAPHQL_URL` — only needed if using the Rust API backend instead of the built-in route handler

## CI

GitHub Actions (`.github/workflows/test.yml`) runs on push/PR to main:

1. Lint + TypeScript typecheck
2. Unit tests with coverage (uploaded to Codecov)
3. E2E tests with Playwright (Chromium only)
