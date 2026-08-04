"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Rating = "very" | "somewhat" | "not";

const STORAGE_KEY = "mythos_quiz_disappointed_v1";

/**
 * Sean Ellis–style "very disappointed" pulse after quiz completion.
 * Stored locally + optionally beaconed to /api/analytics/events.
 */
export function QuizRetentionSurvey({
  quizId = "mythology-quiz",
  score,
  total,
}: {
  quizId?: string;
  score: number;
  total: number;
}) {
  const [done, setDone] = useState<boolean | null>(null);
  const [picked, setPicked] = useState<Rating | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { at?: number };
        if (parsed.at && Date.now() - parsed.at < 14 * 86400000) {
          setDone(true);
          return;
        }
      }
      setDone(false);
    } catch {
      setDone(false);
    }
  }, []);

  const submit = (rating: Rating) => {
    setPicked(rating);
    const payload = {
      type: "quiz_disappointed",
      quizId,
      rating,
      score,
      total,
      at: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore quota */
    }
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/events", body);
    } else {
      void fetch("/api/analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
    setTimeout(() => setDone(true), 1200);
  };

  if (done === null) return null;
  if (done && !picked) return null;

  if (picked) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Thanks — that helps decide what to deepen next.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-center">
      <p className="text-sm font-medium text-foreground">
        How would you feel if you could no longer use Mythos Atlas?
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => submit("very")}
          className="border-gold/40 hover:bg-gold/10"
        >
          Very disappointed
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => submit("somewhat")}
        >
          Somewhat
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => submit("not")}
        >
          Not disappointed
        </Button>
      </div>
    </div>
  );
}
