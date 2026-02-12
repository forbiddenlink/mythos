import deitiesData from '@/data/deities.json';
import storiesData from '@/data/stories.json';

export type MasteryLevel = 'novice' | 'bronze' | 'silver' | 'gold' | 'mythic';

export interface PantheonMastery {
  pantheonId: string;
  pantheonName: string;
  level: MasteryLevel;
  progress: number; // 0-100
  deitiesViewed: number;
  totalDeities: number;
  storiesRead: number;
  totalStories: number;
  quizScore: number;
}

interface Deity {
  id: string;
  pantheonId: string;
}

interface Story {
  id: string;
  pantheonId: string;
}

const PANTHEON_NAMES: Record<string, string> = {
  'greek-pantheon': 'Greek',
  'norse-pantheon': 'Norse',
  'egyptian-pantheon': 'Egyptian',
  'roman-pantheon': 'Roman',
  'celtic-pantheon': 'Celtic',
  'hindu-pantheon': 'Hindu',
  'japanese-pantheon': 'Japanese',
  'chinese-pantheon': 'Chinese',
  'aztec-pantheon': 'Aztec',
  'mesoamerican-pantheon': 'Mesoamerican',
  'mesopotamian-pantheon': 'Mesopotamian',
};

const MASTERY_THRESHOLDS = {
  novice: 0,
  bronze: 20,
  silver: 40,
  gold: 70,
  mythic: 90,
};

export function getMasteryLevel(progress: number): MasteryLevel {
  if (progress >= MASTERY_THRESHOLDS.mythic) return 'mythic';
  if (progress >= MASTERY_THRESHOLDS.gold) return 'gold';
  if (progress >= MASTERY_THRESHOLDS.silver) return 'silver';
  if (progress >= MASTERY_THRESHOLDS.bronze) return 'bronze';
  return 'novice';
}

export function getMasteryColor(level: MasteryLevel): string {
  switch (level) {
    case 'mythic':
      return 'from-purple-500 to-indigo-500';
    case 'gold':
      return 'from-amber-400 to-yellow-500';
    case 'silver':
      return 'from-slate-300 to-gray-400';
    case 'bronze':
      return 'from-orange-400 to-amber-600';
    default:
      return 'from-zinc-500 to-zinc-600';
  }
}

export function getMasteryTextColor(level: MasteryLevel): string {
  switch (level) {
    case 'mythic':
      return 'text-purple-500';
    case 'gold':
      return 'text-amber-500';
    case 'silver':
      return 'text-slate-400';
    case 'bronze':
      return 'text-orange-500';
    default:
      return 'text-zinc-500';
  }
}

export function getMasteryBorderColor(level: MasteryLevel): string {
  switch (level) {
    case 'mythic':
      return 'border-purple-500/30';
    case 'gold':
      return 'border-amber-500/30';
    case 'silver':
      return 'border-slate-400/30';
    case 'bronze':
      return 'border-orange-500/30';
    default:
      return 'border-zinc-500/30';
  }
}

export function calculatePantheonMastery(
  pantheonId: string,
  deitiesViewed: string[],
  storiesRead: string[],
  quizScores: Record<string, number>
): PantheonMastery {
  const deities = (deitiesData as Deity[]).filter(d => d.pantheonId === pantheonId);
  const stories = (storiesData as Story[]).filter(s => s.pantheonId === pantheonId);

  const viewedCount = deities.filter(d => deitiesViewed.includes(d.id)).length;
  const readCount = stories.filter(s => storiesRead.includes(s.id)).length;

  // Get quiz scores for this pantheon
  const pantheonQuizScores = Object.entries(quizScores)
    .filter(([key]) => key.startsWith(pantheonId) || key.includes(pantheonId))
    .map(([, score]) => score);

  const avgQuizScore =
    pantheonQuizScores.length > 0
      ? pantheonQuizScores.reduce((sum, s) => sum + s, 0) / pantheonQuizScores.length
      : 0;

  // Calculate overall progress (weighted average)
  // 40% deities, 30% stories, 30% quiz
  const deityProgress = deities.length > 0 ? (viewedCount / deities.length) * 100 : 0;
  const storyProgress = stories.length > 0 ? (readCount / stories.length) * 100 : 0;

  const overallProgress = Math.round(
    deityProgress * 0.4 + storyProgress * 0.3 + avgQuizScore * 0.3
  );

  return {
    pantheonId,
    pantheonName: PANTHEON_NAMES[pantheonId] || pantheonId.replace('-pantheon', ''),
    level: getMasteryLevel(overallProgress),
    progress: overallProgress,
    deitiesViewed: viewedCount,
    totalDeities: deities.length,
    storiesRead: readCount,
    totalStories: stories.length,
    quizScore: Math.round(avgQuizScore),
  };
}

export function getAllPantheonMasteries(
  deitiesViewed: string[],
  storiesRead: string[],
  quizScores: Record<string, number>
): PantheonMastery[] {
  // Get unique pantheon IDs from deities
  const pantheonIds = [...new Set((deitiesData as Deity[]).map(d => d.pantheonId))];

  return pantheonIds
    .map(id => calculatePantheonMastery(id, deitiesViewed, storiesRead, quizScores))
    .sort((a, b) => b.progress - a.progress);
}

export function getOverallMasteryLevel(masteries: PantheonMastery[]): MasteryLevel {
  if (masteries.length === 0) return 'novice';
  const avgProgress = masteries.reduce((sum, m) => sum + m.progress, 0) / masteries.length;
  return getMasteryLevel(avgProgress);
}
