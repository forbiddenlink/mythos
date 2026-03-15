# Mythos Atlas

**Interactive Encyclopedia of World Mythology**

An immersive web application exploring ancient mythologies through interactive visualizations, comprehensive deity profiles, epic stories, and educational features.

**Live:** [mythosatlas.com](https://mythosatlas.com)

---

## Content

- **13 Pantheons** — Greek, Norse, Egyptian, Roman, Hindu, Japanese, Celtic, Aztec, Chinese, Mesopotamian, African (Yoruba), Polynesian, and Mesoamerican
- **189 Deities** — Detailed profiles with domains, symbols, relationships, and importance rankings
- **96 Stories** — Creation myths, heroic quests, and divine conflicts
- **29 Creatures** — Mythological beasts and beings
- **34 Artifacts** — Legendary weapons and sacred objects
- **85 Locations** — Sacred sites, realms, and mythological places

---

## Features

### Browse & Explore

- **Pantheon Pages** — Cultural context, historical background, and divine hierarchies
- **Deity Profiles** — Comprehensive information with filtering by gender, domain, and pantheon
- **Story Collection** — Category and theme filtering, interactive branching narratives
- **Command Palette** — Fuzzy search with keyboard shortcut (Cmd+K / Ctrl+K)

### Visualizations

- **Interactive Family Trees** — Network graphs (ReactFlow) and hierarchical trees (D3.js)
- **3D Artifacts** — Examine legendary items from all angles (React Three Fiber)
- **Location Map** — Interactive map with 85 mythological sites
- **Knowledge Graph** — Cross-pantheon connections and relationships

### Educational

- **Relationship Quiz** — Test knowledge of divine family connections
- **Personality Quiz** — Discover which deity matches your personality
- **Quick Quiz** — Timed mythology trivia challenges
- **Symbol Memory Game** — Match deity symbols to their owners
- **Spaced Repetition** — Flashcard system with intelligent scheduling
- **Daily Challenges** — New mythology challenges each day
- **Learning Paths** — Guided progression through mythology topics
- **Achievements** — 24 badges to unlock, with leaderboard

### Platform

- **Internationalization** — English, Spanish, French, and German
- **Progressive Web App** — Installable with offline support
- **Audio System** — Background ambiance per pantheon, text-to-speech for stories
- **Accessibility** — WCAG AA compliant, keyboard-navigable interface

---

## Tech Stack

| Category          | Technologies                               |
| ----------------- | ------------------------------------------ |
| **Framework**     | Next.js 16, React 19, TypeScript 5         |
| **Styling**       | Tailwind CSS 4, shadcn/ui, Framer Motion   |
| **Data**          | GraphQL API, React Query, Fuse.js search   |
| **Visualization** | ReactFlow, D3.js, React Three Fiber        |
| **Platform**      | next-intl, Howler.js, Service Worker (PWA) |
| **Testing**       | Vitest, Playwright                         |
| **Deployment**    | Vercel, Turborepo                          |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Installation

```bash
# Clone the repository
git clone git@github.com:forbiddenlink/mythos.git
cd mythos

# Install dependencies
pnpm install

# Run development server
cd apps/web
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm test         # Run unit tests (Vitest)
pnpm e2e          # Run E2E tests (Playwright)
```

---

## Project Structure

```
mythos/
├── apps/
│   └── web/                    # Next.js application
│       ├── src/
│       │   ├── app/            # App Router pages and layouts
│       │   ├── components/     # React components
│       │   ├── data/           # JSON mythology data
│       │   ├── hooks/          # Custom React hooks
│       │   ├── lib/            # Utilities and game logic
│       │   └── providers/      # Context providers
│       ├── messages/           # Translation files
│       ├── public/             # Static assets
│       └── e2e/                # Playwright tests
├── docs/                       # Documentation
└── turbo.json                  # Turborepo configuration
```

---

## Data

The application uses JSON files for mythology data:

| File                 | Count | Description                                  |
| -------------------- | ----- | -------------------------------------------- |
| `pantheons.json`     | 13    | Mythology traditions with cultural context   |
| `deities.json`       | 189   | Profiles with domains, symbols, and rankings |
| `stories.json`       | 96    | Legends, creation myths, and tales           |
| `creatures.json`     | 29    | Mythological beasts and beings               |
| `artifacts.json`     | 34    | Legendary weapons and objects                |
| `locations.json`     | 85    | Sacred sites and mythological places         |
| `relationships.json` | —     | Divine family connections                    |

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system documentation including data flow diagrams, schema definitions, and technology decisions.

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## License

MIT License — See [LICENSE](./LICENSE) for details.

---

**Built by Elizabeth Stein**
