import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateNextReview,
  isCardDue,
  updateCardState,
  calculateAccuracy,
  createInitialCardState,
  getNextReviewDate,
  getToday,
  getYesterday,
  generateCardId,
  type DifficultyRating,
  type CardState,
} from '@/lib/spaced-repetition';

describe('spaced-repetition', () => {
  describe('calculateNextReview', () => {
    it('should reset interval to 1 for rating 1 (Forgot)', () => {
      const result = calculateNextReview(10, 1, 2.5);
      expect(result.interval).toBe(1);
    });

    it('should decrease easeFactor on rating 1 (Forgot)', () => {
      const result = calculateNextReview(10, 1, 2.5);
      expect(result.easeFactor).toBe(2.3);
    });

    it('should not let easeFactor go below minimum (1.3) on rating 1', () => {
      const result = calculateNextReview(10, 1, 1.4);
      expect(result.easeFactor).toBe(1.3);
    });

    it('should give small increase for rating 2 (Hard)', () => {
      const result = calculateNextReview(10, 2, 2.5);
      // 10 * 1.2 = 12
      expect(result.interval).toBe(12);
    });

    it('should decrease easeFactor slightly on rating 2', () => {
      const result = calculateNextReview(10, 2, 2.5);
      expect(result.easeFactor).toBe(2.35);
    });

    it('should not let easeFactor go below minimum on rating 2', () => {
      const result = calculateNextReview(10, 2, 1.35);
      expect(result.easeFactor).toBe(1.3);
    });

    it('should give standard increase for rating 3 (Good)', () => {
      const result = calculateNextReview(10, 3, 2.5);
      // 10 * 2.5 * (2.5/2.5) = 25
      expect(result.interval).toBe(25);
    });

    it('should not change easeFactor on rating 3', () => {
      const result = calculateNextReview(10, 3, 2.5);
      expect(result.easeFactor).toBe(2.5);
    });

    it('should give larger increase for rating 4 (Easy)', () => {
      const result = calculateNextReview(10, 4, 2.5);
      // 10 * 2.5 * 1.3 * (2.5/2.5) = 32.5 ≈ 33
      expect(result.interval).toBe(33);
    });

    it('should increase easeFactor on rating 4', () => {
      const result = calculateNextReview(10, 4, 2.5);
      expect(result.easeFactor).toBe(2.6);
    });

    it('should cap easeFactor at maximum (3.0) on rating 4', () => {
      const result = calculateNextReview(10, 4, 2.95);
      expect(result.easeFactor).toBe(3.0);
    });

    it('should return minimum interval of 1 even for small calculations', () => {
      const result = calculateNextReview(0, 2, 2.5);
      expect(result.interval).toBeGreaterThanOrEqual(1);
    });

    it('should handle first review (interval 1) correctly', () => {
      const result = calculateNextReview(1, 3, 2.5);
      expect(result.interval).toBeGreaterThanOrEqual(1);
    });

    it('should use default easeFactor when not provided', () => {
      const result = calculateNextReview(10, 3);
      // Should use 2.5 as default
      expect(result.interval).toBe(25);
    });

    // Test all ratings systematically
    describe.each([
      [1, 10, 2.5, 1, 2.3],
      [2, 10, 2.5, 12, 2.35],
      [3, 10, 2.5, 25, 2.5],
      [4, 10, 2.5, 33, 2.6],
    ] as const)('rating %i with interval %i and easeFactor %f', (rating, interval, easeFactor, expectedInterval, expectedEase) => {
      it(`should return interval ${expectedInterval} and easeFactor ${expectedEase}`, () => {
        const result = calculateNextReview(interval, rating as DifficultyRating, easeFactor);
        expect(result.interval).toBe(expectedInterval);
        expect(result.easeFactor).toBeCloseTo(expectedEase, 2);
      });
    });
  });

  describe('isCardDue', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return true for past dates', () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const cardState: CardState = {
        interval: 1,
        nextReview: '2024-01-10',
        easeFactor: 2.5,
        reviews: 1,
        lapses: 0,
      };
      expect(isCardDue(cardState)).toBe(true);
    });

    it('should return true for today', () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const cardState: CardState = {
        interval: 1,
        nextReview: '2024-01-15',
        easeFactor: 2.5,
        reviews: 1,
        lapses: 0,
      };
      expect(isCardDue(cardState)).toBe(true);
    });

    it('should return false for future dates', () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const cardState: CardState = {
        interval: 1,
        nextReview: '2024-01-20',
        easeFactor: 2.5,
        reviews: 1,
        lapses: 0,
      };
      expect(isCardDue(cardState)).toBe(false);
    });
  });

  describe('updateCardState', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should increment reviews count', () => {
      const initial: CardState = {
        interval: 1,
        nextReview: '2024-01-15',
        easeFactor: 2.5,
        reviews: 3,
        lapses: 0,
      };
      const result = updateCardState(initial, 3);
      expect(result.reviews).toBe(4);
    });

    it('should increment lapses on rating 1', () => {
      const initial: CardState = {
        interval: 1,
        nextReview: '2024-01-15',
        easeFactor: 2.5,
        reviews: 3,
        lapses: 1,
      };
      const result = updateCardState(initial, 1);
      expect(result.lapses).toBe(2);
    });

    it('should not increment lapses on other ratings', () => {
      const initial: CardState = {
        interval: 1,
        nextReview: '2024-01-15',
        easeFactor: 2.5,
        reviews: 3,
        lapses: 1,
      };
      expect(updateCardState(initial, 2).lapses).toBe(1);
      expect(updateCardState(initial, 3).lapses).toBe(1);
      expect(updateCardState(initial, 4).lapses).toBe(1);
    });

    it('should return immutable result (not modify original)', () => {
      const initial: CardState = {
        interval: 1,
        nextReview: '2024-01-15',
        easeFactor: 2.5,
        reviews: 3,
        lapses: 1,
      };
      const result = updateCardState(initial, 3);
      expect(result).not.toBe(initial);
      expect(initial.reviews).toBe(3);
    });

    it('should update nextReview date based on new interval', () => {
      const initial: CardState = {
        interval: 1,
        nextReview: '2024-01-15',
        easeFactor: 2.5,
        reviews: 0,
        lapses: 0,
      };
      const result = updateCardState(initial, 3);
      expect(result.nextReview).not.toBe('2024-01-15');
    });
  });

  describe('calculateAccuracy', () => {
    it('should return 0 when total is 0', () => {
      expect(calculateAccuracy(0, 0)).toBe(0);
    });

    it('should calculate 100% for all correct', () => {
      expect(calculateAccuracy(10, 10)).toBe(100);
    });

    it('should calculate 0% for none correct', () => {
      expect(calculateAccuracy(0, 10)).toBe(0);
    });

    it('should calculate 50% correctly', () => {
      expect(calculateAccuracy(5, 10)).toBe(50);
    });

    it('should round to nearest integer', () => {
      expect(calculateAccuracy(1, 3)).toBe(33);
      expect(calculateAccuracy(2, 3)).toBe(67);
    });
  });

  describe('createInitialCardState', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should create card with interval 1', () => {
      const state = createInitialCardState();
      expect(state.interval).toBe(1);
    });

    it('should create card due today', () => {
      const state = createInitialCardState();
      expect(state.nextReview).toBe('2024-01-15');
    });

    it('should create card with default easeFactor', () => {
      const state = createInitialCardState();
      expect(state.easeFactor).toBe(2.5);
    });

    it('should create card with zero reviews and lapses', () => {
      const state = createInitialCardState();
      expect(state.reviews).toBe(0);
      expect(state.lapses).toBe(0);
    });
  });

  describe('getNextReviewDate', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should add days to current date', () => {
      expect(getNextReviewDate(1)).toBe('2024-01-16');
      expect(getNextReviewDate(7)).toBe('2024-01-22');
      expect(getNextReviewDate(30)).toBe('2024-02-14');
    });
  });

  describe('getToday', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return ISO date string', () => {
      vi.setSystemTime(new Date('2024-01-15T10:30:00'));
      expect(getToday()).toBe('2024-01-15');
    });
  });

  describe('getYesterday', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return yesterday date', () => {
      vi.setSystemTime(new Date('2024-01-15'));
      expect(getYesterday()).toBe('2024-01-14');
    });

    it('should handle month boundary', () => {
      vi.setSystemTime(new Date('2024-02-01'));
      expect(getYesterday()).toBe('2024-01-31');
    });
  });

  describe('generateCardId', () => {
    it('should generate unique card ID', () => {
      const id = generateCardId('deity-recognition', 'zeus');
      expect(id).toBe('deity-recognition:zeus');
    });

    it('should handle different types', () => {
      expect(generateCardId('domain-match', 'athena')).toBe('domain-match:athena');
      expect(generateCardId('pantheon-match', 'apollo')).toBe('pantheon-match:apollo');
    });
  });
});
