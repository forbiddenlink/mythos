# Mythos Atlas Architecture

> Comprehensive system architecture documentation

## System Overview

Mythos Atlas is a modern, interactive web application built with Next.js 16 and React 19, featuring a GraphQL API layer for flexible data querying and real-time client-side data management.

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
        G --> I[Visualization<br/>ReactFlow + D3]
        G --> J[State Management<br/>React Query]
    end
    
    subgraph "Data Layer"
        J --> K[GraphQL Client]
        K --> L[API Route Handler<br/>/api/graphql]
        L --> M[JSON Data Files]
        M --> N[pantheons.json<br/>39 deities]
        M --> O[deities.json<br/>3 pantheons]
        M --> P[stories.json<br/>11+ tales]
        M --> Q[relationships.json<br/>family trees]
    end
    
    subgraph "Features"
        R[Search ⌘K] --> K
        S[Filters & Sorting] --> G
        T[Quiz System] --> J
        U[Family Tree] --> I
        V[Comparative View] --> G
    end
    
    subgraph "Deployment"
        W[Vercel Platform] --> B
        X[GitHub Repository] --> W
        Y[CI/CD Pipeline] --> W
    end
    
    style A fill:#e1f5ff
    style B fill:#fff4e1
    style K fill:#e8f5e9
    style M fill:#f3e5f5
    style W fill:#fce4ec
```

## Data Flow Diagram

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

## Component Architecture

```mermaid
graph LR
    subgraph "Pages (App Router)"
        A1[page.tsx<br/>Homepage]
        A2[pantheons/page.tsx]
        A3[deities/page.tsx]
        A4[stories/page.tsx]
        A5[family-tree/page.tsx]
        A6[quiz/page.tsx]
        A7[about/page.tsx]
    end
    
    subgraph "Layout Components"
        B1[Header<br/>Navigation]
        B2[Footer<br/>Attribution]
        B3[CommandPalette<br/>Search]
    end
    
    subgraph "Feature Components"
        C1[DeityFilters<br/>Filter & Sort]
        C2[StoryFilters<br/>Category Filter]
        C3[FamilyTree<br/>ReactFlow]
        C4[MythologyQuiz<br/>Interactive Quiz]
        C5[ComparativeMythology<br/>Cross-pantheon]
    end
    
    subgraph "UI Components"
        D1[Card]
        D2[Button]
        D3[Select]
        D4[Badge]
        D5[Progress]
    end
    
    A3 --> C1
    A4 --> C2
    A5 --> C3
    A6 --> C4
    A1 --> C5
    
    C1 --> D1
    C1 --> D3
    C2 --> D3
    C3 --> D1
    C4 --> D5
    
    B1 --> B3
```

## Database Schema (JSON)

```mermaid
erDiagram
    PANTHEON ||--o{ DEITY : contains
    DEITY ||--o{ RELATIONSHIP : has
    DEITY ||--o{ STORY : features_in
    PANTHEON ||--o{ STORY : belongs_to
    
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
        string origin
        string imageUrl
    }
    
    RELATIONSHIP {
        string id PK
        string deityId FK
        string relatedDeityId FK
        string type "parent|child|spouse|sibling"
        string description
    }
    
    STORY {
        string id PK
        string title
        string slug
        string pantheonId FK
        string summary
        string[] themes
        string category
        string culturalSignificance
    }
```

## Technology Stack

```mermaid
graph TB
    subgraph "Frontend Framework"
        A[Next.js 16.1.1<br/>App Router + RSC]
        B[React 19.2.3<br/>UI Library]
        C[TypeScript 5.9<br/>Type Safety]
    end
    
    subgraph "Styling & Design"
        D[Tailwind CSS 4<br/>Utility-first CSS]
        E[shadcn/ui<br/>Component Library]
        F[Radix UI<br/>Primitives]
        G[Framer Motion<br/>Animations]
    end
    
    subgraph "Data Management"
        H[React Query 5<br/>Data Fetching]
        I[GraphQL Request<br/>Client]
        J[GraphQL API<br/>Route Handler]
    end
    
    subgraph "Visualization"
        K[ReactFlow 11<br/>Network Graphs]
        L[React D3 Tree<br/>Hierarchical Trees]
        M[Lucide React<br/>Icons]
    end
    
    subgraph "Deployment"
        N[Vercel<br/>Hosting & CI/CD]
        O[GitHub<br/>Source Control]
        P[pnpm 10<br/>Package Manager]
    end
    
    A --> B
    B --> C
    A --> D
    E --> F
    B --> H
    H --> I
    I --> J
    B --> K
    B --> L
    A --> N
    N --> O
```

## Feature Matrix

| Feature | Status | Technology | Performance |
|---------|--------|------------|-------------|
| Homepage | ✅ Live | Next.js SSR | A+ |
| Pantheons Browser | ✅ Live | React Query | A+ |
| Deity Filtering | ✅ Live | Client-side | A+ |
| Story Filtering | ✅ Live | Client-side | A+ |
| Family Tree (Network) | ✅ Live | ReactFlow | A |
| Family Tree (Hierarchical) | ✅ Live | React D3 Tree | A |
| Global Search | ✅ Live | Command Palette | A+ |
| Interactive Quiz | ✅ Live | React State | A+ |
| Comparative Mythology | ✅ Live | React Query | A+ |
| Mobile Responsive | ✅ Live | Tailwind | A+ |
| SEO Optimization | ✅ Live | Next.js Metadata | A+ |
| Custom 404 | ✅ Live | Next.js | A+ |

## Performance Optimization

```mermaid
graph LR
    subgraph "Optimization Strategies"
        A[React Query Caching<br/>5min staleTime]
        B[Client-side Filtering<br/>No API calls]
        C[Code Splitting<br/>Dynamic imports]
        D[Image Optimization<br/>Next.js Image]
        E[Font Optimization<br/>next/font]
    end
    
    subgraph "Results"
        F[Fast Initial Load<br/><1s FCP]
        G[Instant Filtering<br/><50ms response]
        H[Smooth Animations<br/>60fps]
        I[Low Bundle Size<br/>Optimized chunks]
    end
    
    A --> F
    B --> G
    C --> I
    E --> F
    D --> F
```

## User Journey

```mermaid
journey
    title User Experience Flow
    section Discovery
      Visit Homepage: 5: User
      Read Hero Section: 4: User
      View Stats: 5: User
      See Pantheons: 5: User
    section Exploration
      Browse Deities: 5: User
      Apply Filters: 5: User
      View Family Tree: 4: User
      Read Stories: 4: User
    section Learning
      Take Quiz: 5: User
      Compare Deities: 5: User
      Search Content: 5: User
    section Engagement
      Share on Social: 4: User
      Visit About Page: 4: User
      Return to Homepage: 5: User
```

## Deployment Pipeline

```mermaid
graph LR
    A[Local Development] -->|git push| B[GitHub Repository]
    B -->|webhook| C[Vercel CI/CD]
    C -->|build| D[Next.js Build]
    D -->|deploy| E[Edge Network]
    E -->|serve| F[Production Site]
    
    C -->|preview| G[Preview Deployment]
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style C fill:#fff3e0
    style E fill:#e8f5e9
    style F fill:#fce4ec
```

## Creator

**Built by Elizabeth Stein** - February 2026

Combining modern web technologies with a passion for ancient mythology to create an immersive educational experience.

---

*For more information, see [README.md](./README.md)*
