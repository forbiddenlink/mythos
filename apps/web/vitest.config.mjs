import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.js'],
    include: ['src/__tests__/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    server: {
      deps: {
        inline: ['react', 'react-dom', '@testing-library/react'],
      },
    },
    coverage: {
      provider: 'v8',
      // Gate: every module under src/lib/** (including lib/oracle,
      // lib/analytics, lib/search, lib/http) plus the two tested hook/provider
      // files. Thresholds sit a couple of points under the measured
      // aggregate (Sep 2026: lines 66.5, statements 64.8, functions 71.1,
      // branches 54.1) so a real regression fails CI. Components and app
      // routes are covered by Playwright, not by this gate.
      include: [
        'src/lib/**/*.{ts,tsx}',
        'src/hooks/use-debounce.ts',
        'src/providers/progress-provider.tsx',
      ],
      exclude: ['**/*.d.ts', '**/types/**', '**/__tests__/**'],
      thresholds: {
        lines: 64,
        statements: 62,
        functions: 68,
        branches: 52,
        // The original strict gate stays in force for the core learning
        // modules that have always had dedicated unit tests.
        'src/{lib/spaced-repetition,lib/mastery,lib/search,lib/relationship-quiz,lib/utils,hooks/use-debounce}.ts': {
          lines: 80,
          functions: 80,
          branches: 70,
          statements: 80,
        },
        'src/providers/progress-provider.tsx': {
          lines: 80,
          functions: 80,
          branches: 70,
          statements: 80,
        },
        'src/lib/analytics/**': {
          lines: 90,
          functions: 90,
          branches: 80,
          statements: 85,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Server-only modules are exercised directly in unit tests; the marker
      // package throws outside the react-server condition, so stub it here.
      'server-only': resolve(__dirname, './node_modules/server-only/empty.js'),
    },
  },
});
