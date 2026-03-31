"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { RelationshipQuizCard } from "@/components/quiz/RelationshipQuizCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Trophy,
  RefreshCw,
  ArrowRight,
  Zap,
  Timer,
  Crown,
  Target,
  Star,
  ChevronLeft,
  Share2,
  Check,
} from "lucide-react";
import {
  generateRelationshipQuiz,
  calculateQuizXP,
  TIME_LIMITS,
  XP_REWARDS,
  type RelationshipQuestion,
  type Difficulty,
  type Relationship,
} from "@/lib/relationship-quiz";
import { useProgress } from "@/hooks/use-progress";
import deitiesData from "@/data/deities.json";
import relationshipsData from "@/data/relationships.json";
import type { Deity } from "@/types/Entity";

interface QuizState {
  questions: RelationshipQuestion[];
  currentIndex: number;
  score: number;
  answers: {
    question: RelationshipQuestion;
    answer: string;
    isCorrect: boolean;
  }[];
  isComplete: boolean;
}

function getCompletionMessage(percentage: number): string {
  if (percentage === 100)
    return "Perfect score! You have mastered the divine family tree!";
  if (percentage >= 80)
    return "Excellent! Your knowledge of divine relationships is impressive!";
  if (percentage >= 60)
    return "Well done! The gods recognize your dedication to learning.";
  return "Keep studying the divine lineages. The Muses will guide you.";
}

export default function RelationshipQuizPage() {
  const searchParams = useSearchParams();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [useTimer, setUseTimer] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [highScore, setHighScore] = useState(0);
  const [copied, setCopied] = useState(false);

  const { recordQuizScore, unlockAchievement, progress } = useProgress();

  // Check for shared results in URL
  const sharedScore = searchParams.get("score");
  const sharedTotal = searchParams.get("total");
  const sharedDifficulty = searchParams.get("difficulty") as Difficulty | null;
  const isSharedResult = sharedScore !== null && sharedTotal !== null;

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem("mythos_relationship_quiz_highscore");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate high score from localStorage
    if (saved) setHighScore(Number.parseInt(saved));
  }, []);
  const deities = deitiesData as Deity[];
  const relationships = relationshipsData as Relationship[];

  const startQuiz = useCallback(() => {
    const questions = generateRelationshipQuiz(
      deities,
      relationships,
      questionCount,
      difficulty,
    );

    setQuizState({
      questions,
      currentIndex: 0,
      score: 0,
      answers: [],
      isComplete: false,
    });
    setQuizStarted(true);
  }, [deities, relationships, questionCount, difficulty]);

  const handleAnswer = useCallback(
    (answer: string, isCorrect: boolean) => {
      if (!quizState) return;

      const currentQuestion = quizState.questions[quizState.currentIndex];
      const newScore = isCorrect ? quizState.score + 1 : quizState.score;

      setQuizState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          score: newScore,
          answers: [
            ...prev.answers,
            { question: currentQuestion, answer, isCorrect },
          ],
        };
      });
    },
    [quizState],
  );

  const handleNext = useCallback(() => {
    if (!quizState) return;

    const isLastQuestion =
      quizState.currentIndex >= quizState.questions.length - 1;

    if (isLastQuestion) {
      // Complete quiz
      const finalScore = quizState.score;
      const totalXP = calculateQuizXP(
        finalScore,
        quizState.questions.length,
        difficulty,
        useTimer,
      );

      // Update high score
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem(
          "mythos_relationship_quiz_highscore",
          finalScore.toString(),
        );
      }

      // Record quiz score
      const quizId = `relationship-${difficulty}-${Date.now()}`;
      recordQuizScore(
        quizId,
        Math.round((finalScore / quizState.questions.length) * 100),
      );

      // Unlock achievements
      if (finalScore === quizState.questions.length) {
        unlockAchievement("perfect_relationship_quiz", totalXP);
      } else if (finalScore >= quizState.questions.length * 0.8) {
        unlockAchievement("relationship_expert", Math.floor(totalXP * 0.5));
      }

      if (useTimer) {
        unlockAchievement("speed_demon", 25);
      }

      setQuizState((prev) => (prev ? { ...prev, isComplete: true } : null));
    } else {
      setQuizState((prev) =>
        prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : null,
      );
    }
  }, [
    quizState,
    difficulty,
    useTimer,
    highScore,
    recordQuizScore,
    unlockAchievement,
  ]);

  const handleTimeUp = useCallback(() => {
    handleAnswer("", false);
  }, [handleAnswer]);

  const restartQuiz = useCallback(() => {
    setQuizStarted(false);
    setQuizState(null);
  }, []);

  const handleShare = useCallback(
    async (score: number, total: number, diff: Difficulty) => {
      const params = new URLSearchParams({
        score: score.toString(),
        total: total.toString(),
        difficulty: diff,
      });
      const shareUrl = `${globalThis.location.origin}/quiz/relationships?${params.toString()}`;

      try {
        // Try native share first on mobile
        if (navigator.share) {
          const percentage = Math.round((score / total) * 100);
          await navigator.share({
            title: "My Quiz Results - Mythos Atlas",
            text: `I scored ${percentage}% on the Divine Relationships Quiz! Can you beat my score?`,
            url: shareUrl,
          });
        } else {
          // Fall back to clipboard
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch {
        try {
          await navigator.clipboard.writeText(shareUrl);
        } catch {
          // Clipboard API unavailable
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    [],
  );

  // Shared Results View (from URL params)
  if (isSharedResult) {
    const score = Number.parseInt(sharedScore);
    const total = Number.parseInt(sharedTotal);
    const diff = sharedDifficulty || "medium";
    const percentage = Math.round((score / total) * 100);

    return (
      <div className="min-h-screen bg-linear-to-b from-background to-mythic">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <Breadcrumbs />

          <Card className="max-w-2xl mx-auto mt-6 border-gold/20 shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-linear-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="text-center pt-8">
              <div className="mx-auto mb-4 p-2 rounded-full bg-gold/10 w-fit">
                <Badge
                  variant="secondary"
                  className="text-xs uppercase tracking-wider"
                >
                  Shared Result
                </Badge>
              </div>
              <div className="mx-auto mb-6 p-6 rounded-full bg-linear-to-br from-gold/20 to-amber-500/10 w-fit ring-1 ring-gold/30 shadow-inner">
                <Trophy className="h-16 w-16 text-gold drop-shadow-md" />
              </div>
              <CardTitle className="text-3xl font-serif">
                Quiz Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pb-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-gold mb-2 tracking-tight">
                  {score}/{total}
                </div>
                <p className="text-lg text-muted-foreground font-medium">
                  {percentage}% Mastery
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50 min-w-25">
                  <div className="text-muted-foreground text-sm mb-1">
                    Difficulty
                  </div>
                  <div className="font-bold text-lg capitalize">{diff}</div>
                </div>
              </div>

              <div className="text-center max-w-sm mx-auto">
                <p className="text-lg text-muted-foreground">
                  Think you can beat this score? Take the quiz yourself!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="flex-1 h-12 text-lg gap-2 bg-gold hover:bg-gold/90 text-black"
                >
                  <Link href="/quiz/relationships">
                    <Zap className="h-5 w-5" />
                    Take the Quiz
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="flex-1 h-12 text-lg gap-2"
                >
                  <Link href="/quiz">
                    <ChevronLeft className="h-5 w-5" />
                    All Quizzes
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz Complete Screen
  if (quizState?.isComplete) {
    const percentage = Math.round(
      (quizState.score / quizState.questions.length) * 100,
    );
    const totalXP = calculateQuizXP(
      quizState.score,
      quizState.questions.length,
      difficulty,
      useTimer,
    );

    return (
      <div className="min-h-screen bg-linear-to-b from-background to-mythic">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <Breadcrumbs />

          <Card className="max-w-2xl mx-auto mt-6 border-gold/20 shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-linear-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="text-center pt-8">
              <div className="mx-auto mb-6 p-6 rounded-full bg-linear-to-br from-gold/20 to-amber-500/10 w-fit ring-1 ring-gold/30 shadow-inner">
                <Trophy className="h-16 w-16 text-gold drop-shadow-md" />
              </div>
              <CardTitle className="text-3xl font-serif">
                Quiz Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pb-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-gold mb-2 tracking-tight">
                  {quizState.score}/{quizState.questions.length}
                </div>
                <p className="text-lg text-muted-foreground font-medium">
                  {percentage}% Mastery
                </p>
              </div>

              <div className="flex justify-center gap-4 flex-wrap">
                <div className="text-center p-4 rounded-lg bg-muted/50 min-w-25">
                  <div className="text-muted-foreground text-sm mb-1">
                    Difficulty
                  </div>
                  <div className="font-bold text-lg capitalize">
                    {difficulty}
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gold/10 border border-gold/20 min-w-25">
                  <div className="text-gold/80 text-sm mb-1 flex items-center justify-center gap-1">
                    <Zap className="h-3 w-3" /> XP Earned
                  </div>
                  <div className="font-bold text-lg text-gold">+{totalXP}</div>
                </div>
                {useTimer && (
                  <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 min-w-25">
                    <div className="text-purple-500/80 text-sm mb-1 flex items-center justify-center gap-1">
                      <Timer className="h-3 w-3" /> Challenge
                    </div>
                    <div className="font-bold text-lg text-purple-500">
                      +15%
                    </div>
                  </div>
                )}
                <div className="text-center p-4 rounded-lg border border-gold/20 bg-gold/5 min-w-25">
                  <div className="text-gold/80 text-sm mb-1 flex items-center justify-center gap-1">
                    <Crown className="h-3 w-3" /> Best
                  </div>
                  <div className="font-bold text-lg text-gold">{highScore}</div>
                </div>
              </div>

              <div className="text-center max-w-sm mx-auto">
                <p className="text-lg">{getCompletionMessage(percentage)}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={restartQuiz}
                  className="flex-1 h-12 text-lg gap-2 bg-gold hover:bg-gold/90 text-black"
                >
                  <RefreshCw className="h-5 w-5" />
                  Play Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    handleShare(
                      quizState.score,
                      quizState.questions.length,
                      difficulty,
                    )
                  }
                  className="flex-1 h-12 text-lg gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-5 w-5" />
                      Share Results
                    </>
                  )}
                </Button>
              </div>
              <div className="text-center">
                <Link
                  href="/quiz"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to All Quizzes
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz In Progress
  if (quizStarted && quizState) {
    const currentQuestion = quizState.questions[quizState.currentIndex];
    const hasAnswered = quizState.answers.length > quizState.currentIndex;

    return (
      <div className="min-h-screen bg-linear-to-b from-background to-mythic">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <Breadcrumbs />

          <div className="mt-6 space-y-6">
            {/* Progress Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span
                  id="quiz-progress-label"
                  className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
                >
                  Question {quizState.currentIndex + 1} of{" "}
                  {quizState.questions.length}
                </span>
                <Progress
                  value={
                    (quizState.currentIndex / quizState.questions.length) * 100
                  }
                  className="h-1.5 w-32"
                  aria-labelledby="quiz-progress-label"
                />
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="capitalize">
                  {difficulty}
                </Badge>
                <output
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium"
                  aria-label={`Current score: ${quizState.score} correct answers`}
                >
                  <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{quizState.score}</span>
                </output>
              </div>
            </div>

            {/* Question Card */}
            <RelationshipQuizCard
              question={currentQuestion}
              questionNumber={quizState.currentIndex + 1}
              totalQuestions={quizState.questions.length}
              onAnswer={handleAnswer}
              showTimer={useTimer}
              timeLimit={TIME_LIMITS[difficulty]}
              onTimeUp={handleTimeUp}
            />

            {/* Next Button */}
            {hasAnswered && (
              <div className="flex justify-end">
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="gap-2 text-lg font-semibold bg-primary hover:bg-primary/90"
                >
                  {quizState.currentIndex < quizState.questions.length - 1 ? (
                    <>
                      Next Question <ArrowRight className="h-5 w-5" />
                    </>
                  ) : (
                    <>
                      See Results <Trophy className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quiz Setup Screen
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-mythic">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Breadcrumbs />

        <div className="text-center mb-12 mt-6">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-xl border border-gold/20 bg-gold/5 backdrop-blur-sm">
              <Users className="h-10 w-10 text-gold" />
            </div>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Divine Relationships Quiz
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Test your knowledge of divine family ties, marriages, and
            connections across pantheons
          </p>
        </div>

        <section className="mx-auto mb-8 max-w-3xl rounded-2xl border border-border/60 bg-card/60 p-6">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            Study Mythology As A Web Of Relationships
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            This quiz is designed for the part of mythology that pure symbol
            recall cannot capture: who is related to whom, which marriages bind
            divine houses together, and where rivalries, siblings, and parentage
            change the meaning of a story.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Use it after browsing the{" "}
            <Link
              href="/family-tree"
              className="text-gold underline hover:text-gold/80"
            >
              family tree
            </Link>{" "}
            or a set of deity pages. The questions work best when you are
            testing structure, not just isolated facts, and they are a useful
            bridge between visual genealogy and narrative reading.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            If you want a wider practice loop, pair this route with the{" "}
            <Link
              href="/quiz/quick"
              className="text-gold underline hover:text-gold/80"
            >
              quick quiz
            </Link>{" "}
            for speed and the{" "}
            <Link
              href="/games/memory"
              className="text-gold underline hover:text-gold/80"
            >
              symbol memory game
            </Link>{" "}
            for recognition before returning here for relationship depth.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            That makes this page useful for more than trivia. It trains the
            connective tissue of mythology, which is often the difference
            between recognizing a name and actually understanding how a story or
            pantheon structure fits together.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            It is also one of the fastest ways to spot where your mental model
            breaks. If parentage, marriage, and sibling questions keep blurring
            together, the issue is usually not one missed fact but an unclear
            internal map of the pantheon itself.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Once that structure improves, story pages become easier to follow
            because motivations, rivalries, inheritances, and alliances stop
            feeling like isolated details. The quiz is useful precisely because
            it turns those hidden gaps into something you can measure quickly.
          </p>
        </section>

        <Card className="max-w-xl mx-auto border-gold/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center gap-2">
              <Target className="h-5 w-5 text-gold" />
              Quiz Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Difficulty Selection */}
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="difficulty-select"
              >
                Difficulty
              </label>
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v as Difficulty)}
              >
                <SelectTrigger id="difficulty-select" className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">
                    Easy (+{XP_REWARDS.easy} XP/correct)
                  </SelectItem>
                  <SelectItem value="medium">
                    Medium (+{XP_REWARDS.medium} XP/correct)
                  </SelectItem>
                  <SelectItem value="hard">
                    Hard (+{XP_REWARDS.hard} XP/correct)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {difficulty === "easy" &&
                  "More domain questions, basic relationships"}
                {difficulty === "medium" &&
                  "Balanced mix of relationships and domains"}
                {difficulty === "hard" &&
                  "Complex relationships, less domain questions"}
              </p>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="question-count-select"
              >
                Number of Questions
              </label>
              <Select
                value={questionCount.toString()}
                onValueChange={(v) => setQuestionCount(Number.parseInt(v))}
              >
                <SelectTrigger id="question-count-select" className="w-full">
                  <SelectValue placeholder="Select count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timer Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-3">
                <Timer className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Challenge Mode</p>
                  <p className="text-xs text-muted-foreground">
                    {TIME_LIMITS[difficulty]}s per question, +15% XP bonus
                  </p>
                </div>
              </div>
              <Button
                variant={useTimer ? "default" : "outline"}
                size="sm"
                onClick={() => setUseTimer(!useTimer)}
                className={useTimer ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                {useTimer ? "On" : "Off"}
              </Button>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-muted-foreground text-xs mb-1">
                  Your High Score
                </div>
                <div className="font-bold text-lg flex items-center justify-center gap-1">
                  <Crown className="h-4 w-4 text-gold" />
                  {highScore}
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-muted-foreground text-xs mb-1">
                  Total XP
                </div>
                <div className="font-bold text-lg flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 text-gold" />
                  {progress.totalXP}
                </div>
              </div>
            </div>

            <Button
              onClick={startQuiz}
              className="w-full h-12 text-lg gap-2 bg-gold hover:bg-gold/90 text-black font-semibold"
            >
              <Zap className="h-5 w-5" />
              Start Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Back to Quizzes Link */}
        <div className="text-center mt-6">
          <Link
            href="/quiz"
            className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to All Quizzes
          </Link>
        </div>
      </div>
    </div>
  );
}
