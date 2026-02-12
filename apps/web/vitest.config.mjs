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
      include: [
        'src/lib/spaced-repetition.ts',
        'src/lib/mastery.ts',
        'src/lib/search.ts',
        'src/lib/relationship-quiz.ts',
        'src/lib/utils.ts',
        'src/hooks/use-debounce.ts',
        'src/providers/progress-provider.tsx',
      ],
      exclude: ['**/*.d.ts', '**/types/**', '**/__tests__/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
