"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, RotateCcw } from "lucide-react";

export interface StoryQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  rationale: string;
}

interface StoryPracticeQuizProps {
  storySlug: string;
  storyTitle: string;
  /** Number of MCQs to request (1–10). Default 5. */
  questionCount?: number;
}

/**
 * AI-generated practice quiz grounded in this story’s catalog text.
 * Hidden when NEXT_PUBLIC_STORY_QUIZ_UI=false. Rendered on the story page only when NEXT_PUBLIC_ORACLE_ENABLED=true; the server needs a configured Oracle provider (Anthropic or Groq).
 */
export function StoryPracticeQuiz({
  storySlug,
  storyTitle,
  questionCount = 5,
}: Readonly<StoryPracticeQuizProps>) {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questions, setQuestions] = useState<StoryQuizQuestion[]>([]);
  /** Per-question: index of option user chose, or undefined */
  const [picked, setPicked] = useState<Record<number, number | undefined>>({});

  const showUi =
    typeof process.env.NEXT_PUBLIC_STORY_QUIZ_UI === "undefined" ||
    process.env.NEXT_PUBLIC_STORY_QUIZ_UI === "true";

  const generate = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    setPicked({});
    try {
      const res = await fetch("/api/quiz/generate-from-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storySlug,
          count: Math.min(10, Math.max(1, questionCount)),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        questions?: StoryQuizQuestion[];
      };
      if (!res.ok) {
        setErrorMessage(
          typeof data.error === "string"
            ? data.error
            : "Could not generate a quiz right now.",
        );
        setStatus("error");
        setQuestions([]);
        return;
      }
      const qs = data.questions ?? [];
      setQuestions(qs);
      setStatus("ready");
    } catch {
      setErrorMessage("Network error. Try again in a moment.");
      setStatus("error");
      setQuestions([]);
    }
  }, [storySlug, questionCount]);

  const score = useMemo(() => {
    let correct = 0;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const p = picked[i];
      if (p !== undefined && q && p === q.correctIndex) correct++;
    }
    return { correct, total: questions.length };
  }, [questions, picked]);

  const allAnswered =
    questions.length > 0 && questions.every((_, i) => picked[i] !== undefined);

  if (!showUi) {
    return null;
  }

  return (
    <div className="type-ui space-y-4 rounded-lg border border-border bg-card p-5 text-card-foreground sm:p-6">
      {status === "idle" || status === "error" ? (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Button
            type="button"
            onClick={generate}
            // @ts-expect-error status narrowed but kept for guard
            disabled={status === "loading"}
            className="gap-2"
          >
            {/* @ts-expect-error status narrowed but kept for guard */}
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Generate quiz from “{storyTitle}”
          </Button>
          {status === "error" && errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}
        </div>
      ) : null}

      {status === "loading" ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Writing questions from the story…
        </p>
      ) : null}

      {status === "ready" && questions.length > 0 ? (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {allAnswered ? (
                <>
                  Score: {score.correct} / {score.total}
                </>
              ) : (
                <>Answer each question; feedback appears after you choose.</>
              )}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => {
                setQuestions([]);
                setPicked({});
                setStatus("idle");
                setErrorMessage(null);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New quiz
            </Button>
          </div>

          <ol className="space-y-6 list-decimal list-inside marker:text-gold-text">
            {questions.map((q, qi) => {
              const choice = picked[qi];
              const showResult = choice !== undefined;
              return (
                <li key={`${qi}-${q.question.slice(0, 24)}`} className="">
                  <span className="text-foreground font-medium leading-relaxed">
                    {q.question}
                  </span>
                  <ul className="mt-3 space-y-2 pl-0 list-none">
                    {q.options.map((opt, oi) => {
                      const isPicked = choice === oi;
                      const isCorrect = oi === q.correctIndex;
                      const showCorrect = showResult && isCorrect;
                      const showWrong = showResult && isPicked && !isCorrect;
                      return (
                        <li key={oi}>
                          <button
                            type="button"
                            disabled={showResult}
                            onClick={() => {
                              setPicked((prev) => ({
                                ...prev,
                                [qi]: oi,
                              }));
                            }}
                            className={cn(
                              "w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors",
                              "text-foreground",
                              !showResult &&
                                "border-border bg-background hover:border-primary/60 hover:bg-accent",
                              showCorrect && "border-patina bg-patina/10",
                              showWrong &&
                                "border-destructive bg-destructive/10",
                              showResult &&
                                !isCorrect &&
                                !isPicked &&
                                "border-border text-muted-foreground",
                            )}
                          >
                            {opt}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {showResult ? (
                    <p
                      className={cn(
                        "mt-2 text-sm leading-relaxed",
                        choice === q.correctIndex
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {choice === q.correctIndex ? "Correct. " : ""}
                      {q.rationale}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      {status === "ready" && questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No questions returned.</p>
      ) : null}
    </div>
  );
}
