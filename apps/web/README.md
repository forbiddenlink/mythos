# Mythos Atlas — Web Application

> Next.js 16 frontend for exploring world mythology

## Overview

Web frontend for Mythos Atlas, an interactive encyclopedia of ancient mythology featuring **13 pantheons**, **189 deities**, **96 stories**, **29 creatures**, **34 artifacts**, and **85 mythological locations** — plus quizzes, interactive family trees, 3D artifact viewers, branching stories, and spaced-repetition review.

**Built by Elizabeth Stein** using Next.js 16, React 19, TypeScript 5, and modern web technologies.

## Features

- 🏛️ **13 Pantheons** — Greek, Norse, Egyptian, Roman, Hindu, Japanese, Celtic, Aztec, Chinese, Mesopotamian, African (Yoruba), Polynesian, Mesoamerican
- 👑 **189 Deity Profiles** — Filterable by gender, domain, and pantheon with smart sorting
- 📖 **96 Epic Stories** — Including interactive branching narratives (choose-your-own-adventure)
- 🐉 **29 Creatures** — Mythological beasts with detailed profiles
- ⚔️ **34 Artifacts** — Legendary items with interactive 3D viewer (React Three Fiber)
- 🗺️ **85 Locations** — Interactive mythological map with filters and 3 guided journeys
- 🌳 **Family Trees** — Network graph (ReactFlow) and hierarchical (D3.js) visualizations
- 🧠 **Quizzes & Games** — Relationship quiz, personality quiz, quick quiz, symbol memory game
- 📚 **Spaced Repetition** — Flashcard review system with intelligent scheduling
- 🏆 **Achievements & Leaderboard** — Track mastery and compete on the leaderboard
- 🎯 **Daily Challenges** — Fresh mythology challenges every day
- 📈 **Learning Paths** — Guided progression through mythology topics
- 🔊 **Audio** — Text-to-speech narration and immersive background audio per pantheon
- 🌐 **i18n** — English, Spanish, French, and German (via next-intl)
- 📱 **PWA** — Installable progressive web app with offline support and background sync
- 🔍 **Global Search** — Command palette (⌘K) with fuzzy search across all content
- 📄 **PDF Export** — Export deity and story profiles

## Tech Stack

| Category       | Technology                   | Version       |
| -------------- | ---------------------------- | ------------- |
| Framework      | Next.js (App Router)         | 16.1.6        |
| UI             | React                        | 19.2.3        |
| Language       | TypeScript                   | ^5            |
| Styling        | Tailwind CSS                 | ^4            |
| Data Fetching  | React Query (TanStack)       | ^5.90         |
| GraphQL        | graphql-request              | ^7.4          |
| Graphs         | ReactFlow                    | ^11.11        |
| Visualizations | D3.js                        | ^7.9          |
| 3D Rendering   | React Three Fiber / Three.js | ^9.5 / ^0.182 |
| Animations     | Framer Motion                | ^12.23        |
| Audio          | Howler.js                    | ^2.2          |
| i18n           | next-intl                    | ^4.8          |
| Search         | Fuse.js                      | ^7.1          |
| Icons          | Lucide React                 | ^0.562        |
| UI Primitives  | shadcn/ui + Radix            | —             |
| Unit Tests     | Vitest                       | ^3.2          |
| E2E Tests      | Playwright                   | ^1.52         |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```text
src/
├── app/                  # App Router pages and layouts
│   ├── [locale]/         # i18n locale wrapper (en, es, fr, de)
│   ├── achievements/     # Achievement tracking
│   ├── artifacts/        # Artifact browser + 3D viewer
│   ├── compare/          # Cross-pantheon deity comparisons
│   ├── creatures/        # Creature encyclopedia
│   ├── deities/          # Deity catalog with filters
│   ├── family-tree/      # Relationship visualizations
│   ├── games/            # Symbol memory game
│   ├── journeys/         # Guided mythological journeys
│   ├── knowledge-graph/  # Knowledge graph explorer
│   ├── leaderboard/      # Competitive leaderboard
│   ├── learning-paths/   # Structured learning paths
│   ├── locations/        # Interactive location map
│   ├── pantheons/        # Pantheon browser
│   ├── quiz/             # Multiple quiz modes
│   ├── review/           # Spaced repetition flashcards
│   ├── stories/          # Story collection + branching stories
│   ├── timeline/         # Mythological timeline
│   └── api/graphql/      # GraphQL API route
├── components/           # React components (~40 directories)
│   ├── artifacts/        # 3D artifact viewer
│   ├── challenges/       # Daily challenges
│   ├── compare/          # Deity comparison
│   ├── deities/          # Deity cards, filters, details
│   ├── family-tree/      # Tree visualizations
│   ├── games/            # Memory game
│   ├── graph/            # Knowledge graph
│   ├── leaderboard/      # Leaderboard display
│   ├── learning/         # Learning path components
│   ├── locations/        # Map and location cards
│   ├── quiz/             # Quiz UI
│   ├── review/           # Flashcard review
│   ├── search/           # Search + command palette
│   ├── stories/          # Story cards and reader
│   ├── streaks/          # Streak tracking
│   ├── timeline/         # Timeline visualization
│   ├── layout/           # Header, Footer, Navigation
│   ├── ui/               # shadcn/ui components
│   └── ...               # animations, audio, i18n, pwa, seo, etc.
├── data/                 # JSON data files
│   ├── pantheons.json    # 13 pantheons
│   ├── deities.json      # 189 deities
│   ├── stories.json      # 96 stories
│   ├── creatures.json    # 29 creatures
│   ├── artifacts.json    # 34 artifacts
│   ├── locations.json    # 85 locations
│   └── relationships.json
├── hooks/                # Custom React hooks
│   ├── useAchievements, useBookmarks, usePagination
│   ├── useTextToSpeech, use-progress, use-recommendations
│   └── use-background-sync, use-debounce
├── i18n/                 # Internationalization config
├── lib/                  # Utilities and logic
│   ├── graphql-client.ts # GraphQL setup
│   ├── queries.ts        # GraphQL query definitions
│   ├── recommendations.ts
│   ├── search.ts         # Fuse.js search engine
│   ├── branching-story.ts
│   ├── daily-challenges.ts
│   ├── spaced-repetition.ts
│   ├── mastery.ts
│   ├── pdf-export.ts
│   └── utils.ts
├── providers/            # Context providers
│   ├── achievement-notification, bookmarks, leaderboard
│   ├── progress, query, review, theme
│   └── ...
├── types/                # TypeScript definitions
└── proxy.ts              # i18n routing proxy
```

## Available Scripts

```bash
pnpm dev            # Start development server
pnpm build          # Build for production
pnpm start          # Start production server
pnpm lint           # Run ESLint
pnpm test           # Run unit tests (Vitest)
pnpm test:watch     # Run tests in watch mode
pnpm test:coverage  # Run tests with coverage
pnpm e2e            # Run E2E tests (Playwright)
pnpm e2e:ui         # Run E2E tests with UI
pnpm analyze        # Analyze bundle size
```

## Deployment

Deployed on **Vercel**: <https://mythosatlas.com>

Automatic deployments on push to `main` via GitHub integration.

## Environment Variables

No environment variables required — the app uses static JSON data files served through a GraphQL layer.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## Creator

Built by **Elizabeth Stein** — passionate about mythology and modern web technologies.

> "Built with passion for mythology and modern web technologies"

## License

MIT License — See root LICENSE file

---

Part of the [Mythos Atlas](https://github.com/forbiddenlink/mythos) project
