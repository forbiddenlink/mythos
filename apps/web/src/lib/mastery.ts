import deitiesData from "@/data/deities.json";
import storiesData from "@/data/stories.json";

export type MasteryLevel = "novice" | "bronze" | "silver" | "gold" | "mythic";

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
  "greek-pantheon": "Greek",
  "norse-pantheon": "Norse",
  "egyptian-pantheon": "Egyptian",
  "roman-pantheon": "Roman",
  "celtic-pantheon": "Celtic",
  "hindu-pantheon": "Hindu",
  "japanese-pantheon": "Japanese",
  "chinese-pantheon": "Chinese",
  "aztec-pantheon": "Aztec",
  "mesoamerican-pantheon": "Mesoamerican",
  "mesopotamian-pantheon": "Mesopotamian",
};

const MASTERY_THRESHOLDS = {
  novice: 0,
  bronze: 20,
  silver: 40,
  gold: 70,
  mythic: 90,
};

export function getMasteryLevel(progress: number): MasteryLevel {
  if (progress >= MASTERY_THRESHOLDS.mythic) return "mythic";
  if (progress >= MASTERY_THRESHOLDS.gold) return "gold";
  if (progress >= MASTERY_THRESHOLDS.silver) return "silver";
  if (progress >= MASTERY_THRESHOLDS.bronze) return "bronze";
  return "novice";
}

export function getMasteryColor(level: MasteryLevel): string {
  switch (level) {
    case "mythic":
      return "from-bronze to-gold";
    case "gold":
      return "from-gold-dark to-gold";
    case "silver":
      return "from-muted-foreground/40 to-muted-foreground/70";
    case "bronze":
      return "from-bronze to-bronze/70";
    default:
      return "from-muted to-muted-foreground/50";
  }
}

export function getMasteryTextColor(level: MasteryLevel): string {
  switch (level) {
    case "mythic":
      return "text-bronze";
    case "gold":
      return "text-gold";
    case "silver":
      return "text-muted-foreground";
    case "bronze":
      return "text-bronze";
    default:
      return "text-muted-foreground";
  }
}

export function getMasteryBorderColor(level: MasteryLevel): string {
  switch (level) {
    case "mythic":
      return "border-bronze/40";
    case "gold":
      return "border-gold/30";
    case "silver":
      return "border-border";
    case "bronze":
      return "border-bronze/30";
    default:
      return "border-border";
  }
}

export function calculatePantheonMastery(
  pantheonId: string,
  deitiesViewed: string[],
  storiesRead: string[],
  quizScores: Record<string, number>,
): PantheonMastery {
  const deities = (deitiesData as Deity[]).filter(
    (d) => d.pantheonId === pantheonId,
  );
  const stories = (storiesData as Story[]).filter(
    (s) => s.pantheonId === pantheonId,
  );

  const viewedCount = deities.filter((d) =>
    deitiesViewed.includes(d.id),
  ).length;
  const readCount = stories.filter((s) => storiesRead.includes(s.id)).length;

  // Get quiz scores for this pantheon
  const pantheonQuizScores = Object.entries(quizScores)
    .filter(([key]) => key.startsWith(pantheonId) || key.includes(pantheonId))
    .map(([, score]) => score);

  const avgQuizScore =
    pantheonQuizScores.length > 0
      ? pantheonQuizScores.reduce((sum, s) => sum + s, 0) /
        pantheonQuizScores.length
      : 0;

  // Calculate overall progress (weighted average)
  // 40% deities, 30% stories, 30% quiz
  const deityProgress =
    deities.length > 0 ? (viewedCount / deities.length) * 100 : 0;
  const storyProgress =
    stories.length > 0 ? (readCount / stories.length) * 100 : 0;

  const overallProgress = Math.round(
    deityProgress * 0.4 + storyProgress * 0.3 + avgQuizScore * 0.3,
  );

  return {
    pantheonId,
    pantheonName:
      PANTHEON_NAMES[pantheonId] || pantheonId.replace("-pantheon", ""),
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
  quizScores: Record<string, number>,
): PantheonMastery[] {
  // Get unique pantheon IDs from deities
  const pantheonIds = [
    ...new Set((deitiesData as Deity[]).map((d) => d.pantheonId)),
  ];

  return pantheonIds
    .map((id) =>
      calculatePantheonMastery(id, deitiesViewed, storiesRead, quizScores),
    )
    .sort((a, b) => b.progress - a.progress);
}

export function getOverallMasteryLevel(
  masteries: PantheonMastery[],
): MasteryLevel {
  if (masteries.length === 0) return "novice";
  const avgProgress =
    masteries.reduce((sum, m) => sum + m.progress, 0) / masteries.length;
  return getMasteryLevel(avgProgress);
}
