"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import {
  primaryLinkClass,
  secondaryLinkClass,
} from "@/components/layout/tool-stage";
import { Progress } from "@/components/ui/progress";
import { categoryLabels } from "@/data/achievements";
import {
  useAchievements,
  type AchievementWithStatus,
} from "@/hooks/useAchievements";
import { MythosMark, type MythosMarkId } from "@/components/icons/mythos-marks";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER = [
  "exploration",
  "learning",
  "mastery",
  "dedication",
  "special",
] as const;

const categoryMarks: Record<string, MythosMarkId> = {
  exploration: "compass",
  learning: "scroll",
  mastery: "laurel",
  dedication: "torch",
  special: "constellation",
};

const TIER_LABEL: Record<string, string> = {
  mythic: "Mythic",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

/** Ring colour for an unlocked medallion, by tier. */
const TIER_RING: Record<string, string> = {
  mythic: "ring-bronze bg-bronze/15",
  gold: "ring-gold bg-gold/15",
  silver: "ring-muted-foreground/60 bg-muted",
  bronze: "ring-bronze/70 bg-bronze/10",
};

const tierOrder = { mythic: 0, gold: 1, silver: 2, bronze: 3 } as const;

function progressPercent(achievement: AchievementWithStatus): number {
  return achievement.progress
    ? Math.min(
        100,
        (achievement.progress.current / achievement.progress.target) * 100,
      )
    : 0;
}

function Medallion({
  achievement,
  size = "md",
}: Readonly<{ achievement: AchievementWithStatus; size?: "md" | "lg" }>) {
  const unlocked = achievement.unlocked;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full ring-2",
        size === "lg" ? "size-16 text-3xl" : "size-12 text-2xl",
        unlocked ? TIER_RING[achievement.tier] : "bg-muted ring-border",
      )}
    >
      <span className={cn(!unlocked && "opacity-45 grayscale")}>
        {achievement.icon}
      </span>
      {!unlocked ? (
        <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border border-border bg-background">
          <Lock className="size-3 text-muted-foreground" />
        </span>
      ) : null}
    </span>
  );
}

function AchievementCard({
  achievement,
}: Readonly<{ achievement: AchievementWithStatus }>) {
  const unlocked = achievement.unlocked;
  const percent = progressPercent(achievement);

  return (
    <article
      className={cn(
        "flex h-full gap-4 rounded-lg border p-5",
        unlocked ? "border-gold/40 bg-gold/[0.06]" : "border-border/70 bg-card",
      )}
    >
      <Medallion achievement={achievement} />
      <div className="min-w-0 flex-1">
        <h3 className="font-serif text-lg font-semibold leading-snug text-foreground">
          {achievement.name}
        </h3>
        <p className="mt-1 type-ui text-muted-foreground">
          {achievement.description}
        </p>

        {!unlocked && achievement.progress ? (
          <div className="mt-3">
            <Progress
              value={percent}
              className="h-1.5"
              aria-label={`${achievement.name} progress: ${achievement.progress.current} of ${achievement.progress.target}`}
            />
          </div>
        ) : null}

        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 type-meta text-muted-foreground">
          <span className={cn(unlocked && "font-medium text-gold-text")}>
            {unlocked ? "Unlocked" : TIER_LABEL[achievement.tier]}
          </span>
          {!unlocked && achievement.progress ? (
            <span className="tabular-nums">
              {Math.min(
                achievement.progress.current,
                achievement.progress.target,
              )}{" "}
              / {achievement.progress.target}
            </span>
          ) : null}
          <span className="tabular-nums">{achievement.xp} XP</span>
        </p>
      </div>
    </article>
  );
}

export function AchievementsPageClient({
  traditionCount,
}: Readonly<{ traditionCount: number }>) {
  const { achievements, unlockedCount, totalCount } = useAchievements();

  const grouped = achievements.reduce(
    (acc, achievement) => {
      const list = acc[achievement.category] ?? [];
      list.push(achievement);
      acc[achievement.category] = list;
      return acc;
    },
    {} as Record<string, AchievementWithStatus[]>,
  );
  Object.values(grouped).forEach((list) => {
    list.sort((a, b) => {
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      return tierOrder[a.tier] - tierOrder[b.tier];
    });
  });

  const totalXP = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xp, 0);

  // The three locked badges fewest steps from done (ties: the smaller reward,
  // which is usually the more approachable badge).
  const stepsLeft = (a: AchievementWithStatus) =>
    a.progress
      ? Math.max(0, a.progress.target - a.progress.current)
      : Number.POSITIVE_INFINITY;
  const nextUp = achievements
    .filter((a) => !a.unlocked)
    .toSorted((a, b) => stepsLeft(a) - stepsLeft(b) || a.xp - b.xp)
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Your achievements"
        mark="laurel"
        title="Achievements"
        lede={`Earn badges as you read stories, study deities and test your knowledge across all ${traditionCount} traditions.`}
      >
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          {[
            { label: "Unlocked", value: unlockedCount },
            { label: "In the hall", value: totalCount },
            { label: "XP earned", value: totalXP },
          ].map((figure) => (
            <div key={figure.label} className="border-l border-gold/40 pl-4">
              <dt className="type-meta uppercase tracking-[0.14em] text-muted-foreground">
                {figure.label}
              </dt>
              <dd className="font-serif text-3xl font-semibold tabular-nums text-foreground">
                {figure.value}
              </dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      {unlockedCount === 0 && nextUp.length > 0 ? (
        <section
          aria-labelledby="achievements-first"
          className="border-b border-border/60"
        >
          <Container className="section-space-sm">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14">
              <div className="max-w-xl">
                <p className="type-eyebrow">No badges yet</p>
                <h2
                  id="achievements-first"
                  className="page-section-title mt-2 text-foreground"
                >
                  Your first badge is one page away
                </h2>
                <p className="type-lede mt-3 text-muted-foreground">
                  Badges unlock as you read, take quizzes and come back on later
                  days. Everything is recorded in this browser only.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Link href="/deities" className={primaryLinkClass}>
                    Open a deity
                  </Link>
                  <Link href="/quiz" className={secondaryLinkClass}>
                    Take a quiz
                  </Link>
                </div>
              </div>
              <div>
                <p className="type-ui mb-3 font-medium text-foreground">
                  Closest to unlocking
                </p>
                <ul className="divide-y divide-border/70 rounded-lg border border-border/70 bg-card">
                  {nextUp.map((achievement) => (
                    <li
                      key={achievement.id}
                      className="flex items-center gap-4 px-5 py-4"
                    >
                      <Medallion achievement={achievement} />
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-base font-semibold text-foreground">
                          {achievement.name}
                        </p>
                        <p className="type-ui text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                      <span className="type-meta tabular-nums text-muted-foreground">
                        {achievement.xp} XP
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      <Container className="section-space-sm">
        {CATEGORY_ORDER.map((category) => {
          const list = grouped[category];
          if (!list?.length) return null;
          const unlocked = list.filter((a) => a.unlocked).length;
          return (
            <section
              key={category}
              aria-labelledby={`achievements-${category}`}
              className="mb-14 last:mb-0"
            >
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-3">
                <h2
                  id={`achievements-${category}`}
                  className="flex items-center gap-3 font-serif text-2xl font-semibold text-foreground"
                >
                  <MythosMark
                    id={categoryMarks[category] ?? "laurel"}
                    className="size-5 text-gold-text"
                  />
                  {categoryLabels[category]}
                </h2>
                <p className="type-ui tabular-nums text-muted-foreground">
                  {unlocked} / {list.length} unlocked
                </p>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((achievement) => (
                  <li key={achievement.id}>
                    <AchievementCard achievement={achievement} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </Container>
    </div>
  );
}
