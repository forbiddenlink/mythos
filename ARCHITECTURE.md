# Mythos Atlas Architecture

> System architecture documentation

## System Overview

Mythos Atlas is an interactive mythology encyclopedia built with Next.js 16 and React 19. It serves structured mythology data (13 pantheons, 189 deities, 96 stories, 29 creatures, 34 artifacts, 85 locations) through a GraphQL API layer backed by JSON files, with client-side caching via React Query.

## Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[Browser] --> B[Next.js App]
        B --> C[React Components]
        C --> D[React Query Cache]
    end

    subgraph "Application Layer"
        B --> E[App Router Pages]
        E --> F[Server Components]
        E --> G[Client Components]

        G --> H[UI Components<br/>shadcn/ui + Radix]
        G --> I[Visualizations<br/>ReactFlow + D3 + R3F]
        G --> J[State Management<br/>React Query + Context]
    end

    subgraph "Data Layer"
        J --> K[GraphQL Client]
        K --> L[API Route Handler<br/>/api/graphql]
        L --> M[JSON Data Files]
        M --> N[pantheons.json · 13]
        M --> O[deities.json · 189]
        M --> P[stories.json · 96]
        M --> Q[creatures.json · 29]
        M --> R2[artifacts.json · 34]
        M --> S2[locations.json · 85]
        M --> T2[relationships.json]
    end

    subgraph "Features"
        R[Search ⌘K<br/>Fuse.js] --> K
        S[Filters & Sorting] --> G
        T[Quiz & Games] --> J
        U[Family Tree<br/>ReactFlow + D3] --> I
        V[3D Artifacts<br/>React Three Fiber] --> I
        W[i18n<br/>next-intl] --> E
    end

    subgraph "Deployment"
        X[Vercel Platform] --> B
        Y[GitHub Repository] --> X
    end
```

## Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant R as React Query
    participant G as GraphQL API
    participant D as JSON Data

    U->>B: Visit /deities page
    B->>R: useQuery('deities')
    R->>R: Check cache
    alt Cache Hit
        R->>B: Return cached data
    else Cache Miss
        R->>G: Request GET_DEITIES
        G->>D: Read deities.json
        D->>G: Return deity array
        G->>R: GraphQL response
        R->>R: Cache with 5min staleTime
        R->>B: Return fresh data
    end
    B->>U: Render deity cards

    U->>B: Apply gender filter
    B->>B: Client-side filtering
    B->>U: Update display
```

## Data Schema

```mermaid
erDiagram
    PANTHEON ||--o{ DEITY : contains
    PANTHEON ||--o{ STORY : belongs_to
    PANTHEON ||--o{ CREATURE : belongs_to
    PANTHEON ||--o{ ARTIFACT : belongs_to
    PANTHEON ||--o{ LOCATION : belongs_to
    DEITY ||--o{ RELATIONSHIP : has
    DEITY ||--o{ STORY : features_in

    PANTHEON {
        string id PK
        string name
        string slug
        string culture
        string region
        string description
        string imageUrl
    }

    DEITY {
        string id PK
        string name
        string slug
        string pantheonId FK
        string[] domain
        string[] symbols
        string gender
        int importance
        string description
        string imageUrl
    }

    STORY {
        string id PK
        string title
        string slug
        string pantheonId FK
        string summary
        string[] themes
        string category
    }

    CREATURE {
        string id PK
        string name
        string slug
        string pantheonId FK
        string type
        string description
    }

    ARTIFACT {
        string id PK
        string name
        string slug
        string pantheonId FK
        string type
        string description
    }

    LOCATION {
        string id PK
        string name
        string slug
        string pantheonId FK
        string type
        string description
        float latitude
        float longitude
    }

    RELATIONSHIP {
        string deityId FK
        string relatedDeityId FK
        string type "parent|child|spouse|sibling"
    }
```

## Technology Stack

```mermaid
graph TB
    subgraph "Frontend Framework"
        A[Next.js 16.1.6<br/>App Router + SSG]
        B[React 19.2.3]
        C[TypeScript 5]
    end

    subgraph "Styling & Design"
        D[Tailwind CSS 4]
        E[shadcn/ui + Radix]
        F[Framer Motion 12]
    end

    subgraph "Data Management"
        G[React Query 5]
        H[graphql-request 7]
        I[Fuse.js 7<br/>Fuzzy Search]
    end

    subgraph "Visualization"
        J[ReactFlow 11<br/>Network Graphs]
        K[D3.js 7<br/>Hierarchical Trees]
        L[React Three Fiber 9<br/>3D Artifacts]
    end

    subgraph "Platform"
        M[next-intl 4<br/>i18n: EN, ES, FR, DE]
        N[Howler.js 2<br/>Audio]
        O[PWA<br/>Service Worker]
    end

    subgraph "Testing"
        P[Vitest 3<br/>Unit Tests]
        Q[Playwright 1.52<br/>E2E Tests]
    end

    subgraph "Deployment"
        R[Vercel<br/>Hosting & CI/CD]
        S[Turborepo<br/>Monorepo Build]
    end

    A --> B --> C
    A --> D
    B --> G --> H
    B --> J
    B --> K
    B --> L
    A --> M
    A --> R --> S
```

## Feature Overview

| Area          | Features                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------- |
| **Browse**    | 13 pantheons, 189 deities, 96 stories, 29 creatures, 34 artifacts, 85 locations                    |
| **Visualize** | Family trees (network + hierarchical), knowledge graph, story timeline, 3D artifacts, location map |
| **Learn**     | Relationship quiz, personality quiz, quick quiz, symbol memory game, spaced repetition review      |
| **Progress**  | Achievements (24 badges), leaderboard, daily challenges, learning paths, streaks                   |
| **Search**    | ⌘K command palette, fuzzy search (Fuse.js), client-side filters & sorting                          |
| **Media**     | Text-to-speech, background audio per pantheon, PDF export                                          |
| **Platform**  | i18n (4 languages), PWA with offline support, dynamic OG images, SEO metadata                      |

## Performance

- **React Query** — 5-minute stale time; client-side filter/sort avoids API round-trips
- **Static Generation** — 486 pages pre-rendered at build time
- **Code Splitting** — Dynamic imports for heavy visualization components (ReactFlow, D3, R3F)
- **Image Optimization** — WebP hero images, Next.js `<Image>` with lazy loading
- **Font Subsetting** — Latin-ext subset for i18n support

## Deployment

```mermaid
graph LR
    A[Local Dev] -->|git push| B[GitHub]
    B -->|webhook| C[Vercel CI/CD]
    C -->|build| D[Next.js Build<br/>486 static pages]
    D -->|deploy| E[Edge Network]
    E -->|serve| F[Production<br/>mythosatlas.com]
    C -->|preview| G[Preview Deployment]
```

---

_See [README.md](./README.md) for setup instructions and full feature details._
