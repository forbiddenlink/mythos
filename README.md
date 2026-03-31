# Mythos

An interactive mythology and folklore explorer built with Next.js.

[![Live Demo](https://img.shields.io/badge/Live_Demo-000?style=for-the-badge&logo=vercel&logoColor=white)](https://mythos.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js_16-000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

## Features

- Browse mythology from 13 world cultures (Greek, Norse, Egyptian, Japanese, Celtic, and more)
- Explore 189 deities, 96 stories, 29 creatures, 34 artifacts, and 85 locations
- Interactive family trees and relationship visualizations
- AI-powered mythology Q&A via the Oracle feature
- Quiz games and achievement tracking
- Full-text search with command palette (Cmd+K)
- PWA with offline support
- Internationalization (EN, ES, FR, DE)

## Getting Started

```bash
git clone https://github.com/forbiddenlink/mythos
cd mythos
pnpm install
cp .env.example .env.local
# Add ANTHROPIC_API_KEY to .env.local for Oracle feature
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Data:** GraphQL API backed by JSON files
- **Visualizations:** ReactFlow, D3.js, React Three Fiber
- **Testing:** Vitest (unit), Playwright (E2E)
- **Deployment:** Vercel

## Project Structure

```
mythos/
├── apps/
│   └── web/          # Next.js frontend
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
pnpm e2e              # Run E2E tests
```

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and data flow
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [AGENTS.md](./AGENTS.md) - AI assistant context

## License

MIT
