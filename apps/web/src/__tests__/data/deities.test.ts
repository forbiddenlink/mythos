import deities from '../../data/deities.json';
import pantheons from '../../data/pantheons.json';

const { describe, it, expect } = await import('vitest');

const validPantheonIds = pantheons.map((p: { id: string }) => p.id);

describe('deities.json data integrity', () => {
  it('should have at least one deity', () => {
    expect(deities.length).toBeGreaterThan(0);
  });

  it('every deity should have required fields', () => {
    for (const deity of deities) {
      expect(deity.id).toBeTruthy();
      expect(deity.name).toBeTruthy();
      expect(deity.slug).toBeTruthy();
      expect(deity.pantheonId).toBeTruthy();
      expect(deity.description).toBeTruthy();
      expect(Array.isArray(deity.domain)).toBe(true);
      expect(Array.isArray(deity.symbols)).toBe(true);
    }
  });

  it('every deity should have a valid pantheonId', () => {
    for (const deity of deities) {
      expect(validPantheonIds).toContain(deity.pantheonId);
    }
  });

  it('every deity should have a unique id', () => {
    const ids = deities.map((d: { id: string }) => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('every deity should have a unique slug', () => {
    const slugs = deities.map((d: { slug: string }) => d.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it('every deity id should match its slug', () => {
    for (const deity of deities) {
      expect(deity.id).toBe(deity.slug);
    }
  });

  it('every deity should have a valid gender', () => {
    const validGenders = ['male', 'female', 'androgynous', 'none', null];
    for (const deity of deities) {
      expect(validGenders).toContain(deity.gender);
    }
  });

  it('every deity should have a non-empty domain array', () => {
    for (const deity of deities) {
      expect(deity.domain.length).toBeGreaterThan(0);
    }
  });

  it('importanceRank should be a positive number when present', () => {
    for (const deity of deities) {
      if (deity.importanceRank !== null) {
        expect(deity.importanceRank).toBeGreaterThan(0);
      }
    }
  });
});
