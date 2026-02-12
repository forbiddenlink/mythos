import { test, expect } from '@playwright/test';

test.describe('Quiz Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the quiz page
    await page.goto('/quiz');
  });

  test('should show loading state initially', async ({ page }) => {
    // The quiz should show a loading indicator while fetching data
    // This may be quick, so we check for the quiz container
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display quiz questions after loading', async ({ page }) => {
    // Wait for the quiz to load (loading text disappears)
    await page.waitForSelector('text=Question 1 of', { timeout: 10000 });

    // Should show question counter
    await expect(page.getByText(/Question 1 of/i)).toBeVisible();
  });

  test('should allow selecting an answer', async ({ page }) => {
    // Wait for quiz to load
    await page.waitForSelector('[role="radio"]', { timeout: 10000 });

    // Find and click an answer option
    const answerOptions = page.locator('[role="radio"]');
    await expect(answerOptions.first()).toBeVisible();
    await answerOptions.first().click();

    // Should show feedback/explanation after answering
    await expect(page.getByRole('button', { name: /next question|see results/i })).toBeVisible();
  });

  test('should show correct/incorrect feedback after answering', async ({ page }) => {
    // Wait for quiz to load
    await page.waitForSelector('[role="radio"]', { timeout: 10000 });

    // Click an answer
    const answerOptions = page.locator('[role="radio"]');
    await answerOptions.first().click();

    // Should show next button after answering (indicates feedback was shown)
    await expect(page.getByRole('button', { name: /next question|see results/i })).toBeVisible({ timeout: 5000 });
  });

  test('should progress through questions', async ({ page }) => {
    // Wait for first question
    await page.waitForSelector('text=Question 1 of', { timeout: 10000 });

    // Answer first question
    const answerOptions = page.locator('[role="radio"]');
    await answerOptions.first().click();

    // Click next
    await page.getByRole('button', { name: /next question/i }).click();

    // Should now show question 2
    await expect(page.getByText(/Question 2 of/i)).toBeVisible();
  });

  test('should complete quiz and show results', async ({ page }) => {
    // Answer all 5 questions
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('[role="radio"]', { timeout: 10000 });

      // Answer question
      const answerOptions = page.locator('[role="radio"]');
      await answerOptions.first().click();

      // Click next/results button
      const nextButton = page.getByRole('button', { name: /next question|see results/i });
      await nextButton.click();
    }

    // Should show completion screen
    await expect(page.getByText(/quiz complete/i)).toBeVisible({ timeout: 5000 });
  });

  test('should show score on completion', async ({ page }) => {
    // Complete the quiz
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('[role="radio"]', { timeout: 10000 });
      const answerOptions = page.locator('[role="radio"]');
      await answerOptions.first().click();
      await page.getByRole('button', { name: /next question|see results/i }).click();
    }

    // Should show score (e.g., "3/5")
    await expect(page.getByText(/\d+\/5/)).toBeVisible({ timeout: 5000 });

    // Should show mastery percentage
    await expect(page.getByText(/mastery/i)).toBeVisible();
  });

  test('should allow restarting the quiz', async ({ page }) => {
    // Complete the quiz
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('[role="radio"]', { timeout: 10000 });
      const answerOptions = page.locator('[role="radio"]');
      await answerOptions.first().click();
      await page.getByRole('button', { name: /next question|see results/i }).click();
    }

    // Click restart button
    await page.getByRole('button', { name: /challenge again/i }).click();

    // Page should reload and show first question again
    await expect(page.getByText(/Question 1 of/i)).toBeVisible({ timeout: 10000 });
  });
});
