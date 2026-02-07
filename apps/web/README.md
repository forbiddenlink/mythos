# Mythos Atlas - Web Application

> Next.js 16 frontend application for exploring world mythology

## Overview

This is the web frontend for Mythos Atlas, an interactive encyclopedia of ancient mythology featuring Greek, Norse, and Egyptian pantheons with **80+ deities**, 11+ stories, and comprehensive educational features.

**Built by Elizabeth Stein** using Next.js 16, React 19, TypeScript, and modern web technologies.

## Features

- 🏛️ **Interactive Pantheons** - Browse Greek, Norse, and Egyptian mythologies
- 👑 **Deity Profiles** - **80+ gods and goddesses** with filtering and sorting
- 📖 **Epic Stories** - 11+ mythological tales with theme filtering  
- 🌳 **Family Trees** - Network and hierarchical relationship visualizations
- 🧠 **Educational Quiz** - Interactive mythology quiz with progress tracking
- 🔍 **Global Search** - Command palette (⌘K) for instant search
- 📱 **Mobile Optimized** - Fully responsive across all devices
- ⚡ **Performance** - Optimized with React Query caching and code splitting

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.9.3
- **Styling**: Tailwind CSS 4.1
- **Data Fetching**: React Query (TanStack Query) 5.90
- **GraphQL**: graphql-request 7.4
- **Visualizations**: ReactFlow 11.11 & react-d3-tree 3.6
- **UI Components**: shadcn/ui with Radix primitives
- **Animations**: Framer Motion 12.31
- **Icons**: Lucide React

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

```
src/
├── app/              # App Router pages and layouts
│   ├── page.tsx      # Homepage
│   ├── pantheons/    # Pantheons browser
│   ├── deities/      # Deity catalog with filters
│   ├── stories/      # Story collection
│   ├── family-tree/  # Relationship visualizations
│   ├── quiz/         # Interactive quiz
│   ├── about/        # About page
│   └── api/          # GraphQL API route
├── components/       # React components
│   ├── deities/      # Deity-specific components
│   ├── stories/      # Story components
│   ├── mythology/    # Comparative mythology
│   ├── quiz/         # Quiz components
│   ├── layout/       # Header, Footer
│   ├── ui/           # shadcn/ui components
│   └── ...
├── data/            # JSON data files
│   ├── pantheons.json
│   ├── deities.json
│   ├── stories.json
│   └── relationships.json
├── lib/             # Utilities
│   ├── graphql-client.ts
│   ├── queries.ts
│   └── utils.ts
└── providers/       # React context providers
```

## Key Features Implementation

### Filtering & Sorting
- Client-side filtering for instant response
- Gender and domain filters for deities
- Category and theme filters for stories
- Ascending/descending sort options

### Family Tree Visualizations
- **Network Graph**: ReactFlow with draggable nodes
- **Hierarchical Tree**: React D3 Tree with expand/collapse
- Color-coded relationships (parent, child, spouse, sibling)
- Mobile-responsive with touch controls
- **Multi-Pantheon Support**: Handles complex lineages (e.g., Norse)

### Search System
- Global command palette (⌘K or Ctrl+K)
- Full-text search across deities, pantheons, and stories
- Debounced input for performance
- Grouped results by type

### Interactive Quiz
- Dynamic question generation from deity data
- Progress bar with visual feedback
- Score tracking and percentage display
- Explanations for correct answers
- Restart functionality

## Performance Optimizations

- **React Query**: 5-minute cache for data fetching
- **Code Splitting**: Dynamic imports for heavy components
- **Font Optimization**: next/font for Google Fonts
- **Client-side Filtering**: No API calls for filter operations
- **Lazy Loading**: Images and components loaded on demand

## Deployment

Deployed on **Vercel**: https://mythos-web-seven.vercel.app

Automatic deployments on push to `main` branch via GitHub integration.

## Available Scripts

```bash
pnpm dev          # Start development server (Turbopack)
pnpm build        # Build for production
pnpm start        # Start production server  
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript compiler check
```

## Environment Variables

No environment variables required - the app uses static JSON data files.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## Creator

**Elizabeth Stein** - February 2026

*"Built with passion for mythology and modern web technologies"*

## License

MIT License - See root LICENSE file

---

Part of the [Mythos Atlas](https://github.com/forbiddenlink/mythos) project

