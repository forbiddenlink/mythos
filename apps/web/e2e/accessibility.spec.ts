import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = 'http://localhost:3001';

const pagesToTest = [
  { path: '/', name: 'Homepage' },
  { path: '/deities', name: 'Deities' },
  { path: '/pantheons', name: 'Pantheons' },
  { path: '/stories', name: 'Stories' },
  { path: '/quiz', name: 'Quiz Hub' },
  { path: '/achievements', name: 'Achievements' },
  { path: '/compare', name: 'Compare' },
  { path: '/learning-paths', name: 'Learning Paths' },
];

test.describe('Accessibility', () => {
  for (const page of pagesToTest) {
    test(`${page.name} page should not have critical accessibility violations`, async ({ page: playwrightPage }) => {
      await playwrightPage.goto(`${BASE_URL}${page.path}`);

      // Wait for page to load
      await playwrightPage.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page: playwrightPage })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Log violations for debugging
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`\n=== ${page.name} Violations ===`);
        for (const violation of accessibilityScanResults.violations) {
          console.log(`\n[${violation.impact}] ${violation.id}: ${violation.description}`);
          console.log(`  Help: ${violation.helpUrl}`);
          for (const node of violation.nodes.slice(0, 3)) {
            console.log(`  - ${node.html.substring(0, 100)}`);
          }
        }
      }

      // Filter for serious/critical violations only
      const criticalViolations = accessibilityScanResults.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(criticalViolations).toEqual([]);
    });
  }
});
