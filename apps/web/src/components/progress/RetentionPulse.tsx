"use client";

import { useEffect, useState } from "react";

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

  // Nothing to show until the reader has answered the post-quiz question.
  if (!pulse) return null;

  return (
    <section className="rounded-lg border border-border/70 bg-card p-5">
      <h2 className="font-serif text-xl font-semibold text-foreground">
        Your quiz feedback
      </h2>
      <p className="mt-1 type-ui text-muted-foreground">
        What you told us after your latest quiz on this device.
      </p>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">
            Answer
          </dt>
          <dd className="mt-0.5 font-medium text-gold-text">
            {LABELS[pulse.rating]}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">
            Quiz score
          </dt>
          <dd className="mt-0.5 text-foreground">
            {typeof pulse.score === "number" && typeof pulse.total === "number"
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
    </section>
  );
}
