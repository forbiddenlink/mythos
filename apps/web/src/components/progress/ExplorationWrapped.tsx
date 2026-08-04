"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MythosMark } from "@/components/icons/mythos-marks";
import { useProgress } from "@/hooks/use-progress";
import deitiesData from "@/data/deities.json";
import storiesData from "@/data/stories.json";
import pantheonsData from "@/data/pantheons.json";

/**
 * Spotify-Wrapped-style monthly exploration recap (time-slip pattern).
 */
export function ExplorationWrapped() {
  const { progress } = useProgress();

  const summary = useMemo(() => {
    const deities = deitiesData as Array<{
      id: string;
      slug: string;
      name: string;
      pantheonId: string;
    }>;
    const stories = storiesData as Array<{
      id: string;
      slug: string;
      title: string;
      pantheonId: string;
    }>;
    const pantheons = pantheonsData as Array<{
      id: string;
      name: string;
      slug: string;
    }>;

    const viewed = new Set(progress.deitiesViewed ?? []);
    const read = new Set(progress.storiesRead ?? []);
    const exploredPantheons = new Set(progress.pantheonsExplored ?? []);

    const pantheonCounts = new Map<string, number>();
    for (const d of deities) {
      if (!viewed.has(d.id)) continue;
      pantheonCounts.set(
        d.pantheonId,
        (pantheonCounts.get(d.pantheonId) ?? 0) + 1,
      );
    }

    const topPantheonId = [...pantheonCounts.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];
    const topPantheon =
      pantheons.find((p) => p.id === topPantheonId)?.name ?? "—";

    const sampleDeities = deities.filter((d) => viewed.has(d.id)).slice(0, 3);
    const sampleStories = stories.filter((s) => read.has(s.id)).slice(0, 2);

    const cold = pantheons
      .filter((p) => !exploredPantheons.has(p.id))
      .slice(0, 3);

    return {
      deityCount: viewed.size,
      storyCount: read.size,
      pantheonCount: exploredPantheons.size,
      streak: progress.dailyStreak ?? 0,
      xp: progress.totalXP ?? 0,
      topPantheon,
      sampleDeities,
      sampleStories,
      cold,
    };
  }, [progress]);

  if (summary.deityCount === 0 && summary.storyCount === 0) {
    return (
      <section className="border border-border/60 bg-card/50 p-6">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold/80">
          <MythosMark id="chronos" className="h-4 w-4 text-gold" />
          Exploration Wrapped
        </div>
        <h2 className="font-serif text-2xl text-foreground">
          Your atlas so far
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          View a few deities or read a story — then return here for a shareable
          snapshot of where you&apos;ve wandered.
        </p>
        <Link
          href="/deities"
          className="mt-4 inline-block text-sm text-gold underline-offset-4 hover:underline"
        >
          Start exploring →
        </Link>
      </section>
    );
  }

  return (
    <section className="border border-gold/30 bg-linear-to-br from-card via-card to-gold/5 p-6">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold/80">
        <MythosMark id="laurel" className="h-4 w-4 text-gold" />
        Exploration Wrapped
      </div>
      <h2 className="font-serif text-2xl text-foreground">Your atlas so far</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A personal snapshot of what you&apos;ve opened in Mythos — not a
        leaderboard, a trail.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Deities", value: summary.deityCount },
          { label: "Stories", value: summary.storyCount },
          { label: "Pantheons", value: summary.pantheonCount },
          { label: "Day streak", value: summary.streak },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-border/50 bg-background/40 p-3"
          >
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </dt>
            <dd className="font-serif text-3xl text-gold">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Deepest pantheon
          </p>
          <p className="mt-1 font-serif text-xl text-foreground">
            {summary.topPantheon}
          </p>
          {summary.sampleDeities.length > 0 && (
            <ul className="mt-3 space-y-1">
              {summary.sampleDeities.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/deities/${d.slug}`}
                    className="text-sm text-gold hover:underline"
                  >
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Still cold
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pantheons you haven&apos;t opened yet — good Discover targets.
          </p>
          {summary.cold.length > 0 ? (
            <ul className="mt-3 space-y-1">
              {summary.cold.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/pantheons/${p.slug}`}
                    className="text-sm text-foreground hover:text-gold"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-gold">Every pantheon touched.</p>
          )}
        </div>
      </div>

      {summary.sampleStories.length > 0 && (
        <div className="mt-6 border-t border-border/40 pt-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Stories on your shelf
          </p>
          <ul className="mt-2 flex flex-wrap gap-3">
            {summary.sampleStories.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/stories/${s.slug}`}
                  className="text-sm text-gold hover:underline"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        {summary.xp} XP earned · progress stays in this browser
      </p>
    </section>
  );
}
