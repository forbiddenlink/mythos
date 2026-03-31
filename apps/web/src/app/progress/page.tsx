"use client";

import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import achievements from "@/data/achievements.json";
import deities from "@/data/deities.json";
import locations from "@/data/locations.json";
import pantheons from "@/data/pantheons.json";
import stories from "@/data/stories.json";
import {
  ProgressContext,
  type ProgressContextValue,
} from "@/providers/progress-provider";
import {
  Axe,
  BookMarked,
  BookOpen,
  Calendar,
  Compass,
  Crown,
  Eye,
  Flame,
  GitBranch,
  GraduationCap,
  Link,
  Lock,
  Map,
  MapPin,
  PawPrint,
  Pencil,
  Sparkles,
  Star,
  Sword,
  Target,
  Trophy,
} from "lucide-react";
import { useContext } from "react";

// Total counts derived from data files
const TOTAL_DEITIES = deities.length;
const TOTAL_STORIES = stories.length;
const TOTAL_LOCATIONS = locations.length;
const TOTAL_PANTHEONS = pantheons.length;

// Custom hook for using the progress context
function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}

// Map icon names to Lucide components
const iconMap: Record<string, typeof Eye> = {
  eye: Eye,
  "book-open": BookOpen,
  "map-pin": MapPin,
  crown: Crown,
  axe: Axe,
  pyramid: Target, // Using Target as placeholder for pyramid
  compass: Compass,
  library: BookOpen,
  book: BookOpen,
  globe: Map,
  pencil: Pencil,
  trophy: Trophy,
  "graduation-cap": GraduationCap,
  flame: Flame,
  star: Star,
  calendar: Calendar,
  "git-branch": GitBranch,
  link: Link,
  "book-marked": BookMarked,
  sword: Sword,
  "paw-print": PawPrint,
};

interface Achievement {
  id: string;
  name: string;
  description: string;
  xp: number;
  icon: string;
  category: string;
  tier?: "bronze" | "silver" | "gold" | "mythic";
}

const progressTierBadgeClasses: Record<string, string> = {
  mythic: "bg-violet-100 text-violet-950 border-violet-300",
  gold: "bg-amber-100 text-amber-950 border-amber-300",
  silver: "bg-slate-200 text-slate-950 border-slate-300",
  bronze: "bg-orange-100 text-orange-950 border-orange-300",
};

function inferAchievementTier(
  achievement: Achievement,
): keyof typeof progressTierBadgeClasses {
  if (achievement.tier) return achievement.tier;
  if (achievement.xp >= 200) return "mythic";
  if (achievement.xp >= 100) return "gold";
  if (achievement.xp >= 50) return "silver";
  return "bronze";
}

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
}

function AchievementCard({
  achievement,
  unlocked,
}: Readonly<AchievementCardProps>) {
  const IconComponent = iconMap[achievement.icon] || Trophy;
  const tier = inferAchievementTier(achievement);
  const tierBadgeClass = progressTierBadgeClasses[tier];

  return (
    <div
      className={`relative p-4 rounded-xl border transition-all duration-300 ${
        unlocked
          ? "bg-linear-to-br from-gold/12 via-card to-card border-gold/30 shadow-lg shadow-gold/10"
          : "bg-card/70 border-border/60"
      }`}
    >
      {/* Glow effect for unlocked achievements */}
      {unlocked && (
        <div className="absolute inset-0 rounded-xl bg-linear-to-br from-amber-500/5 to-transparent pointer-events-none" />
      )}

      <div className="relative flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
            unlocked
              ? "bg-linear-to-br from-gold-dark via-gold to-gold-light text-midnight shadow-md"
              : "bg-muted text-foreground/70 border border-border/60"
          }`}
        >
          {unlocked ? (
            <IconComponent className="h-6 w-6" strokeWidth={1.5} />
          ) : (
            <Lock className="h-5 w-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="font-semibold text-sm text-foreground">
              {achievement.name}
            </h3>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border ${tierBadgeClass}`}
            >
              {tier}
            </span>
          </div>
          <p className="text-xs text-safe-muted mt-0.5 line-clamp-2">
            {achievement.description}
          </p>
          <div
            className={`flex items-center gap-1 mt-2 text-xs ${unlocked ? "text-amber-700" : "text-safe-subtle"}`}
          >
            <Sparkles className="h-3 w-3" />
            <span>{achievement.xp} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
  icon: typeof Eye;
}

function ProgressBar({
  label,
  current,
  total,
  icon: Icon,
}: Readonly<ProgressBarProps>) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-amber-500" strokeWidth={1.5} />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {current} / {total}
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/50">
        <Progress
          value={percentage}
          className="h-3 bg-muted/50"
          aria-label={`${label} progress: ${current} of ${total}`}
        />
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const { progress, getStats } = useProgress();
  const stats = getStats();

  // Calculate level from XP (Level = XP / 100, rounded down)
  const level = Math.floor(stats.totalXP / 100);
  const xpInCurrentLevel = stats.totalXP % 100;
  const xpToNextLevel = 100;

  // Get unlocked achievement IDs
  const unlockedAchievements = new Set(progress.achievements);

  // Group achievements by category
  const achievementsByCategory = (achievements as Achievement[]).reduce(
    (acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    },
    {} as Record<string, Achievement[]>,
  );

  const categoryLabels: Record<string, string> = {
    discovery: "Discovery",
    exploration: "Exploration",
    mastery: "Mastery",
    streak: "Dedication",
    special: "Special",
  };

  const categoryOrder = [
    "discovery",
    "exploration",
    "mastery",
    "streak",
    "special",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-linear-to-b from-midnight via-midnight/95 to-mythic py-16 md:py-24">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="relative p-4 rounded-xl border border-amber-500/20 bg-midnight/50 backdrop-blur-sm">
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-amber-500/10 to-transparent" />
                <Trophy
                  className="relative h-10 w-10 text-amber-500"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <span className="inline-block text-amber-500/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
              Your Progress
            </span>
            <h1 className="font-serif text-5xl md:text-6xl font-semibold tracking-tight mb-6 text-parchment">
              Your Journey
            </h1>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-px bg-linear-to-r from-transparent to-amber-500/40" />
              <div className="w-1.5 h-1.5 rotate-45 bg-amber-500/50" />
              <div className="w-12 h-px bg-linear-to-l from-transparent to-amber-500/40" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Level & XP Card */}
            <Card className="bg-card/80 backdrop-blur-sm border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-linear-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <span className="text-2xl font-bold text-white">
                      {level}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="text-lg font-semibold text-foreground">
                      {stats.totalXP} XP Total
                    </p>
                    <div className="mt-2">
                      <Progress
                        value={(xpInCurrentLevel / xpToNextLevel) * 100}
                        className="h-2 bg-muted/50"
                        aria-label={`Level progress: ${xpInCurrentLevel} of ${xpToNextLevel} XP`}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {xpInCurrentLevel} / {xpToNextLevel} XP to next level
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Streak Card */}
            <Card className="bg-card/80 backdrop-blur-sm border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Flame className="h-8 w-8 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Daily Streak
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.dailyStreak}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stats.dailyStreak === 1 ? "day" : "days"} in a row
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements Card */}
            <Card className="bg-card/80 backdrop-blur-sm border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Star className="h-8 w-8 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Achievements
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats.totalAchievements}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      of {achievements.length} unlocked
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-12 bg-mythic">
        <Breadcrumbs />

        <div className="mt-6 rounded-lg border border-border/60 bg-card/60 p-4">
          <p className="text-sm text-muted-foreground">
            Your progress and stats are currently stored on this device and
            browser.
          </p>
        </div>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card/60 p-6">
          <h2 className="font-serif text-2xl font-semibold mb-3">
            Measure Breadth, Depth, and Consistency
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The progress page tracks more than simple page views. It shows how
            broadly you are exploring across pantheons, how consistently you
            return to study, and where your strongest momentum is building
            through stories, quizzes, milestones, and unlocked achievements.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Use these totals to spot gaps in your learning path. If one
            tradition dominates your history, the progress charts make that
            obvious and give you a reason to branch into unfamiliar cultures,
            themes, and connected myths on the next session.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Because achievements, quiz results, and reading activity are shown
            together, this page also works as a weekly review dashboard for
            deciding what to revisit and what to study next.
          </p>
        </section>

        {/* Discovery Progress Section */}
        <section className="mt-8">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-amber-500" strokeWidth={1.5} />
                Discovery Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressBar
                label="Deities Viewed"
                current={stats.totalDeitiesViewed}
                total={TOTAL_DEITIES}
                icon={Eye}
              />
              <ProgressBar
                label="Stories Read"
                current={stats.totalStoriesRead}
                total={TOTAL_STORIES}
                icon={BookOpen}
              />
              <ProgressBar
                label="Locations Visited"
                current={stats.totalLocationsVisited}
                total={TOTAL_LOCATIONS}
                icon={MapPin}
              />
              <ProgressBar
                label="Pantheons Explored"
                current={stats.totalPantheonsExplored}
                total={TOTAL_PANTHEONS}
                icon={Map}
              />
            </CardContent>
          </Card>
        </section>

        {/* Achievements Gallery */}
        <section className="mt-12 rounded-3xl border border-gold/15 bg-linear-to-br from-card via-card to-gold/5 p-6 md:p-8">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" strokeWidth={1.5} />
            Achievements Gallery
          </h2>
          <p className="text-safe-muted mb-8 max-w-2xl">
            Milestones, streaks, and mastery rewards are shown here using the
            same tier language as the full achievements experience.
          </p>

          {categoryOrder.map((category) => {
            const categoryAchievements = achievementsByCategory[category];
            if (!categoryAchievements) return null;

            return (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-medium text-muted-foreground mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {categoryLabels[category]}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      unlocked={unlockedAchievements.has(achievement.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* Quiz Stats (if any quizzes taken) */}
        {stats.totalQuizzesTaken > 0 && (
          <section className="mt-12">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap
                    className="h-5 w-5 text-amber-500"
                    strokeWidth={1.5}
                  />
                  Quiz Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Quizzes Completed
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.totalQuizzesTaken}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Average Score
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.averageQuizScore}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
