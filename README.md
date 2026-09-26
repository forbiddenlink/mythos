# Mythos

An interactive mythology and folklore explorer built with Next.js.

[![Live Demo](https://img.shields.io/badge/Live_Demo-000?style=for-the-badge&logo=vercel&logoColor=white)](https://mythosatlas.com)
![Next.js](https://img.shields.io/badge/Next.js_16-000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

## Features

- Browse mythology from 18 world cultures (Greek, Norse, Egyptian, Japanese, Celtic, and more)
- Explore 271 deities, 28 heroes, 120 stories, 70 creatures, 58 artifacts, and 139 locations
- Interactive family trees and relationship visualizations
- Optional Oracle mythology Q&A (requires configuration and production rate limits)
- Quiz games and achievement tracking
- Full-text search with command palette (Cmd+K)
- Browser-local bookmarks, reading progress, and review history
- Interface and Oracle language selection (EN, ES, FR, DE); most encyclopedia prose is English
- Optional one-time support through Stripe-hosted checkout

## Getting Started

```bash
git clone https://github.com/forbiddenlink/mythos
cd mythos
nvm use  # Node version from .nvmrc
pnpm install --frozen-lockfile
# Optional: configure Oracle using apps/web/.env.example
pnpm --filter web dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. The encyclopedia runs without Oracle credentials or a database. For Oracle, copy `apps/web/.env.example` to `apps/web/.env.local` and configure the required values; never commit that file.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Data:** versioned JSON catalogs imported by pages (no database or public data API)
- **Visualizations:** ReactFlow, D3.js, React Three Fiber
- **Testing:** Vitest (unit), Playwright (E2E)
- **Deployment:** Vercel

## Project Structure

```
mythos/
├── apps/
│   └── web/          # Self-contained Next.js app
│       ├── src/
│       │   ├── app/          # App Router pages
│       │   ├── components/   # React components
│       │   ├── data/         # JSON data files
│       │   └── lib/          # Utilities and helpers
│       └── public/           # Static assets
├── docs/             # Documentation
└── package.json      # Monorepo root
```

## Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Production build
pnpm lint             # Run ESLint
pnpm test             # Run unit tests
pnpm --filter web exec tsc --noEmit # Type check
pnpm --filter web test:coverage     # Unit tests and configured coverage checks
pnpm --filter web e2e               # Build and run Chromium E2E tests
```

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and data flow
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [CLAUDE.md](./CLAUDE.md) - Repository context for coding agents

## Current work and release checks

- [Improvement plan](docs/audits/2026-09-22-improvement-plan.md)
- [QA evidence and limitations](docs/audits/2026-09-22-qa-results.json)
- [Performance measurements](docs/audits/2026-09-18-performance.md)
- [Operations runbook](docs/ops/incident-runbook.md)

Protected previews are reviewed separately from production. Service-worker generation is disabled; do not assume offline reading is supported.

## License

MIT
