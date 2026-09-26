"use client";

import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useRef, useState } from "react";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { ShareButton } from "@/components/sharing/ShareButton";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics/events";
import {
  DAILY_MYTH_CHALLENGE_ID,
  dailyMythXp,
  pickDailyMyth,
  type DailyMyth,
  type DailyMythPool,
} from "@/lib/daily-myth";
import { toLocalDateString } from "@/lib/date";
import { quizResultPath, quizResultVerdict } from "@/lib/quiz-share";
import { cn } from "@/lib/utils";
import { ProgressContext } from "@/providers/progress-provider";

const RESULT_STORAGE_KEY = "mythos-atlas-daily-myth";

interface StoredResult {
  date: string;
  mythId: string;
  score: number;
}

function readStoredResult(date: string): StoredResult | null {
  try {
    const raw = localStorage.getItem(RESULT_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<StoredResult>) : null;
    return parsed?.date === date &&
      typeof parsed.mythId === "string" &&
      typeof parsed.score === "number"
      ? (parsed as StoredResult)
      : null;
  } catch {
    return null;
  }
}

function storeResult(result: StoredResult) {
  try {
    localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
  } catch {
    // Storage full or blocked: the result still shows for this visit.
  }
}

type Phase =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "intro" }
  | { kind: "question"; index: number; chosen: number | null; score: number }
  | { kind: "result"; score: number };

/**
 * "Today's myth": a small daily ritual on the prerendered homepage. The
 * question pool is fetched as static JSON once the section nears the
 * viewport, and the day is taken from the reader's local date.
 */
export function TodaysMyth() {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useContext(ProgressContext);
  const [myth, setMyth] = useState<DailyMyth | null>(null);
  const [today, setToday] = useState("");
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    let cancelled = false;
    const load = () => {
      const date = toLocalDateString(new Date());
      fetch("/api/daily-myth", { credentials: "same-origin" })
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status));
          return res.json() as Promise<DailyMythPool>;
        })
        .then((pool) => {
          if (cancelled) return;
          const picked = pickDailyMyth(pool.myths, new Date());
          setToday(date);
          setMyth(picked);
          const stored = readStoredResult(date);
          setPhase(
            !picked
              ? { kind: "error" }
              : stored && stored.mythId === picked.id
                ? { kind: "result", score: stored.score }
                : { kind: "intro" },
          );
        })
        .catch(() => {
          if (!cancelled) setPhase({ kind: "error" });
        });
    };
    if (typeof IntersectionObserver === "undefined") {
      load();
      return () => {
        cancelled = true;
      };
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          load();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  const start = () => {
    setPhase({ kind: "question", index: 0, chosen: null, score: 0 });
    trackEvent("quiz_started", { quizId: "daily" });
  };

  const choose = (option: number) => {
    if (phase.kind !== "question" || phase.chosen !== null || !myth) return;
    const correct = option === myth.questions[phase.index].answer;
    setPhase({
      ...phase,
      chosen: option,
      score: phase.score + (correct ? 1 : 0),
    });
  };

  const next = () => {
    if (phase.kind !== "question" || !myth) return;
    if (phase.index + 1 < myth.questions.length) {
      setPhase({ ...phase, index: phase.index + 1, chosen: null });
      return;
    }
    const score = phase.score;
    const total = myth.questions.length;
    storeResult({ date: today, mythId: myth.id, score });
    if (!progress?.isDailyChallengeClaimed(DAILY_MYTH_CHALLENGE_ID)) {
      progress?.claimDailyChallenge(
        DAILY_MYTH_CHALLENGE_ID,
        dailyMythXp(score),
      );
    }
    trackEvent("quiz_completed", { quizId: "daily", score, total });
    setPhase({ kind: "result", score });
  };

  return (
    <section
      ref={sectionRef}
      id="todays-myth"
      aria-labelledby="todays-myth-title"
      className="section-space scroll-mt-20 border-y border-border/60 bg-muted/45"
    >
      <div className="layout-container layout-container-content grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="type-eyebrow">Daily ritual</p>
          <h2
            id="todays-myth-title"
            className="page-section-title mt-2 text-foreground"
          >
            Today&apos;s myth
          </h2>
          <p className="type-lede mt-3 text-muted-foreground">
            One myth a day and three questions about it. A new one each morning,
            by your local date.
          </p>
        </div>

        <div className="min-h-48" aria-live="polite">
          {phase.kind === "loading" ? (
            <div
              role="status"
              className="h-64 animate-pulse rounded-lg bg-card ring-1 ring-border/70 motion-reduce:animate-none"
            >
              <span className="sr-only">Loading today&apos;s myth</span>
            </div>
          ) : null}

          {phase.kind === "error" ? (
            <p className="text-muted-foreground">
              Today&apos;s myth could not be loaded.{" "}
              <Link href="/stories" className="text-gold-text underline">
                Browse the stories
              </Link>{" "}
              instead.
            </p>
          ) : null}

          {myth && phase.kind === "intro" ? (
            <div className="grid gap-6 overflow-hidden rounded-lg bg-card ring-1 ring-border/70 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
              {myth.imageUrl ? (
                <div className="relative aspect-[3/2] sm:aspect-auto sm:min-h-64">
                  <Image
                    src={myth.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 14rem, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="px-5 pb-6 sm:py-6 sm:pr-6 sm:pl-0">
                <p className="text-[0.8125rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {myth.tradition}
                </p>
                <h3 className="mt-1 font-serif text-2xl font-semibold text-foreground">
                  {myth.title}
                </h3>
                <p className="mt-3 line-clamp-4 font-body text-lg leading-relaxed text-foreground/85">
                  {myth.summary}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Button variant="gold" size="lg" onClick={start}>
                    Answer three questions
                  </Button>
                  <Link
                    href={`/stories/${myth.slug}`}
                    className="inline-flex min-h-11 items-center text-gold-text underline underline-offset-4"
                  >
                    Read the myth first
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          {myth && phase.kind === "question" ? (
            <QuestionView
              myth={myth}
              index={phase.index}
              chosen={phase.chosen}
              onChoose={choose}
              onNext={next}
            />
          ) : null}

          {myth && phase.kind === "result" ? (
            <ResultView
              myth={myth}
              score={phase.score}
              streak={progress?.progress.dailyChallengeStreak ?? 0}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

function QuestionView({
  myth,
  index,
  chosen,
  onChoose,
  onNext,
}: Readonly<{
  myth: DailyMyth;
  index: number;
  chosen: number | null;
  onChoose: (option: number) => void;
  onNext: () => void;
}>) {
  const question = myth.questions[index];
  const answered = chosen !== null;
  const last = index + 1 === myth.questions.length;

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Question {index + 1} of {myth.questions.length}
      </p>
      <h3 className="mt-2 font-serif text-xl text-foreground">
        {question.prompt}
      </h3>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {question.options.map((option, i) => {
          const isAnswer = i === question.answer;
          const isChosen = i === chosen;
          return (
            <li key={option}>
              <button
                type="button"
                onClick={() => onChoose(i)}
                disabled={answered}
                aria-pressed={isChosen}
                className={cn(
                  "min-h-11 w-full border px-4 py-2 text-left transition-colors",
                  !answered && "border-border hover:border-gold/60",
                  answered && isAnswer && "border-patina bg-patina/10",
                  answered &&
                    isChosen &&
                    !isAnswer &&
                    "border-destructive bg-destructive/10",
                  answered && !isAnswer && !isChosen && "opacity-60",
                )}
              >
                {option}
                {answered && isAnswer ? (
                  <span className="sr-only"> (correct answer)</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {answered ? (
        <div className="mt-4">
          <p className="text-sm text-foreground">
            <strong>
              {chosen === question.answer ? "Correct." : "Not quite."}
            </strong>{" "}
            {question.explanation}
          </p>
          <Button className="mt-4" variant="outline" onClick={onNext}>
            {last ? "See your result" : "Next question"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ResultView({
  myth,
  score,
  streak,
}: Readonly<{ myth: DailyMyth; score: number; streak: number }>) {
  const total = myth.questions.length;
  const verdict = quizResultVerdict(score, total);
  const sharePath = quizResultPath(score, total, "daily");

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className="font-display text-5xl font-bold text-gold-text">
          {score}
          <span className="text-2xl text-gold-text/70"> / {total}</span>
        </p>
        <p className="font-serif text-xl text-foreground">{verdict.title}</p>
      </div>
      <p className="mt-2 text-muted-foreground">
        Today&apos;s myth was <strong>{myth.title}</strong> ({myth.tradition}).
        {streak > 1 ? ` That's ${streak} days in a row.` : ""} Come back
        tomorrow for the next one.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <ShareButton
          surface="daily_myth"
          title="Today's myth on Mythos Atlas"
          text={`I scored ${score}/${total} on today's myth, "${myth.title}". Can you beat it?`}
          url={`https://mythosatlas.com${sharePath}`}
        />
        <Link
          href={`/stories/${myth.slug}`}
          className="inline-flex min-h-11 items-center text-gold-text underline underline-offset-4"
        >
          Read {myth.title}
        </Link>
      </div>
      <NewsletterSignup
        placement="daily_myth"
        className="mt-10 border-t border-border pt-6"
        title="Get a myth every week"
        description="Enjoyed today's myth? The weekly digest brings one myth, its sources and a question to think about."
      />
    </div>
  );
}
