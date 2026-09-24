# Contributing to Mythos Atlas

Thank you for your interest in contributing to Mythos Atlas! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all backgrounds and experience levels.

## Getting Started

### Prerequisites

- Node.js matching `.nvmrc` (22.22.2 pin)
- pnpm matching root `packageManager` (10.34.5)

### Setup

1. Fork and clone the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/mythos.git
   cd mythos
   ```

2. Install dependencies:

   ```bash
   nvm use
   pnpm install --frozen-lockfile
   ```

3. Start the development server:

   ```bash
   cd apps/web
   pnpm dev
   ```

## Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

- `codex/*` - Agent-assisted integration and feature work

Do not remove a branch or worktree until its unique commits are merged or preserved in the replacement PR, and the worktree is clean. Close superseded PRs with a reference to the replacement; production deployment follows the main-branch workflow.

### Making Changes

1. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards

3. Run tests and linting:

   ```bash
   pnpm lint
   pnpm --filter web exec tsc --noEmit
   pnpm --filter web test:coverage
   pnpm --filter web e2e
   ```

4. Commit your changes with a descriptive message:

   ```bash
   git commit -m "feat: add new mythology feature"
   ```

5. Push and create a pull request

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Prefer functional components with hooks

### Styling

- Use Tailwind CSS utility classes
- Read `apps/web/public/design-system.txt` and `.impeccable.md`; use the existing design tokens
- Ensure responsive design
- Test accessibility (WCAG 2.1 AA)

### Testing

- Write unit tests for utilities and hooks (Vitest)
- Write E2E tests for critical user flows (Playwright)

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Record significant changes in the PR and audit notes; leave release-managed `CHANGELOG.md` entries to the release workflow
4. Request review from maintainers
5. Address review feedback

## Questions?

- Open a [GitHub Issue](https://github.com/forbiddenlink/mythos/issues)
- Check existing issues and documentation

Thank you for contributing!
