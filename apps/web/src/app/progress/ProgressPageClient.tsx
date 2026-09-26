"use client";

import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ProgressContext,
  type ProgressContextValue,
} from "@/providers/progress-provider";
import { HeroMark } from "@/components/icons/hero-mark";
import { MythosMark, type MythosMarkId } from "@/components/icons/mythos-marks";
import {
  ExplorationWrapped,
  type ExplorationCatalog,
} from "@/components/progress/ExplorationWrapped";
import { LearningBackup } from "@/components/progress/LearningBackup";
import { RetentionPulse } from "@/components/progress/RetentionPulse";
import NextLink from "next/link";
import { useContext } from "react";

// Custom hook for using the progress context
function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}

interface ProgressBarProps {
  label: string;
  current: number;
  total: number;
  mark: MythosMarkId;
}

function ProgressBar({
  label,
  current,
  total,
  mark,
}: Readonly<ProgressBarProps>) {
  const shown = Math.min(current, total);
  const percentage = total > 0 ? Math.round((shown / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MythosMark id={mark} className="h-4 w-4 text-gold" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {shown} / {total}
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/50">
        <Progress
          value={percentage}
          className="h-3 bg-muted/50"
          aria-label={`${label} progress: ${shown} of ${total}`}
        />
      </div>
    </div>
  );
}

/** A figure in the stats strip. Static: it does not look or act clickable. */
function StatFigure({
  label,
  value,
  detail,
  mark,
}: Readonly<{
  label: string;
  value: string | number;
  detail?: string;
  mark: MythosMarkId;
}>) {
  return (
    <div className="flex flex-col gap-1 border-l border-gold/30 pl-4">
      <dt className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-parchment/70">
        <MythosMark id={mark} className="h-3.5 w-3.5 text-gold" />
        {label}
      </dt>
      <dd className="font-serif text-3xl font-semibold tabular-nums text-parchment">
        {value}
      </dd>
      {detail ? <dd className="text-xs text-parchment/70">{detail}</dd> : null}
    </div>
  );
}

export interface CatalogTotals {
  deities: number;
  stories: number;
  locations: number;
  pantheons: number;
  /** Achievements defined in the catalog (src/data/achievements.ts). */
  achievements: number;
}

export function ProgressPageClient({
  totals,
  catalog,
}: Readonly<{ totals: CatalogTotals; catalog: ExplorationCatalog }>) {
  const { getStats } = useProgress();
  const stats = getStats();

  // Calculate level from XP (Level = XP / 100, rounded down)
  const level = Math.floor(stats.totalXP / 100);
  const xpInCurrentLevel = stats.totalXP % 100;
  const xpToNextLevel = 100;

  const hasActivity =
    stats.totalXP > 0 ||
    stats.totalDeitiesViewed > 0 ||
    stats.totalStoriesRead > 0 ||
    stats.totalPantheonsExplored > 0 ||
    stats.totalLocationsVisited > 0 ||
    stats.totalQuizzesTaken > 0 ||
    stats.totalAchievements > 0;

  if (!hasActivity) {
    return (
      <div className="page-shell max-w-4xl min-h-screen">
        <Breadcrumbs />
        <h1 className="page-title text-foreground">Your Stats</h1>
        <section
          className="mt-8 max-w-2xl"
          aria-labelledby="progress-start-title"
        >
          <h2
            id="progress-start-title"
            className="font-serif text-2xl text-foreground"
          >
            Begin with something that interests you
          </h2>
          <p className="mt-4 font-body text-xl leading-relaxed text-foreground">
            Open a figure or read a story. This page will record the entries you
            visit and the traditions you explore, alongside your quiz results.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <NextLink
              href="/pantheons"
              className="inline-flex min-h-11 items-center rounded-md bg-gold px-5 font-medium text-midnight hover:bg-gold-light"
            >
              Choose a tradition
            </NextLink>
            <NextLink
              href="/stories"
              className="inline-flex min-h-11 items-center text-gold-text underline underline-offset-4"
            >
              Find a story
            </NextLink>
          </div>
          <p className="mt-8 border-t border-border pt-5 text-sm text-muted-foreground">
            Your activity is saved in this browser. If you have a learning
            backup, restore it below to continue where you left off.
          </p>
        </section>
        <section className="mt-8" aria-label="Learning backup and restore">
          <LearningBackup />
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-linear-to-b from-midnight via-midnight/95 to-mythic py-16 md:py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-bronze/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-5xl px-4 relative z-10">
          <div className="flex items-center gap-4">
            <HeroMark mark="laurel" tone="gold" size="md" />
            <div>
              <span className="block text-gold/80 text-sm tracking-[0.25em] uppercase font-medium">
                Progress
              </span>
              <h1 className="page-title text-parchment">Your Stats</h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-parchment/75">
            A record of your own reading, review and quizzes in this browser.
            Nothing here is compared with other readers.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            <StatFigure
              label={`Level ${level}`}
              value={`${stats.totalXP} XP`}
              detail={`${xpInCurrentLevel} / ${xpToNextLevel} XP to level ${level + 1}`}
              mark="constellation"
            />
            <StatFigure
              label="Daily streak"
              value={stats.dailyStreak}
              detail={`Best: ${stats.longestStreak} ${stats.longestStreak === 1 ? "day" : "days"}`}
              mark="torch"
            />
            <StatFigure
              label="Quick quiz best"
              value={stats.quickQuizHighScore}
              detail={
                stats.totalQuizzesTaken > 0
                  ? `Average quiz score ${stats.averageQuizScore}%`
                  : "No scored quizzes yet"
              }
              mark="lyre"
            />
            <StatFigure
              label="Achievements"
              value={`${stats.totalAchievements} / ${totals.achievements}`}
              detail={
                stats.dailyChallengeStreak > 0
                  ? `Daily myth streak: ${stats.dailyChallengeStreak}`
                  : undefined
              }
              mark="laurel"
            />
          </dl>
          <div className="mt-3 max-w-xs">
            <Progress
              value={(xpInCurrentLevel / xpToNextLevel) * 100}
              className="h-1.5 bg-parchment/15"
              aria-label={`Level progress: ${xpInCurrentLevel} of ${xpToNextLevel} XP`}
            />
          </div>
          <p className="mt-6">
            <NextLink
              href="/achievements"
              className="inline-flex min-h-11 items-center text-sm font-medium text-gold underline-offset-4 hover:underline"
            >
              See every achievement →
            </NextLink>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-12 bg-mythic">
        <Breadcrumbs />

        <div className="mt-8 mb-10 space-y-6">
          <ExplorationWrapped catalog={catalog} />
          <RetentionPulse />
        </div>

        {/* Discovery Progress Section */}
        <section className="mt-8">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle as="h2" className="flex items-center gap-2">
                <MythosMark id="compass" className="h-5 w-5 text-gold" />
                Discovery Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressBar
                label="Deities Viewed"
                current={stats.totalDeitiesViewed}
                total={totals.deities}
                mark="owl"
              />
              <ProgressBar
                label="Stories Read"
                current={stats.totalStoriesRead}
                total={totals.stories}
                mark="scroll"
              />
              <ProgressBar
                label="Locations Visited"
                current={stats.totalLocationsVisited}
                total={totals.locations}
                mark="peak"
              />
              <ProgressBar
                label="Pantheons Explored"
                current={stats.totalPantheonsExplored}
                total={totals.pantheons}
                mark="temple"
              />
            </CardContent>
          </Card>
        </section>

        <section className="mt-8" aria-label="Learning backup and restore">
          <p className="mb-3 text-sm text-muted-foreground">
            Your stats are stored on this device and browser only. Download a
            backup to keep them or move them to another browser.
          </p>
          <LearningBackup />
        </section>
      </div>
    </div>
  );
}
