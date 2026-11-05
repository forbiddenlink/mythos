"use client";

import { useState, useEffect, useCallback, useContext, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Timer,
  Trophy,
  RefreshCw,
  Zap,
  Check,
  X,
  Share2,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import { ProgressContext } from "@/providers/progress-provider";
import { useAchievements } from "@/hooks/useAchievements";
import {
  generateQuickQuizQuestion,
  type QuickQuizDeity,
  type QuickQuizQuestion,
} from "@/lib/quick-quiz";

interface QuickQuizPageClientProps {
  deitiesData: QuickQuizDeity[];
}

export function QuickQuizPageClient({
  deitiesData,
}: Readonly<QuickQuizPageClientProps>) {
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">(
    "ready",
  );
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [question, setQuestion] = useState<QuickQuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [quizUnavailable, setQuizUnavailable] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadline = useRef(0);

  const progressContext = useContext(ProgressContext);
  const { checkAchievements } = useAchievements();

  // Load high score from progress context or localStorage
  useEffect(() => {
    if (progressContext?.progress.quickQuizHighScore) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate high score from progress context
      setHighScore(progressContext.progress.quickQuizHighScore);
    } else {
      try {
        const saved = Number(
          localStorage.getItem("mythos_quick_quiz_highscore"),
        );
        if (Number.isSafeInteger(saved) && saved >= 0) setHighScore(saved);
      } catch {
        // Storage can be disabled; the quiz remains playable for this visit.
      }
    }
  }, [progressContext?.progress.quickQuizHighScore]);

  const nextQuestion = useCallback(() => {
    const next = generateQuickQuizQuestion(deitiesData);
    setQuestion(next);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizUnavailable(!next);
    return Boolean(next);
  }, [deitiesData]);

  const startGame = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (!nextQuestion()) return;
    deadline.current = Date.now() + 60_000;
    setGameState("playing");
    setTimeLeft(60);
    setScore(0);
    setIsNewHighScore(false);
  }, [nextQuestion]);

  // Use an elapsed-time deadline so answers and background tabs cannot extend
  // the round by repeatedly restarting a one-second interval.
  useEffect(() => {
    if (gameState !== "playing") return;
    const tick = () =>
      setTimeLeft(
        Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)),
      );
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    [],
  );

  // Finish the round and save its score without depending on storage access.
  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- game-over state transition in timer effect
      setGameState("finished");
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      if (score > highScore) {
        setHighScore(score);
        setIsNewHighScore(true);
        try {
          localStorage.setItem("mythos_quick_quiz_highscore", score.toString());
        } catch {
          // Keep the result visible even when browser storage is full or blocked.
        }
        // Save to progress context for achievements
        if (progressContext) {
          progressContext.updateQuickQuizHighScore(score);
          // Check achievements after a brief delay to ensure state is updated
          setTimeout(() => checkAchievements(), 100);
        }
      } else {
        setIsNewHighScore(false);
      }
      return;
    }
  }, [
    gameState,
    timeLeft,
    score,
    highScore,
    progressContext,
    checkAchievements,
  ]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (
        showResult ||
        gameState !== "playing" ||
        Date.now() >= deadline.current
      )
        return;
      setSelectedAnswer(answer);
      setShowResult(true);

      if (answer === question?.correctAnswer) {
        setScore((s) => s + 1);
      }

      advanceTimer.current = setTimeout(() => {
        nextQuestion();
      }, 800);
    },
    [showResult, gameState, question, nextQuestion],
  );

  const handleShare = async () => {
    const shareText = `I scored ${score} in the Mythos Atlas Quick Quiz! Can you beat my score?`;
    const shareUrl = `${globalThis.location.origin}/quiz/quick`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mythos Atlas Quick Quiz",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      try {
        const fullText = `${shareText}\n${shareUrl}`;
        await navigator.clipboard.writeText(fullText);
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 3000);
      } catch {
        // Clipboard API unavailable (insecure context / WebView)
      }
    }
  };

  return (
    <div className="relative">
      <div>
        {gameState === "ready" && (
          <section
            aria-labelledby="quick-quiz-ready"
            className="dark relative isolate overflow-hidden rounded-lg bg-midnight px-6 py-10 text-center text-foreground md:px-10 md:py-14"
          >
            <p className="font-serif text-7xl font-semibold tabular-nums text-gold-light md:text-8xl">
              60
            </p>
            <p className="type-eyebrow mt-1 text-parchment/75">seconds</p>
            <h2
              id="quick-quiz-ready"
              className="mt-6 font-serif text-2xl font-semibold text-parchment md:text-3xl"
            >
              Ready to race?
            </h2>
            <p className="mx-auto mt-2 max-w-md type-reading text-parchment/80">
              Answer as many mythology questions as you can before the time runs
              out.
            </p>
            <Button
              onClick={startGame}
              size="lg"
              className="mt-8 h-12 gap-2 bg-gold px-8 font-semibold text-midnight hover:bg-gold-light"
            >
              <Zap className="h-5 w-5" />
              Start Quiz
            </Button>
            {quizUnavailable && (
              <p role="status" className="mt-4 text-parchment">
                There aren&apos;t enough distinct answers for a round. Try the{" "}
                <Link href="/quiz" className="underline underline-offset-4">
                  quiz hub
                </Link>
                .
              </p>
            )}
            <p className="mt-5 flex items-center justify-center gap-2 type-ui text-parchment/75">
              <Trophy className="size-4 text-gold-light" aria-hidden="true" />
              High Score: {highScore}
            </p>
          </section>
        )}

        {gameState === "playing" && question && (
          <div className="space-y-6">
            {/* Timer and Score */}
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className={`text-lg px-4 py-2 ${timeLeft <= 10 ? "border-destructive text-destructive animate-pulse" : "border-gold text-gold"}`}
              >
                <Timer className="h-4 w-4 mr-2" />
                {timeLeft}s
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Trophy className="h-4 w-4 mr-2" />
                {score}
              </Badge>
            </div>

            <Progress
              value={(timeLeft / 60) * 100}
              aria-label="Time remaining"
              aria-valuetext={`${timeLeft} seconds remaining`}
              className="h-2"
            />

            {/* Question */}
            <Card>
              <CardHeader>
                <CardTitle
                  id="quick-quiz-question"
                  className="font-serif text-xl text-center"
                >
                  {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  role="group"
                  aria-labelledby="quick-quiz-question"
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  {question.options.map((option) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === question.correctAnswer;
                    const showFeedback =
                      showResult && (isSelected || isCorrect);

                    return (
                      <Button
                        key={option}
                        variant="outline"
                        className={`h-auto min-h-12 min-w-0 whitespace-normal break-words py-4 px-4 text-left justify-start disabled:opacity-100 ${
                          showFeedback
                            ? isCorrect
                              ? "border-green-500 bg-green-500/10 text-green-800 dark:text-green-300"
                              : isSelected
                                ? "border-destructive bg-destructive/10 text-destructive"
                                : ""
                            : "hover:border-gold/50"
                        }`}
                        onClick={() => handleAnswer(option)}
                        disabled={showResult}
                      >
                        {showFeedback && (
                          <span className="mr-2">
                            {isCorrect ? (
                              <Check className="h-4 w-4" />
                            ) : isSelected ? (
                              <X className="h-4 w-4" />
                            ) : null}
                          </span>
                        )}
                        {option}
                      </Button>
                    );
                  })}
                </div>
                <p
                  role="status"
                  className="mt-4 min-h-6 text-sm text-foreground"
                >
                  {showResult &&
                    `${selectedAnswer === question.correctAnswer ? "Correct." : "Not quite."} ${question.correctAnswer} is linked to ${question.domain} in the atlas.`}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === "finished" && (
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="font-serif text-3xl">
                Time&apos;s Up!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="py-8">
                <div className="mb-2 font-serif text-6xl font-semibold tabular-nums text-gold-text">
                  {score}
                </div>
                <p className="text-muted-foreground">correct answers</p>
              </div>

              {isNewHighScore && score > 0 && (
                <Badge className="bg-gold text-midnight">New High Score!</Badge>
              )}

              <div className="flex gap-4 justify-center flex-wrap">
                <Button onClick={startGame} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Play Again
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share Score
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/quiz">Back to Quizzes</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Copied toast */}
      {showCopiedToast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-card/95 backdrop-blur-md border border-gold/30 shadow-lg shadow-gold/10 rounded-xl px-4 py-3 animate-in slide-in-from-right-5 fade-in duration-300">
          <ClipboardCheck className="h-4 w-4 text-gold" />
          <span className="text-sm font-medium text-foreground">
            Score copied to clipboard!
          </span>
        </div>
      )}
    </div>
  );
}
