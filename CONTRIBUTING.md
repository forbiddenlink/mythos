# Contributing to Mythos Atlas

Thank you for your interest in contributing to Mythos Atlas! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all backgrounds and experience levels.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- Rust (for API development)
- PostgreSQL 15+ (for local database)

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

3. Copy environment variables:

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

4. Start the development server:
   ```bash
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

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Prefer functional components with hooks
- Add JSDoc comments for public APIs

### Styling

- Use Tailwind CSS utility classes
- Follow the existing design system
- Ensure responsive design
- Test accessibility (WCAG 2.1 AA)

### Testing

- Write unit tests for utilities and hooks
- Write integration tests for components
- Write E2E tests for critical user flows
- Maintain test coverage above 80%

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add changelog entry for significant changes
4. Request review from maintainers
5. Address review feedback
6. Squash commits before merging

## Reporting Issues

### Bug Reports

Include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment info
- Screenshots if applicable

### Feature Requests

Include:

- Clear description of the feature
- Use case and motivation
- Proposed implementation (optional)
- Mockups or examples (optional)

## Questions?

- Open a [GitHub Discussion](https://github.com/mythos-atlas/mythos/discussions)
- Check existing issues and documentation

Thank you for contributing!
