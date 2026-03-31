"use client";

import { Progress } from "@/components/ui/progress";
import { categoryLabels, tierColors } from "@/data/achievements";
import {
  useAchievements,
  type AchievementWithStatus,
} from "@/hooks/useAchievements";
import { motion } from "framer-motion";
import {
  BookOpen,
  Compass,
  Crown,
  Flame,
  Lock,
  Star,
  Trophy,
} from "lucide-react";

const categoryIcons = {
  exploration: Compass,
  learning: BookOpen,
  mastery: Crown,
  dedication: Flame,
  special: Star,
};

const tierBadgeClasses: Record<string, string> = {
  mythic: "bg-violet-100 text-violet-950 border-violet-300",
  gold: "bg-amber-100 text-amber-950 border-amber-300",
  silver: "bg-slate-200 text-slate-950 border-slate-300",
  bronze: "bg-orange-100 text-orange-950 border-orange-300",
};

function AchievementCard({
  achievement,
}: Readonly<{
  achievement: AchievementWithStatus;
}>) {
  const colors = tierColors[achievement.tier];
  const isUnlocked = achievement.unlocked;
  const progressPercent = achievement.progress
    ? Math.min(
        100,
        (achievement.progress.current / achievement.progress.target) * 100,
      )
    : 0;

  return (
    <motion.div
      initial={{ y: 16 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`relative rounded-xl border p-5 transition-all duration-300 bg-card ${
        isUnlocked ? `${colors.border} ${colors.bg} shadow-lg` : "border-border"
      } ${isUnlocked ? "shadow-lg" : "border-border/80 bg-muted/20"}`}
    >
      {/* Lock overlay for locked achievements */}
      {!achievement.unlocked && (
        <div className="absolute top-3 right-3">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`shrink-0 w-14 h-14 rounded-lg border flex items-center justify-center text-2xl ${
            isUnlocked
              ? `${colors.bg} ${colors.border}`
              : "bg-muted border-border"
          }`}
        >
          {achievement.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">
              {achievement.name}
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${
                isUnlocked
                  ? tierBadgeClasses[achievement.tier]
                  : "bg-slate-900 text-white border-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:border-slate-300"
              }`}
            >
              {achievement.tier}
            </span>
          </div>

          <p className="text-sm text-foreground/85 mb-3">
            {achievement.description}
          </p>

          {/* Progress bar for locked achievements */}
          {!achievement.unlocked && achievement.progress && (
            <div className="space-y-1">
              <Progress
                value={progressPercent}
                className="h-2"
                aria-label={`${achievement.name} progress: ${achievement.progress.current} of ${achievement.progress.target}`}
              />
              <p className="text-xs text-foreground/80">
                {achievement.progress.current} / {achievement.progress.target}
              </p>
            </div>
          )}

          {/* XP reward */}
          <div className="flex items-center gap-1 mt-2">
            <Star
              className={`h-3.5 w-3.5 ${achievement.unlocked ? "text-amber-700" : "text-foreground/70"}`}
            />
            <span
              className={`text-xs ${achievement.unlocked ? "text-amber-700" : "text-foreground/80"}`}
            >
              {achievement.xp} XP
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CategorySection({
  category,
  achievements,
}: Readonly<{
  category: keyof typeof categoryLabels;
  achievements: AchievementWithStatus[];
}>) {
  const Icon = categoryIcons[category];
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
          <Icon className="h-5 w-5 text-gold" />
        </div>
        <div>
          <h2 className="text-xl font-serif text-foreground">
            {categoryLabels[category]}
          </h2>
          <p className="text-sm text-muted-foreground">
            {unlockedCount} / {achievements.length} unlocked
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ y: 16 }}
            animate={{ y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <AchievementCard achievement={achievement} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default function AchievementsPage() {
  const { achievements, unlockedCount, totalCount } = useAchievements();

  // Group achievements by category
  const grouped = achievements.reduce(
    (acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    },
    {} as Record<string, AchievementWithStatus[]>,
  );

  // Sort each category: unlocked first, then by tier
  const tierOrder = { mythic: 0, gold: 1, silver: 2, bronze: 3 };
  Object.values(grouped).forEach((list) => {
    list.sort((a, b) => {
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      return tierOrder[a.tier] - tierOrder[b.tier];
    });
  });

  const totalXP = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xp, 0);

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-muted/30 to-background dark:from-midnight dark:via-mythic dark:to-midnight">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-gold/5 via-transparent to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-6">
              <Trophy className="h-4 w-4 text-gold" />
              <span className="text-sm text-gold">Your Achievements</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-semibold text-foreground mb-4">
              Hall of <span className="text-gradient-gold">Glory</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Earn badges as you read stories, study deities, and test your
              knowledge across all 13 pantheons.
            </p>

            <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground">
              Achievements give longer-term shape to the site. Instead of
              treating each visit as a disconnected page view, they turn
              reading, review, quizzes, and exploration into a visible record of
              what you have actually covered and reinforced.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gold">
                  {unlockedCount}
                </div>
                <div className="text-sm text-muted-foreground">Unlocked</div>
              </div>
              <div className="w-px h-12 bg-gold/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground/70">
                  {totalCount}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="w-px h-12 bg-gold/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {totalXP}
                </div>
                <div className="text-sm text-muted-foreground">XP Earned</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Achievement Categories */}
      <section className="container mx-auto px-4 pb-20">
        {(
          [
            "exploration",
            "learning",
            "mastery",
            "dedication",
            "special",
          ] as const
        ).map(
          (category) =>
            grouped[category]?.length > 0 && (
              <CategorySection
                key={category}
                category={category}
                achievements={grouped[category]}
              />
            ),
        )}
      </section>
    </div>
  );
}
