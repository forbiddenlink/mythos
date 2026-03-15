# Contributing to Mythos Atlas

Thank you for your interest in contributing to Mythos Atlas! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all backgrounds and experience levels.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Setup

1. Fork and clone the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/mythos.git
   cd mythos
   ```

2. Install dependencies:

   ```bash
   pnpm install
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

### Making Changes

1. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards

3. Run tests and linting:

   ```bash
   pnpm lint
   pnpm test
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
- Follow the existing design system
- Ensure responsive design
- Test accessibility (WCAG 2.1 AA)

### Testing

- Write unit tests for utilities and hooks (Vitest)
- Write E2E tests for critical user flows (Playwright)

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add changelog entry for significant changes
4. Request review from maintainers
5. Address review feedback

## Questions?

- Open a [GitHub Issue](https://github.com/forbiddenlink/mythos/issues)
- Check existing issues and documentation

Thank you for contributing!
