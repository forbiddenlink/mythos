"use client";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import {
  EmptyState,
  primaryLinkClass,
  secondaryLinkClass,
} from "@/components/layout/tool-stage";
import { Progress } from "@/components/ui/progress";
import {
  ProgressContext,
  type ProgressContextValue,
} from "@/providers/progress-provider";
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
      <dt className="flex items-center gap-1.5 type-meta uppercase tracking-[0.16em] text-parchment/75">
        <MythosMark id={mark} className="h-3.5 w-3.5 text-gold" />
        {label}
      </dt>
      <dd className="font-serif text-3xl font-semibold tabular-nums text-parchment">
        {value}
      </dd>
      {detail ? (
        <dd className="type-meta text-parchment/75">{detail}</dd>
      ) : null}
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

  const header = (
    <PageHeader
      eyebrow="Progress"
      mark="laurel"
      title="Your Stats"
      lede="A record of your own reading, review and quizzes in this browser. Nothing here is compared with other readers."
    />
  );

  if (!hasActivity) {
    return (
      <div className="min-h-screen">
        {header}
        <Container className="section-space-sm">
          <EmptyState
            id="progress-start-title"
            mark="compass"
            eyebrow="Nothing recorded yet"
            title="Begin with something that interests you"
            description="Open a figure or read a story. This page records the entries you visit and the traditions you explore, alongside your quiz results."
            actions={
              <>
                <NextLink href="/pantheons" className={primaryLinkClass}>
                  Choose a tradition
                </NextLink>
                <NextLink href="/stories" className={secondaryLinkClass}>
                  Find a story
                </NextLink>
              </>
            }
            preview={
              <StatsPreview
                totals={totals}
                caption="What fills in as you explore"
              />
            }
          />
        </Container>
        <Container className="pb-16 md:pb-24">
          <section
            aria-label="Learning backup and restore"
            className="border-t border-border/70 pt-10"
          >
            <p className="mb-4 max-w-2xl type-ui text-muted-foreground">
              Your activity is saved in this browser. If you have a learning
              backup, restore it here to continue where you left off.
            </p>
            <LearningBackup />
          </section>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {header}

      <section
        aria-label="Summary"
        className="dark relative isolate overflow-hidden bg-midnight text-foreground"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_90%_at_15%_0%,color-mix(in_oklch,var(--gold)_18%,transparent),transparent_70%)]"
        />
        <Container className="py-10 md:py-12">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
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
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="w-full max-w-xs">
              <Progress
                value={(xpInCurrentLevel / xpToNextLevel) * 100}
                className="h-1.5 bg-parchment/15"
                aria-label={`Level progress: ${xpInCurrentLevel} of ${xpToNextLevel} XP`}
              />
            </div>
            <NextLink
              href="/achievements"
              className="inline-flex min-h-11 items-center type-ui font-medium text-gold-light underline decoration-gold/40 underline-offset-4 hover:decoration-current"
            >
              See every achievement →
            </NextLink>
          </div>
        </Container>
      </section>

      <Container className="section-space-sm">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <section aria-labelledby="discovery-progress-title">
            <h2
              id="discovery-progress-title"
              className="page-section-title text-foreground"
            >
              Discovery Progress
            </h2>
            <div className="mt-6 space-y-6">
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
            </div>
          </section>
          <div className="space-y-6">
            <ExplorationWrapped catalog={catalog} />
            <RetentionPulse />
          </div>
        </div>

        <section
          className="mt-14 border-t border-border/70 pt-10"
          aria-label="Learning backup and restore"
        >
          <p className="mb-4 max-w-2xl type-ui text-muted-foreground">
            Your stats are stored on this device and browser only. Download a
            backup to keep them or move them to another browser.
          </p>
          <LearningBackup />
        </section>
      </Container>
    </div>
  );
}

/** Zeroed figures and bars: a preview of the page for a first visit. */
function StatsPreview({
  totals,
  caption,
}: Readonly<{ totals: CatalogTotals; caption: string }>) {
  const rows: Array<{ label: string; total: number; mark: MythosMarkId }> = [
    { label: "Deities viewed", total: totals.deities, mark: "owl" },
    { label: "Stories read", total: totals.stories, mark: "scroll" },
    { label: "Locations visited", total: totals.locations, mark: "peak" },
    { label: "Pantheons explored", total: totals.pantheons, mark: "temple" },
  ];
  return (
    <figure className="overflow-hidden rounded-lg border border-border/70 bg-card shadow-xl shadow-black/5">
      <div className="dark relative isolate bg-midnight px-6 py-6 text-parchment">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_100%_at_0%_0%,color-mix(in_oklch,var(--gold)_18%,transparent),transparent_70%)]"
        />
        <div className="grid grid-cols-3 gap-4" aria-hidden="true">
          {[
            ["Level 0", "0 XP"],
            ["Streak", "0"],
            ["Badges", `0 / ${totals.achievements}`],
          ].map(([label, value]) => (
            <div key={label} className="border-l border-gold/30 pl-3">
              <p className="type-meta uppercase tracking-[0.14em] text-parchment/70">
                {label}
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold tabular-nums">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
      <ul className="space-y-4 px-6 py-6">
        {rows.map((row) => (
          <li key={row.label}>
            <div className="flex items-center justify-between type-ui">
              <span className="flex items-center gap-2 text-foreground">
                <MythosMark id={row.mark} className="size-4 text-gold-text" />
                {row.label}
              </span>
              <span className="tabular-nums text-muted-foreground">
                0 / {row.total}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted" />
          </li>
        ))}
      </ul>
      <figcaption className="border-t border-border/70 px-6 py-3 type-meta text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}
