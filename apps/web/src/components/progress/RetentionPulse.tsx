"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "mythos_quiz_disappointed_v1";

type Pulse = {
  rating: "very" | "somewhat" | "not";
  score?: number;
  total?: number;
  at: number;
};

const LABELS: Record<Pulse["rating"], string> = {
  very: "Very disappointed",
  somewhat: "Somewhat disappointed",
  not: "Not disappointed",
};

/**
 * Surfaces the local Sean Ellis pulse so retention isn't only server logs.
 */
export function RetentionPulse() {
  const [pulse, setPulse] = useState<Pulse | null | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate pulse state from localStorage on mount
        setPulse(null);
        return;
      }
      const parsed = JSON.parse(raw) as Pulse;
      if (!parsed?.at || !parsed?.rating) {
        setPulse(null);
        return;
      }
      setPulse(parsed);
    } catch {
      setPulse(null);
    }
  }, []);

  if (pulse === undefined) return null;

  return (
    <section className="rounded-xl border border-border/60 bg-card/60 p-5">
      <h2 className="font-serif text-xl text-foreground">Atlas pulse</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sean Ellis signal from this device (last 14 days on the quiz).
      </p>
      {pulse ? (
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Answer
            </dt>
            <dd className="mt-0.5 font-medium text-gold">
              {LABELS[pulse.rating]}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Quiz score
            </dt>
            <dd className="mt-0.5 text-foreground">
              {typeof pulse.score === "number" &&
              typeof pulse.total === "number"
                ? `${pulse.score}/${pulse.total}`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Recorded
            </dt>
            <dd className="mt-0.5 text-foreground">
              {new Date(pulse.at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No pulse yet.{" "}
          <Link
            href="/quiz"
            className="text-gold underline-offset-4 hover:underline"
          >
            Finish a quiz
          </Link>{" "}
          to leave one — it guides what we deepen next.
        </p>
      )}
    </section>
  );
}
