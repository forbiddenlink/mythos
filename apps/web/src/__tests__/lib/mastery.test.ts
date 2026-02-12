import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getMasteryLevel,
  getMasteryColor,
  getMasteryTextColor,
  getMasteryBorderColor,
  getOverallMasteryLevel,
  calculatePantheonMastery,
  getAllPantheonMasteries,
  type MasteryLevel,
  type PantheonMastery,
} from '@/lib/mastery';

describe('mastery', () => {
  describe('getMasteryLevel', () => {
    it('should return novice for 0-19', () => {
      expect(getMasteryLevel(0)).toBe('novice');
      expect(getMasteryLevel(10)).toBe('novice');
      expect(getMasteryLevel(19)).toBe('novice');
    });

    it('should return bronze for 20-39', () => {
      expect(getMasteryLevel(20)).toBe('bronze');
      expect(getMasteryLevel(30)).toBe('bronze');
      expect(getMasteryLevel(39)).toBe('bronze');
    });

    it('should return silver for 40-69', () => {
      expect(getMasteryLevel(40)).toBe('silver');
      expect(getMasteryLevel(55)).toBe('silver');
      expect(getMasteryLevel(69)).toBe('silver');
    });

    it('should return gold for 70-89', () => {
      expect(getMasteryLevel(70)).toBe('gold');
      expect(getMasteryLevel(80)).toBe('gold');
      expect(getMasteryLevel(89)).toBe('gold');
    });

    it('should return mythic for 90+', () => {
      expect(getMasteryLevel(90)).toBe('mythic');
      expect(getMasteryLevel(95)).toBe('mythic');
      expect(getMasteryLevel(100)).toBe('mythic');
    });

    it('should handle edge cases at thresholds', () => {
      expect(getMasteryLevel(19.9)).toBe('novice');
      expect(getMasteryLevel(20)).toBe('bronze');
      expect(getMasteryLevel(39.9)).toBe('bronze');
      expect(getMasteryLevel(40)).toBe('silver');
      expect(getMasteryLevel(69.9)).toBe('silver');
      expect(getMasteryLevel(70)).toBe('gold');
      expect(getMasteryLevel(89.9)).toBe('gold');
      expect(getMasteryLevel(90)).toBe('mythic');
    });
  });

  describe('getMasteryColor', () => {
    it('should return correct gradient for each level', () => {
      expect(getMasteryColor('novice')).toContain('zinc');
      expect(getMasteryColor('bronze')).toContain('orange');
      expect(getMasteryColor('silver')).toContain('slate');
      expect(getMasteryColor('gold')).toContain('amber');
      expect(getMasteryColor('mythic')).toContain('purple');
    });
  });

  describe('getMasteryTextColor', () => {
    it('should return correct text color for each level', () => {
      expect(getMasteryTextColor('novice')).toContain('zinc');
      expect(getMasteryTextColor('bronze')).toContain('orange');
      expect(getMasteryTextColor('silver')).toContain('slate');
      expect(getMasteryTextColor('gold')).toContain('amber');
      expect(getMasteryTextColor('mythic')).toContain('purple');
    });
  });

  describe('getMasteryBorderColor', () => {
    it('should return correct border color for each level', () => {
      expect(getMasteryBorderColor('novice')).toContain('zinc');
      expect(getMasteryBorderColor('bronze')).toContain('orange');
      expect(getMasteryBorderColor('silver')).toContain('slate');
      expect(getMasteryBorderColor('gold')).toContain('amber');
      expect(getMasteryBorderColor('mythic')).toContain('purple');
    });
  });

  describe('getOverallMasteryLevel', () => {
    it('should return novice for empty array', () => {
      expect(getOverallMasteryLevel([])).toBe('novice');
    });

    it('should calculate average across pantheons', () => {
      const masteries: PantheonMastery[] = [
        createMockMastery('greek-pantheon', 50),
        createMockMastery('norse-pantheon', 50),
      ];
      // Average is 50, which is silver (40-69)
      expect(getOverallMasteryLevel(masteries)).toBe('silver');
    });

    it('should handle single pantheon', () => {
      const masteries: PantheonMastery[] = [
        createMockMastery('greek-pantheon', 75),
      ];
      expect(getOverallMasteryLevel(masteries)).toBe('gold');
    });

    it('should average correctly with varied progress', () => {
      const masteries: PantheonMastery[] = [
        createMockMastery('greek-pantheon', 10),  // novice
        createMockMastery('norse-pantheon', 30),  // bronze
        createMockMastery('egyptian-pantheon', 80), // gold
      ];
      // Average: (10 + 30 + 80) / 3 = 40 → silver
      expect(getOverallMasteryLevel(masteries)).toBe('silver');
    });

    it('should handle all mythic', () => {
      const masteries: PantheonMastery[] = [
        createMockMastery('greek-pantheon', 95),
        createMockMastery('norse-pantheon', 92),
      ];
      // Average: 93.5 → mythic
      expect(getOverallMasteryLevel(masteries)).toBe('mythic');
    });

    it('should handle all novice', () => {
      const masteries: PantheonMastery[] = [
        createMockMastery('greek-pantheon', 5),
        createMockMastery('norse-pantheon', 10),
        createMockMastery('egyptian-pantheon', 15),
      ];
      // Average: 10 → novice
      expect(getOverallMasteryLevel(masteries)).toBe('novice');
    });
  });
});

// Helper function to create mock PantheonMastery
function createMockMastery(
  pantheonId: string,
  progress: number,
  overrides: Partial<PantheonMastery> = {}
): PantheonMastery {
  return {
    pantheonId,
    pantheonName: pantheonId.replace('-pantheon', ''),
    level: getMasteryLevel(progress),
    progress,
    deitiesViewed: 0,
    totalDeities: 10,
    storiesRead: 0,
    totalStories: 5,
    quizScore: 0,
    ...overrides,
  };
}

describe('calculatePantheonMastery', () => {
  it('should return mastery data for a valid pantheon', () => {
    const result = calculatePantheonMastery('greek-pantheon', [], [], {});

    expect(result.pantheonId).toBe('greek-pantheon');
    expect(result.pantheonName).toBeTruthy();
    expect(result.level).toBe('novice');
    expect(result.progress).toBe(0);
    expect(result.totalDeities).toBeGreaterThan(0);
    expect(result.totalStories).toBeGreaterThan(0);
    expect(result.deitiesViewed).toBe(0);
    expect(result.storiesRead).toBe(0);
    expect(result.quizScore).toBe(0);
  });

  it('should track viewed deities', () => {
    // Use actual deity IDs from the Greek pantheon
    const result = calculatePantheonMastery('greek-pantheon', ['zeus', 'hera'], [], {});

    expect(result.deitiesViewed).toBe(2);
    expect(result.progress).toBeGreaterThan(0);
  });

  it('should track read stories', () => {
    // Use actual story IDs from the Greek pantheon (titanomachy is a Greek story)
    const result = calculatePantheonMastery('greek-pantheon', [], ['titanomachy'], {});

    expect(result.storiesRead).toBe(1);
  });

  it('should include quiz scores in progress calculation', () => {
    const resultWithoutQuiz = calculatePantheonMastery('greek-pantheon', [], [], {});
    // Quiz key must include the pantheonId
    const resultWithQuiz = calculatePantheonMastery('greek-pantheon', [], [], { 'greek-pantheon-quiz': 100 });

    expect(resultWithQuiz.quizScore).toBe(100);
    expect(resultWithQuiz.progress).toBeGreaterThan(resultWithoutQuiz.progress);
  });

  it('should calculate weighted progress correctly', () => {
    // With 100% quiz score only, progress should be 30 (30% weight)
    const result = calculatePantheonMastery('greek-pantheon', [], [], { 'greek-pantheon-quiz': 100 });
    expect(result.progress).toBe(30);
  });

  it('should handle pantheon with no matching data gracefully', () => {
    const result = calculatePantheonMastery('nonexistent-pantheon', [], [], {});

    expect(result.pantheonId).toBe('nonexistent-pantheon');
    expect(result.totalDeities).toBe(0);
    expect(result.totalStories).toBe(0);
    expect(result.progress).toBe(0);
  });

  it('should set correct mastery level based on progress', () => {
    // View many deities and read stories to get higher progress
    const manyDeitiesViewed = [
      'zeus', 'hera', 'poseidon', 'athena', 'apollo',
      'artemis', 'ares', 'aphrodite', 'hephaestus', 'hermes',
      'demeter', 'dionysus', 'hades', 'persephone'
    ];
    const greekStories = ['titanomachy', 'prometheus-fire', 'perseus-medusa', 'theseus-minotaur', 'orpheus-eurydice'];
    const result = calculatePantheonMastery('greek-pantheon', manyDeitiesViewed, greekStories, { 'greek-pantheon-quiz': 100 });

    // Progress: ~40% deities (14/14=100*0.4=40) + ~30% stories (5 stories of total) + 30% quiz (100*0.3=30)
    // Should be silver (40-69), gold (70-89), or mythic (90+)
    expect(['silver', 'gold', 'mythic']).toContain(result.level);
  });
});

describe('getAllPantheonMasteries', () => {
  it('should return masteries for all pantheons', () => {
    const result = getAllPantheonMasteries([], [], {});

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('pantheonId');
    expect(result[0]).toHaveProperty('pantheonName');
    expect(result[0]).toHaveProperty('level');
    expect(result[0]).toHaveProperty('progress');
  });

  it('should sort pantheons by progress (descending)', () => {
    // View some Greek deities to give them higher progress
    const result = getAllPantheonMasteries(['zeus', 'hera', 'athena'], [], {});

    // Verify sorted by progress
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].progress).toBeGreaterThanOrEqual(result[i].progress);
    }
  });

  it('should track progress across multiple pantheons', () => {
    const result = getAllPantheonMasteries(
      ['zeus', 'odin', 'ra'], // Greek, Norse, Egyptian deities
      [],
      {}
    );

    const greek = result.find(m => m.pantheonId === 'greek-pantheon');
    const norse = result.find(m => m.pantheonId === 'norse-pantheon');
    const egyptian = result.find(m => m.pantheonId === 'egyptian-pantheon');

    expect(greek?.deitiesViewed).toBeGreaterThan(0);
    expect(norse?.deitiesViewed).toBeGreaterThan(0);
    expect(egyptian?.deitiesViewed).toBeGreaterThan(0);
  });

  it('should return unique pantheons', () => {
    const result = getAllPantheonMasteries([], [], {});
    const pantheonIds = result.map(m => m.pantheonId);
    const uniqueIds = [...new Set(pantheonIds)];

    expect(pantheonIds.length).toBe(uniqueIds.length);
  });
});
