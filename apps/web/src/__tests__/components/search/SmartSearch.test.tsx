import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// The SmartSearch component uses cmdk (Command Menu) which is complex to test in jsdom
// because it relies on DOM measurements and scroll behavior. We test the underlying
// search logic directly and use E2E tests for the full component.

// Test the search library functions directly since they're the core logic
import { searchAll, getResultUrl, getPopularSearches, type SearchResult } from '@/lib/search';

describe('SmartSearch (search library)', () => {
  describe('searchAll', () => {
    it('should return results for valid queries', () => {
      const results = searchAll('Zeus', 10);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty for short queries', () => {
      const results = searchAll('a', 10);
      expect(results.length).toBe(0);
    });

    it('should limit results', () => {
      const results = searchAll('god', 3);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should be case insensitive', () => {
      const lowerResults = searchAll('zeus');
      const upperResults = searchAll('ZEUS');
      const mixedResults = searchAll('ZeUs');

      // All should return results
      expect(lowerResults.length).toBeGreaterThan(0);
      expect(upperResults.length).toBeGreaterThan(0);
      expect(mixedResults.length).toBeGreaterThan(0);
    });
  });

  describe('getResultUrl', () => {
    it('should generate correct URL for deity', () => {
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

    it('should generate correct URL for story', () => {
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

    it('should generate correct URL for creature', () => {
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

    it('should generate correct URL for artifact', () => {
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

    it('should generate correct URL for location', () => {
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
    it('should return array of strings', () => {
      const popular = getPopularSearches();
      expect(Array.isArray(popular)).toBe(true);
      expect(popular.length).toBeGreaterThan(0);
      expect(typeof popular[0]).toBe('string');
    });

    it('should include common mythology terms', () => {
      const popular = getPopularSearches();
      expect(popular).toContain('Zeus');
      expect(popular).toContain('Thor');
    });
  });
});

// Test the SmartSearch component module exists and exports correctly
describe('SmartSearch component', () => {
  it('should be importable', async () => {
    const module = await import('@/components/search/SmartSearch');
    expect(module.SmartSearch).toBeDefined();
    expect(typeof module.SmartSearch).toBe('function');
  });
});
