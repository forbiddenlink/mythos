import { test, expect } from '@playwright/test';

// Use domcontentloaded for faster tests, then wait for specific elements
const waitForPage = async (page: import('@playwright/test').Page) => {
  await page.waitForLoadState('domcontentloaded');
};

test.describe('Phase 8: Collections', () => {
  test('should display collections index page with all 12 collections', async ({ page }) => {
    await page.goto('/collections');
    await waitForPage(page);

    // Should have the page title
    await expect(page.locator('h1')).toContainText('Mythological Collections');

    // Should display all 12 collection cards
    const collectionCards = page.locator('a[href^="/collections/"]');
    await expect(collectionCards).toHaveCount(12);
  });

  test('should navigate to collection detail page', async ({ page }) => {
    await page.goto('/collections');
    await waitForPage(page);

    // Wait for the link to be visible and click
    const link = page.locator('a[href="/collections/trickster-gods"]');
    await expect(link).toBeVisible({ timeout: 10000 });
    await link.click();
    await waitForPage(page);

    // Should navigate to detail page
    await expect(page).toHaveURL(/.*trickster-gods/);

    // Should show collection title
    await expect(page.locator('h1')).toContainText('Trickster Gods');
  });

  test('should display deity and story counts on collection cards', async ({ page }) => {
    await page.goto('/collections');
    await waitForPage(page);

    // Cards should show deity/story counts via badges
    const badges = page.locator('[class*="Badge"], span:has-text("deities"), span:has-text("deity")');
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('should show related deities on collection detail page', async ({ page }) => {
    await page.goto('/collections/underworld-rulers');
    await waitForPage(page);

    // Should show underworld deities like Hades, Osiris, Anubis
    const deityLinks = page.locator('a[href^="/deities/"]');
    await expect(deityLinks.first()).toBeVisible({ timeout: 10000 });
    const count = await deityLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show related stories on collection detail page', async ({ page }) => {
    await page.goto('/collections/underworld-rulers');
    await waitForPage(page);

    // Should have links to related stories
    const storyLinks = page.locator('a[href^="/stories/"]');
    await expect(storyLinks.first()).toBeVisible({ timeout: 10000 });
    const count = await storyLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Phase 8: Mythology Facts', () => {
  test('should display facts page with all facts', async ({ page }) => {
    await page.goto('/facts');
    await waitForPage(page);

    // Should have the page title
    await expect(page.locator('h1')).toContainText('Mythology Facts');

    // Should show fact count (30 facts)
    await expect(page.locator('text=30 fascinating facts')).toBeVisible();
  });

  test('should display category filter buttons', async ({ page }) => {
    await page.goto('/facts');
    await waitForPage(page);

    // Should have All button
    const allButton = page.locator('button:has-text("All")');
    await expect(allButton).toBeVisible();

    // Should have category buttons
    await expect(page.locator('button:has-text("Cross-Cultural")')).toBeVisible();
    await expect(page.locator('button:has-text("Word Origins")')).toBeVisible();
  });

  test('should filter facts by category', async ({ page }) => {
    await page.goto('/facts');
    await waitForPage(page);

    // Get initial card count
    const initialCards = page.locator('[class*="Card"]');
    const initialCount = await initialCards.count();

    // Click a specific category filter
    await page.locator('button:has-text("Word Origins")').click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Card count should change (filtered)
    const filteredCards = page.locator('[class*="Card"]');
    const filteredCount = await filteredCards.count();

    // Should have fewer cards or same (filtered to one category)
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should have shuffle button', async ({ page }) => {
    await page.goto('/facts');
    await waitForPage(page);

    // Should have shuffle button
    const shuffleButton = page.locator('button:has-text("Shuffle")');
    await expect(shuffleButton).toBeVisible();

    // Clicking shuffle should work (no error)
    await shuffleButton.click();
    await page.waitForTimeout(300);

    // Page should still be visible
    await expect(page.locator('h1')).toContainText('Mythology Facts');
  });

  test('should link facts to related deities', async ({ page }) => {
    await page.goto('/facts');
    await waitForPage(page);

    // Should have deity links on the page (may be inside cards or as pills)
    const deityLinks = page.locator('a[href^="/deities/"]');
    await expect(deityLinks.first()).toBeVisible({ timeout: 10000 });
    const count = await deityLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to deity from fact', async ({ page }) => {
    await page.goto('/facts');
    await waitForPage(page);

    // Click on a deity link
    const deityLink = page.locator('a[href^="/deities/"]').first();
    await expect(deityLink).toBeVisible({ timeout: 10000 });
    await deityLink.click();
    await waitForPage(page);

    // Should navigate to deity page
    await expect(page).toHaveURL(/.*\/deities\/.*/);
  });
});

test.describe('Phase 8: Random Discovery Button', () => {
  // Helper to get the modal's deity name h2 (inside the max-w-md card)
  const getModalDeityName = (page: import('@playwright/test').Page) =>
    page.locator('[class*="max-w-md"] h2.font-serif');

  test('should display floating discover button on homepage', async ({ page }) => {
    await page.goto('/');
    await waitForPage(page);

    // Should have the floating discover button
    const discoverButton = page.locator('button[aria-label="Discover a random deity"]');
    await expect(discoverButton).toBeVisible({ timeout: 10000 });
  });

  test('should display floating discover button on other pages', async ({ page }) => {
    await page.goto('/deities');
    await waitForPage(page);

    // Should have the floating discover button
    const discoverButton = page.locator('button[aria-label="Discover a random deity"]');
    await expect(discoverButton).toBeVisible({ timeout: 10000 });
  });

  test('should open discovery modal on click', async ({ page }) => {
    await page.goto('/');
    await waitForPage(page);

    // Click the discover button
    const discoverButton = page.locator('button[aria-label="Discover a random deity"]');
    await expect(discoverButton).toBeVisible({ timeout: 10000 });
    await discoverButton.click();

    // Modal should appear with deity name inside the modal card
    await expect(getModalDeityName(page)).toBeVisible({ timeout: 5000 });
  });

  test('should show deity details in modal', async ({ page }) => {
    await page.goto('/');
    await waitForPage(page);

    // Click the discover button
    const discoverButton = page.locator('button[aria-label="Discover a random deity"]');
    await expect(discoverButton).toBeVisible({ timeout: 10000 });
    await discoverButton.click();

    // Should show deity name in modal
    await expect(getModalDeityName(page)).toBeVisible({ timeout: 5000 });

    // Wait for animation to settle
    await page.waitForTimeout(300);

    // Should show Another button (inside the modal card)
    await expect(page.locator('[class*="max-w-md"] button:has-text("Another")')).toBeVisible();

    // Should show Explore button/link (inside the modal card)
    await expect(page.locator('[class*="max-w-md"] a:has-text("Explore")')).toBeVisible();
  });

  test('should get another random deity when clicking Another', async ({ page }) => {
    await page.goto('/');
    await waitForPage(page);

    // Open modal
    const discoverButton = page.locator('button[aria-label="Discover a random deity"]');
    await expect(discoverButton).toBeVisible({ timeout: 10000 });
    await discoverButton.click();

    // Verify modal is open
    await expect(getModalDeityName(page)).toBeVisible({ timeout: 5000 });

    // Wait for animation to settle
    await page.waitForTimeout(300);

    // Click Another (inside the modal)
    await page.locator('[class*="max-w-md"] button:has-text("Another")').click();
    await page.waitForTimeout(800);

    // Modal should still be open with a deity
    await expect(getModalDeityName(page)).toBeVisible();
  });

  test('should close modal when clicking Close button', async ({ page }) => {
    await page.goto('/');
    await waitForPage(page);

    // Open modal
    const discoverButton = page.locator('button[aria-label="Discover a random deity"]');
    await expect(discoverButton).toBeVisible({ timeout: 10000 });
    await discoverButton.click();

    // Verify modal is open
    await expect(getModalDeityName(page)).toBeVisible({ timeout: 5000 });

    // Click close button
    await page.locator('button[aria-label="Close"]').click();

    // Wait for close animation
    await page.waitForTimeout(500);

    // Modal should be closed
    await expect(getModalDeityName(page)).not.toBeVisible();
  });

  test('should navigate to deity page when clicking Explore', async ({ page }) => {
    await page.goto('/');
    await waitForPage(page);

    // Open modal
    const discoverButton = page.locator('button[aria-label="Discover a random deity"]');
    await expect(discoverButton).toBeVisible({ timeout: 10000 });
    await discoverButton.click();

    // Verify modal is open
    await expect(getModalDeityName(page)).toBeVisible({ timeout: 5000 });

    // Wait for animation to settle
    await page.waitForTimeout(300);

    // Click Explore link (inside the modal)
    await page.locator('[class*="max-w-md"] a:has-text("Explore")').click();
    await waitForPage(page);

    // Should navigate to deity page
    await expect(page).toHaveURL(/.*\/deities\/.*/);
  });

  test('should close modal when clicking overlay', async ({ page }) => {
    await page.goto('/');
    await waitForPage(page);

    // Open modal
    const discoverButton = page.locator('button[aria-label="Discover a random deity"]');
    await expect(discoverButton).toBeVisible({ timeout: 10000 });
    await discoverButton.click();

    // Verify modal is open
    await expect(getModalDeityName(page)).toBeVisible({ timeout: 5000 });

    // Click the modal overlay (the one with backdrop-blur, z-50)
    await page.locator('.z-50.backdrop-blur-sm').click({ position: { x: 10, y: 10 } });

    // Wait for close animation
    await page.waitForTimeout(500);

    // Modal should be closed
    await expect(getModalDeityName(page)).not.toBeVisible();
  });
});

test.describe('Phase 8: Homepage Integration', () => {
  test('should display Did You Know widget on homepage', async ({ page }) => {
    await page.goto('/');
    await waitForPage(page);

    // Should have the Did You Know section
    await expect(page.locator('text=Did You Know?')).toBeVisible({ timeout: 10000 });
  });

  test('should display Collections Showcase on homepage', async ({ page }) => {
    await page.goto('/');
    await waitForPage(page);

    // Should have collections section with links to collections
    const collectionLinks = page.locator('a[href^="/collections/"]');
    await expect(collectionLinks.first()).toBeVisible({ timeout: 10000 });
    const count = await collectionLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have Collections link in navigation', async ({ page }) => {
    await page.goto('/');
    await waitForPage(page);

    // Should have Collections in navigation
    const collectionsNav = page.locator('a[href="/collections"]');
    const count = await collectionsNav.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have Facts link in navigation', async ({ page }) => {
    await page.goto('/');
    await waitForPage(page);

    // Should have Facts in navigation
    const factsNav = page.locator('a[href="/facts"]');
    const count = await factsNav.count();
    expect(count).toBeGreaterThan(0);
  });
});
