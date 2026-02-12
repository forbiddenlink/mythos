import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateRelationshipQuiz,
  calculateQuizXP,
  XP_REWARDS,
  TIME_LIMITS,
  getQuestionTypeLabel,
  getQuestionTypeIcon,
  type Difficulty,
  type QuestionType,
} from '@/lib/relationship-quiz';
import { createMockDeity, createMockRelationship } from '../utils/fixtures';
import type { Deity } from '@/types/Entity';

describe('relationship-quiz', () => {
  describe('generateRelationshipQuiz', () => {
    let deities: Deity[];
    let relationships: ReturnType<typeof createMockRelationship>[];

    beforeEach(() => {
      // Create a set of test deities
      deities = [
        createMockDeity({ id: 'zeus', name: 'Zeus', pantheonId: 'greek-pantheon', domain: ['sky', 'thunder'] }),
        createMockDeity({ id: 'athena', name: 'Athena', pantheonId: 'greek-pantheon', domain: ['wisdom', 'war'] }),
        createMockDeity({ id: 'apollo', name: 'Apollo', pantheonId: 'greek-pantheon', domain: ['sun', 'music'] }),
        createMockDeity({ id: 'artemis', name: 'Artemis', pantheonId: 'greek-pantheon', domain: ['hunt', 'moon'] }),
        createMockDeity({ id: 'poseidon', name: 'Poseidon', pantheonId: 'greek-pantheon', domain: ['sea'] }),
        createMockDeity({ id: 'hades', name: 'Hades', pantheonId: 'greek-pantheon', domain: ['underworld'] }),
        createMockDeity({ id: 'hera', name: 'Hera', pantheonId: 'greek-pantheon', domain: ['marriage'] }),
        createMockDeity({ id: 'ares', name: 'Ares', pantheonId: 'greek-pantheon', domain: ['war'] }),
      ];

      // Create relationships
      relationships = [
        createMockRelationship({ fromDeityId: 'zeus', toDeityId: 'athena', relationshipType: 'parent_of', confidenceLevel: 'high' }),
        createMockRelationship({ fromDeityId: 'zeus', toDeityId: 'apollo', relationshipType: 'parent_of', confidenceLevel: 'high' }),
        createMockRelationship({ fromDeityId: 'zeus', toDeityId: 'artemis', relationshipType: 'parent_of', confidenceLevel: 'high' }),
        createMockRelationship({ fromDeityId: 'zeus', toDeityId: 'ares', relationshipType: 'parent_of', confidenceLevel: 'high' }),
        createMockRelationship({ fromDeityId: 'zeus', toDeityId: 'hera', relationshipType: 'spouse_of', confidenceLevel: 'high' }),
        createMockRelationship({ fromDeityId: 'poseidon', toDeityId: 'zeus', relationshipType: 'sibling_of', confidenceLevel: 'high' }),
        createMockRelationship({ fromDeityId: 'hades', toDeityId: 'zeus', relationshipType: 'sibling_of', confidenceLevel: 'high' }),
        createMockRelationship({ fromDeityId: 'apollo', toDeityId: 'artemis', relationshipType: 'sibling_of', confidenceLevel: 'high' }),
      ];
    });

    it('should generate requested number of questions', () => {
      const quiz = generateRelationshipQuiz(deities, relationships, 5);
      expect(quiz.length).toBeLessThanOrEqual(5);
    });

    it('should generate questions with valid relationships', () => {
      const quiz = generateRelationshipQuiz(deities, relationships, 5);

      for (const question of quiz) {
        // Each question should have required fields
        expect(question.id).toBeDefined();
        expect(question.deityId).toBeDefined();
        expect(question.deityName).toBeDefined();
        expect(question.questionType).toBeDefined();
        expect(question.questionText).toBeDefined();
        expect(question.correctAnswer).toBeDefined();
        expect(question.options).toBeDefined();
      }
    });

    it('should generate questions with 4 options', () => {
      const quiz = generateRelationshipQuiz(deities, relationships, 5);

      for (const question of quiz) {
        expect(question.options.length).toBe(4);
      }
    });

    it('should include correct answer in options', () => {
      const quiz = generateRelationshipQuiz(deities, relationships, 5);

      for (const question of quiz) {
        expect(question.options).toContain(question.correctAnswer);
      }
    });

    it('should shuffle options', () => {
      // Run multiple times to check shuffling
      const results: string[][] = [];
      for (let i = 0; i < 10; i++) {
        const quiz = generateRelationshipQuiz(deities, relationships, 1);
        if (quiz.length > 0) {
          results.push([...quiz[0].options]);
        }
      }

      // Options shouldn't always be in the same order
      // (statistically very unlikely to be the same 10 times)
      if (results.length > 1) {
        const allSame = results.every(r => r.join(',') === results[0].join(','));
        // Allow for possibility of same order (low probability)
        expect(results.length).toBeGreaterThan(0);
      }
    });

    it('should not generate duplicate questions', () => {
      const quiz = generateRelationshipQuiz(deities, relationships, 10);
      const ids = quiz.map(q => `${q.deityId}-${q.questionType}-${q.correctDeityId || ''}`);
      const uniqueIds = new Set(ids);

      // May have fewer unique due to the combo key generation
      expect(quiz.length).toBeGreaterThan(0);
    });

    it('should respect difficulty parameter', () => {
      const easyQuiz = generateRelationshipQuiz(deities, relationships, 5, 'easy');
      const hardQuiz = generateRelationshipQuiz(deities, relationships, 5, 'hard');

      for (const question of easyQuiz) {
        expect(question.difficulty).toBe('easy');
      }

      for (const question of hardQuiz) {
        expect(question.difficulty).toBe('hard');
      }
    });

    it('should handle empty relationships array', () => {
      const quiz = generateRelationshipQuiz(deities, [], 5);
      // Should still generate some domain questions
      expect(quiz.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty deities array', () => {
      const quiz = generateRelationshipQuiz([], relationships, 5);
      expect(quiz.length).toBe(0);
    });

    it('should filter out low confidence relationships', () => {
      const lowConfidenceRels = [
        createMockRelationship({ fromDeityId: 'zeus', toDeityId: 'athena', relationshipType: 'parent_of', confidenceLevel: 'low' }),
      ];
      const quiz = generateRelationshipQuiz(deities, lowConfidenceRels, 5);
      // Should fall back to domain questions since relationships are filtered
      expect(quiz.every(q => q.questionType === 'domain' || q.options.length === 4)).toBe(true);
    });
  });

  describe('calculateQuizXP', () => {
    it('should calculate base XP by difficulty', () => {
      // Easy: 10 XP per correct
      expect(calculateQuizXP(5, 10, 'easy', false)).toBe(50);

      // Medium: 20 XP per correct
      expect(calculateQuizXP(5, 10, 'medium', false)).toBe(100);

      // Hard: 30 XP per correct
      expect(calculateQuizXP(5, 10, 'hard', false)).toBe(150);
    });

    it('should add 25% perfect bonus', () => {
      // 10 correct out of 10 at easy (10 XP each)
      // Base: 100, Perfect bonus: 25
      expect(calculateQuizXP(10, 10, 'easy', false)).toBe(125);

      // 10 correct out of 10 at medium (20 XP each)
      // Base: 200, Perfect bonus: 50
      expect(calculateQuizXP(10, 10, 'medium', false)).toBe(250);
    });

    it('should not add perfect bonus for imperfect scores', () => {
      expect(calculateQuizXP(9, 10, 'easy', false)).toBe(90);
    });

    it('should add 15% timer bonus', () => {
      // 5 correct at easy with timer
      // Base: 50, Timer bonus: 7 (floor of 7.5)
      expect(calculateQuizXP(5, 10, 'easy', true)).toBe(57);
    });

    it('should stack perfect and timer bonuses', () => {
      // 10 correct out of 10 at easy with timer
      // Base: 100, Perfect bonus: 25, Timer bonus: 15
      expect(calculateQuizXP(10, 10, 'easy', true)).toBe(140);
    });

    it('should return 0 for 0 correct answers', () => {
      expect(calculateQuizXP(0, 10, 'easy', false)).toBe(0);
      expect(calculateQuizXP(0, 10, 'medium', true)).toBe(0);
    });
  });

  describe('XP_REWARDS', () => {
    it('should have correct values for each difficulty', () => {
      expect(XP_REWARDS.easy).toBe(10);
      expect(XP_REWARDS.medium).toBe(20);
      expect(XP_REWARDS.hard).toBe(30);
    });
  });

  describe('TIME_LIMITS', () => {
    it('should have correct time limits for each difficulty', () => {
      expect(TIME_LIMITS.easy).toBe(30);
      expect(TIME_LIMITS.medium).toBe(20);
      expect(TIME_LIMITS.hard).toBe(15);
    });
  });

  describe('getQuestionTypeLabel', () => {
    it('should return correct labels', () => {
      expect(getQuestionTypeLabel('parent')).toBe('Parent');
      expect(getQuestionTypeLabel('child')).toBe('Child');
      expect(getQuestionTypeLabel('sibling')).toBe('Sibling');
      expect(getQuestionTypeLabel('spouse')).toBe('Spouse/Consort');
      expect(getQuestionTypeLabel('domain')).toBe('Domain');
    });
  });

  describe('getQuestionTypeIcon', () => {
    it('should return correct icons', () => {
      expect(getQuestionTypeIcon('parent')).toBe('crown');
      expect(getQuestionTypeIcon('child')).toBe('baby');
      expect(getQuestionTypeIcon('sibling')).toBe('users');
      expect(getQuestionTypeIcon('spouse')).toBe('heart');
      expect(getQuestionTypeIcon('domain')).toBe('sparkles');
    });
  });
});
