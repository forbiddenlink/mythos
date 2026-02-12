'use client';

import { useContext } from 'react';
import { ProgressContext, type ProgressContextValue } from '@/providers/progress-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import {
  Flame,
  Trophy,
  Star,
  Eye,
  BookOpen,
  Map,
  Compass,
  Crown,
  Axe,
  MapPin,
  Pencil,
  GraduationCap,
  Calendar,
  GitBranch,
  Link,
  BookMarked,
  Sword,
  PawPrint,
  Lock,
  Sparkles,
  Target,
} from 'lucide-react';
import achievements from '@/data/achievements.json';

// Total counts from data files
const TOTAL_DEITIES = 87;
const TOTAL_STORIES = 24;
const TOTAL_LOCATIONS = 23;
const TOTAL_PANTHEONS = 8;

// Custom hook for using the progress context
function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}

// Map icon names to Lucide components
const iconMap: Record<string, typeof Eye> = {
  eye: Eye,
  'book-open': BookOpen,
  'map-pin': MapPin,
  crown: Crown,
  axe: Axe,
  pyramid: Target, // Using Target as placeholder for pyramid
  compass: Compass,
  library: BookOpen,
  book: BookOpen,
  globe: Map,
  pencil: Pencil,
  trophy: Trophy,
  'graduation-cap': GraduationCap,
  flame: Flame,
  star: Star,
  calendar: Calendar,
  'git-branch': GitBranch,
  link: Link,
  'book-marked': BookMarked,
  sword: Sword,
  'paw-print': PawPrint,
};

interface Achievement {
  id: string;
  name: string;
  description: string;
  xp: number;
  icon: string;
  category: string;
}

function AchievementCard({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) {
  const IconComponent = iconMap[achievement.icon] || Trophy;

  return (
    <div
      className={`relative p-4 rounded-xl border transition-all duration-300 ${
        unlocked
          ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/30 shadow-lg shadow-amber-500/10'
          : 'bg-card/50 border-border/40 opacity-60'
      }`}
    >
      {/* Glow effect for unlocked achievements */}
      {unlocked && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
      )}

      <div className="relative flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
            unlocked
              ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {unlocked ? (
            <IconComponent className="h-6 w-6" strokeWidth={1.5} />
          ) : (
            <Lock className="h-5 w-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm ${unlocked ? 'text-amber-500' : 'text-muted-foreground'}`}>
            {achievement.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {achievement.description}
          </p>
          <div className={`flex items-center gap-1 mt-2 text-xs ${unlocked ? 'text-amber-500/80' : 'text-muted-foreground/60'}`}>
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

function ProgressBar({ label, current, total, icon: Icon }: ProgressBarProps) {
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
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
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
  const achievementsByCategory = (achievements as Achievement[]).reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const categoryLabels: Record<string, string> = {
    discovery: 'Discovery',
    exploration: 'Exploration',
    mastery: 'Mastery',
    streak: 'Dedication',
    special: 'Special',
  };

  const categoryOrder = ['discovery', 'exploration', 'mastery', 'streak', 'special'];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-midnight via-midnight/95 to-mythic py-16 md:py-24">
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
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent" />
                <Trophy className="relative h-10 w-10 text-amber-500" strokeWidth={1.5} />
              </div>
            </div>
            <span className="inline-block text-amber-500/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
              Your Progress
            </span>
            <h1 className="font-serif text-5xl md:text-6xl font-semibold tracking-tight mb-6 text-parchment">
              Your Journey
            </h1>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-amber-500/40" />
              <div className="w-1.5 h-1.5 rotate-45 bg-amber-500/50" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-amber-500/40" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Level & XP Card */}
            <Card className="bg-card/80 backdrop-blur-sm border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <span className="text-2xl font-bold text-white">{level}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="text-lg font-semibold text-foreground">{stats.totalXP} XP Total</p>
                    <div className="mt-2">
                      <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                          style={{ width: `${(xpInCurrentLevel / xpToNextLevel) * 100}%` }}
                        />
                      </div>
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
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Flame className="h-8 w-8 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Streak</p>
                    <p className="text-3xl font-bold text-foreground">{stats.dailyStreak}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.dailyStreak === 1 ? 'day' : 'days'} in a row
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements Card */}
            <Card className="bg-card/80 backdrop-blur-sm border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Star className="h-8 w-8 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Achievements</p>
                    <p className="text-3xl font-bold text-foreground">{stats.totalAchievements}</p>
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
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" strokeWidth={1.5} />
            Achievements Gallery
          </h2>

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
                  <GraduationCap className="h-5 w-5 text-amber-500" strokeWidth={1.5} />
                  Quiz Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Quizzes Completed</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalQuizzesTaken}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold text-foreground">{stats.averageQuizScore}%</p>
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
