"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Brain, Loader2, RotateCcw, Sparkles } from "lucide-react";

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
 * Hidden when NEXT_PUBLIC_STORY_QUIZ_UI=false. Server still needs ANTHROPIC_API_KEY.
 */
export function StoryPracticeQuiz({
  storySlug,
  storyTitle,
  questionCount = 5,
}: Readonly<StoryPracticeQuizProps>) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "ready"
  >("idle");
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
    questions.length > 0 &&
    questions.every((_, i) => picked[i] !== undefined);

  if (!showUi) {
    return null;
  }

  return (
    <Card className="border-emerald-500/25 bg-midnight-light/50">
      <CardHeader>
        <CardTitle className="text-parchment text-2xl font-serif flex items-center gap-2">
          <Brain className="h-6 w-6 text-emerald-400" />
          Practice quiz
        </CardTitle>
        <CardDescription className="text-parchment/70">
          Short multiple-choice questions generated from this article’s text on
          Mythos Atlas — not general trivia. Uses the same rate limits as the
          Oracle.{" "}
          <span className="text-parchment/55">
            Requires an Anthropic API key on the server to generate new
            questions.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "idle" || status === "error" ? (
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Button
              type="button"
              onClick={generate}
              // @ts-expect-error status narrowed but kept for guard
              disabled={status === "loading"}
              className="gap-2 bg-emerald-600 hover:bg-emerald-600/90 text-white"
            >
              {/* @ts-expect-error status narrowed but kept for guard */}
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate quiz from “{storyTitle}”
            </Button>
            {status === "error" && errorMessage ? (
              <p className="text-sm text-amber-200/90">{errorMessage}</p>
            ) : null}
          </div>
        ) : null}

        {status === "loading" ? (
          <p className="text-sm text-parchment/70 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
            Writing questions from the story…
          </p>
        ) : null}

        {status === "ready" && questions.length > 0 ? (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-parchment/80">
                {allAnswered ? (
                  <>
                    Score: {score.correct} / {score.total}
                  </>
                ) : (
                  <>Answer each question — feedback appears after you choose.</>
                )}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 border-emerald-500/40"
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

            <ol className="space-y-6 list-decimal list-inside marker:text-emerald-400/90">
              {questions.map((q, qi) => {
                const choice = picked[qi];
                const showResult = choice !== undefined;
                return (
                  <li key={`${qi}-${q.question.slice(0, 24)}`} className="">
                    <span className="text-parchment font-medium leading-relaxed">
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
                                "text-parchment/90",
                                !showResult &&
                                  "border-border/60 bg-midnight/40 hover:border-emerald-500/50 hover:bg-midnight/60",
                                showCorrect &&
                                  "border-emerald-500/70 bg-emerald-950/40",
                                showWrong && "border-red-500/50 bg-red-950/30",
                                showResult &&
                                  !isCorrect &&
                                  !isPicked &&
                                  "opacity-50",
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
                            ? "text-emerald-300/95"
                            : "text-amber-200/90",
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
          <p className="text-sm text-parchment/70">No questions returned.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
