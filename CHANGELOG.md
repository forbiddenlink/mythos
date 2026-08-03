# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Oracle: AI mythology Q&A grounded in the encyclopedia's own sources, running on free Groq (Anthropic optional), with a dramatized Delphic Oracle page at `/oracle` and a GLSL parchment/candlelight shader background
- The Aether Map: a navigable 3D cosmos of every deity
- Rosetta Wheel: one archetype and its parallels across pantheons
- Bloodline Tapestry: at-a-glance deity genealogy
- Scrollytelling myth reader for every tale
- Scholarship: attestation provenance and a deep-time deity timeline
- Deity codex hero with illuminated sigil-chips and foil-shimmer name
- Deity portrait morphing across navigation via the View Transitions API
- Torchlight cursor and native scroll-driven reveals
- Generated illustrations across all content (deities, stories, locations) via Magica
- i18n scaffolding (next-intl) and localized story content
- Production readiness: robots.txt, error tracking (Sentry), performance monitoring, cookie consent and privacy policy, accessibility linting

### Changed

- Migrated tooling to Biome for linting and formatting

### Fixed

- Numerous correctness, performance, and security fixes since 1.0.0 (home-page rendering perf, Three.js scenes, Sentry blocked-storage handling, dependency CVE remediation)

## [1.0.0] - 2026-03-14

### Added

- Phase 8: Discovery and engagement features
  - User collections system
  - Daily facts feature
  - Discovery recommendations
- Phase 7: Immersive experience features
  - Cinematic story pages
  - Audio system integration
  - Enhanced animations
- Phase 6: Interactive experiences
  - Mythology quiz system
  - Shareable results
  - Achievement tracking
- Phase 5: Advanced visualizations
  - Family tree explorer
  - Timeline visualization
  - Geographic mythology maps
- Phase 4: Search and discovery
  - Full-text search
  - Cross-pantheon connections
  - Related content suggestions
- Phase 3: Content management
  - Deity profiles with detailed information
  - Story narratives with primary sources
  - Relationship mapping
- Phase 2: Core infrastructure
  - GraphQL API with Rust backend
  - Next.js frontend with App Router
  - PostgreSQL database with mythology schema
- Phase 1: Project setup
  - Monorepo structure with Turborepo
  - TypeScript configuration
  - CI/CD with GitHub Actions

### Changed

- Migrated to Next.js 16 with React 19
- Updated to Tailwind CSS v4

### Fixed

- Various accessibility improvements
- Performance optimizations for large datasets

[Unreleased]: https://github.com/forbiddenlink/mythos/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/forbiddenlink/mythos/releases/tag/v1.0.0
