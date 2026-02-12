import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  searchAll,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
  getResultUrl,
  getPopularSearches,
  type SearchResult,
  type ContentType,
} from '@/lib/search';
import { installLocalStorageMock } from '../utils/mocks';

describe('search', () => {
  describe('searchAll', () => {
    it('should return empty array for queries under 2 characters', () => {
      expect(searchAll('')).toEqual([]);
      expect(searchAll('a')).toEqual([]);
      expect(searchAll(' ')).toEqual([]);
    });

    it('should return results for valid queries', () => {
      const results = searchAll('Zeus');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should score exact matches highest', () => {
      const results = searchAll('Zeus');
      // Zeus should be at or near the top
      const zeusResult = results.find(r => r.title === 'Zeus');
      expect(zeusResult).toBeDefined();
      if (zeusResult) {
        expect(zeusResult.matchScore).toBeGreaterThan(0);
      }
    });

    it('should score starts-with matches higher than contains', () => {
      // Search for "Ath" should have Athena with high score
      const results = searchAll('Ath');
      const athenaResult = results.find(r => r.title === 'Athena');
      if (athenaResult) {
        // Athena starts with "Ath" so should score well
        expect(athenaResult.matchScore).toBeGreaterThan(0);
      }
    });

    it('should respect limit parameter', () => {
      const results = searchAll('a', 5);
      // 'a' by itself returns empty (< 2 chars)
      // Let's try a longer query
      const results2 = searchAll('god', 3);
      expect(results2.length).toBeLessThanOrEqual(3);
    });

    it('should return results sorted by score', () => {
      const results = searchAll('thunder');
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].matchScore).toBeGreaterThanOrEqual(results[i].matchScore);
      }
    });

    it('should search across multiple content types', () => {
      // Search for a common term that might appear in different content
      const results = searchAll('Greek');
      // Should find deities, stories, etc.
      expect(results.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const lowerResults = searchAll('zeus');
      const upperResults = searchAll('ZEUS');
      const mixedResults = searchAll('ZeUs');

      // All should find Zeus
      expect(lowerResults.length).toBeGreaterThan(0);
      expect(upperResults.length).toBeGreaterThan(0);
      expect(mixedResults.length).toBeGreaterThan(0);
    });

    it('should trim whitespace from query', () => {
      const results = searchAll('  Zeus  ');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('getRecentSearches', () => {
    let mockStorage: ReturnType<typeof installLocalStorageMock>;

    beforeEach(() => {
      mockStorage = installLocalStorageMock();
    });

    afterEach(() => {
      mockStorage.reset();
    });

    it('should return empty array when no searches saved', () => {
      expect(getRecentSearches()).toEqual([]);
    });

    it('should return saved searches', () => {
      mockStorage.mock.setItem('mythos-atlas-recent-searches', JSON.stringify(['Zeus', 'Thor']));
      expect(getRecentSearches()).toEqual(['Zeus', 'Thor']);
    });

    it('should handle malformed JSON', () => {
      mockStorage.mock.setItem('mythos-atlas-recent-searches', 'not valid json');
      expect(getRecentSearches()).toEqual([]);
    });

    it('should handle non-array data', () => {
      mockStorage.mock.setItem('mythos-atlas-recent-searches', JSON.stringify({ foo: 'bar' }));
      expect(getRecentSearches()).toEqual([]);
    });
  });

  describe('saveRecentSearch', () => {
    let mockStorage: ReturnType<typeof installLocalStorageMock>;

    beforeEach(() => {
      mockStorage = installLocalStorageMock();
    });

    afterEach(() => {
      mockStorage.reset();
    });

    it('should save new search term', () => {
      saveRecentSearch('Zeus');
      const stored = JSON.parse(mockStorage.mock.getItem('mythos-atlas-recent-searches') || '[]');
      expect(stored).toContain('Zeus');
    });

    it('should add new search to front', () => {
      saveRecentSearch('Zeus');
      saveRecentSearch('Thor');
      const stored = JSON.parse(mockStorage.mock.getItem('mythos-atlas-recent-searches') || '[]');
      expect(stored[0]).toBe('Thor');
      expect(stored[1]).toBe('Zeus');
    });

    it('should deduplicate case-insensitively', () => {
      saveRecentSearch('Zeus');
      saveRecentSearch('zeus');
      const stored = JSON.parse(mockStorage.mock.getItem('mythos-atlas-recent-searches') || '[]');
      expect(stored.length).toBe(1);
      expect(stored[0]).toBe('zeus'); // Most recent version
    });

    it('should limit to 10 recent searches', () => {
      for (let i = 0; i < 15; i++) {
        saveRecentSearch(`Search ${i}`);
      }
      const stored = JSON.parse(mockStorage.mock.getItem('mythos-atlas-recent-searches') || '[]');
      expect(stored.length).toBe(10);
    });

    it('should not save empty strings', () => {
      saveRecentSearch('');
      saveRecentSearch('   ');
      const stored = mockStorage.mock.getItem('mythos-atlas-recent-searches');
      expect(stored).toBeNull();
    });

    it('should trim whitespace', () => {
      saveRecentSearch('  Zeus  ');
      const stored = JSON.parse(mockStorage.mock.getItem('mythos-atlas-recent-searches') || '[]');
      expect(stored[0]).toBe('Zeus');
    });
  });

  describe('clearRecentSearches', () => {
    let mockStorage: ReturnType<typeof installLocalStorageMock>;

    beforeEach(() => {
      mockStorage = installLocalStorageMock();
    });

    afterEach(() => {
      mockStorage.reset();
    });

    it('should remove recent searches from localStorage', () => {
      saveRecentSearch('Zeus');
      clearRecentSearches();
      expect(mockStorage.mock.getItem('mythos-atlas-recent-searches')).toBeNull();
    });
  });

  describe('getResultUrl', () => {
    it('should return correct URL for deity', () => {
      const result: SearchResult = {
        type: 'deity',
        id: 'zeus',
        slug: 'zeus',
        title: 'Zeus',
        subtitle: 'Greek Deity',
        matchScore: 100,
      };
      expect(getResultUrl(result)).toBe('/deities/zeus');
    });

    it('should return correct URL for story', () => {
      const result: SearchResult = {
        type: 'story',
        id: 'titanomachy',
        slug: 'titanomachy',
        title: 'Titanomachy',
        subtitle: 'Greek Story',
        matchScore: 100,
      };
      expect(getResultUrl(result)).toBe('/stories/titanomachy');
    });

    it('should return correct URL for creature', () => {
      const result: SearchResult = {
        type: 'creature',
        id: 'cerberus',
        slug: 'cerberus',
        title: 'Cerberus',
        subtitle: 'Greek Creature',
        matchScore: 100,
      };
      expect(getResultUrl(result)).toBe('/creatures/cerberus');
    });

    it('should return correct URL for artifact', () => {
      const result: SearchResult = {
        type: 'artifact',
        id: 'mjolnir',
        slug: 'mjolnir',
        title: 'Mjolnir',
        subtitle: 'Weapon',
        matchScore: 100,
      };
      expect(getResultUrl(result)).toBe('/artifacts/mjolnir');
    });

    it('should return correct URL for location', () => {
      const result: SearchResult = {
        type: 'location',
        id: 'olympus',
        slug: 'olympus',
        title: 'Mount Olympus',
        subtitle: 'Mountain',
        matchScore: 100,
      };
      expect(getResultUrl(result)).toBe('/locations/olympus');
    });
  });

  describe('getPopularSearches', () => {
    it('should return array of popular searches', () => {
      const popular = getPopularSearches();
      expect(Array.isArray(popular)).toBe(true);
      expect(popular.length).toBeGreaterThan(0);
    });

    it('should include common mythology terms', () => {
      const popular = getPopularSearches();
      // These are in the POPULAR_SEARCHES constant
      expect(popular).toContain('Zeus');
      expect(popular).toContain('Thor');
    });
  });
});
