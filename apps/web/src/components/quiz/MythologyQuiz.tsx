"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, RefreshCw, ArrowRight, Check, X, Crown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ShareButton } from "@/components/sharing/ShareButton";
import { QuizRetentionSurvey } from "@/components/quiz/QuizRetentionSurvey";
import { SupportNudge } from "@/components/support/SupportNudge";
import { trackEvent } from "@/lib/analytics/events";
import { quizResultPath } from "@/lib/quiz-share";
import { useProgress } from "@/hooks/use-progress";
import { quizLearnMore } from "@/lib/quiz-learn-more";
type SourceHint = Array<{ source?: string; text?: string }>;

/**
 * Everything the quiz draws questions from, projected on the server: names,
 * images, domains/symbols and at most one source citation per entry.
 */
export interface MythologyQuizPool {
  deities: Array<QuizPoolDeity>;
  relationships: Array<{
    id: string;
    fromDeityId: string;
    toDeityId: string;
    relationshipType: string;
  }>;
  creatures: Array<{
    id: string;
    name: string;
    slug: string;
    habitat: string;
    imageUrl?: string | null;
    primarySources?: SourceHint;
  }>;
  artifacts: Array<{
    id: string;
    name: string;
    slug: string;
    type: string;
    imageUrl?: string | null;
    primarySources?: SourceHint;
  }>;
  locations: Array<{
    id: string;
    name: string;
    imageUrl?: string | null;
    primarySources?: SourceHint;
  }>;
}

export interface QuizPoolDeity {
  id: string;
  name: string;
  slug: string;
  domain: string[];
  symbols: string[];
  pantheonId: string;
  imageUrl?: string;
  gender: string;
  primarySources?: SourceHint;
}

type Deity = QuizPoolDeity;

interface Relationship {
  id: string;
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
}

interface Question {
  id: number;
  type: "text" | "visual" | "relationship";
  question: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  learnMoreHref: string;
  learnMoreLabel: string;
  sourceCite?: string;
}

export function MythologyQuiz({ pool }: { pool: MythologyQuizPool }) {
  const { recordQuizScore, trackQuizCompletion } = useProgress();
  const recordedCompletion = useRef(false);
  const startedQuiz = useRef(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem("mythos_quiz_highscore");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate high score from localStorage
    if (saved) setHighScore(Number.parseInt(saved));
  }, []);

  useEffect(() => {
    if (!quizCompleted || recordedCompletion.current) return;
    recordedCompletion.current = true;
    recordQuizScore("mythology-quiz", score);
    trackQuizCompletion(score);
    trackEvent("quiz_completed", {
      quizId: "mythology-quiz",
      score,
      total: questions.length,
    });
  }, [
    quizCompleted,
    score,
    questions.length,
    recordQuizScore,
    trackQuizCompletion,
  ]);

  const deities: Deity[] = pool.deities;
  const relationships: Relationship[] = pool.relationships;

  // Generate Questions
  useEffect(() => {
    const newQuestions: Question[] = [];
    const usedIds = new Set<string>();

    const getRandomDeities = (count: number, excludeId: string) =>
      deities
        .filter((d) => d.id !== excludeId)
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

    // 1. Visual Questions (Randomly select among Deity, Creature, Artifact, or Location)
    const visualPool = ["deity", "creature", "artifact", "location"];
    const chosenCategory =
      visualPool[Math.floor(Math.random() * visualPool.length)];

    if (chosenCategory === "creature") {
      const creatures = pool.creatures;
      const valid = creatures.filter((c) => Boolean(c.imageUrl));
      if (valid.length > 0) {
        const target = valid[Math.floor(Math.random() * valid.length)];
        usedIds.add(target.id + "_visual");
        const others = creatures
          .filter((c) => c.id !== target.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        newQuestions.push({
          id: 1,
          type: "visual",
          question: "Which mythical beast or creature is depicted here?",
          imageUrl: target.imageUrl || undefined,
          options: [target.name, ...others.map((o) => o.name)].sort(
            () => Math.random() - 0.5,
          ),
          correctAnswer: target.name,
          explanation: `This is ${target.name}, legendary creature of ${target.habitat}.`,
          ...quizLearnMore(target, "creatures"),
        });
      }
    } else if (chosenCategory === "artifact") {
      const artifacts = pool.artifacts;
      const valid = artifacts.filter((a) => Boolean(a.imageUrl));
      if (valid.length > 0) {
        const target = valid[Math.floor(Math.random() * valid.length)];
        usedIds.add(target.id + "_visual");
        const others = artifacts
          .filter((a) => a.id !== target.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        newQuestions.push({
          id: 1,
          type: "visual",
          question: "Which legendary relic or artifact is shown here?",
          imageUrl: target.imageUrl || undefined,
          options: [target.name, ...others.map((o) => o.name)].sort(
            () => Math.random() - 0.5,
          ),
          correctAnswer: target.name,
          explanation: `This is ${target.name}, legendary ${target.type}.`,
          ...quizLearnMore(target, "artifacts"),
        });
      }
    } else if (chosenCategory === "location") {
      const locations = pool.locations;
      const valid = locations.filter((l) => Boolean(l.imageUrl));
      if (valid.length > 0) {
        const target = valid[Math.floor(Math.random() * valid.length)];
        usedIds.add(target.id + "_visual");
        const others = locations
          .filter((l) => l.id !== target.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        newQuestions.push({
          id: 1,
          type: "visual",
          question: "Which sacred site or mythical realm is depicted here?",
          imageUrl: target.imageUrl || undefined,
          options: [target.name, ...others.map((o) => o.name)].sort(
            () => Math.random() - 0.5,
          ),
          correctAnswer: target.name,
          explanation: `This is ${target.name}, sacred location in world mythology.`,
          ...quizLearnMore(
            {
              slug: target.id,
              name: target.name,
              primarySources: target.primarySources,
            },
            "locations",
          ),
        });
      }
    } else {
      const visualDeities = deities.filter(
        (d) => d.imageUrl && !d.imageUrl.includes("unsplash"),
      );
      if (visualDeities.length > 0) {
        const target =
          visualDeities[Math.floor(Math.random() * visualDeities.length)];
        usedIds.add(target.id + "_visual");
        newQuestions.push({
          id: 1,
          type: "visual",
          question: "Which deity is depicted in this image?",
          imageUrl: target.imageUrl,
          options: [
            target.name,
            ...getRandomDeities(3, target.id).map((d) => d.name),
          ].sort(() => Math.random() - 0.5),
          correctAnswer: target.name,
          explanation: `This is ${target.name}, the deity of ${target.domain.join(", ")}.`,
          ...quizLearnMore(target, "deities"),
        });
      }
    }

    // 2. Relationship Questions
    const validRelTypes = new Set(["parent_of", "sibling_of", "spouse_of"]);
    const rels = relationships.filter((r) =>
      validRelTypes.has(r.relationshipType),
    );
    if (rels.length > 0) {
      const rel = rels[Math.floor(Math.random() * rels.length)];
      const fromDeity = deities.find((d) => d.id === rel.fromDeityId);
      const toDeity = deities.find((d) => d.id === rel.toDeityId);

      if (fromDeity && toDeity) {
        usedIds.add(rel.id);
        const relLabel = rel.relationshipType.replace("_", " "); // "parent of"
        newQuestions.push({
          id: 2,
          type: "relationship",
          question: `Who is the ${relLabel.split(" ")[0]} of ${toDeity.name}?`, // Who is the parent of Ares?
          options: [
            fromDeity.name,
            ...getRandomDeities(3, fromDeity.id).map((d) => d.name),
          ].sort(() => Math.random() - 0.5),
          correctAnswer: fromDeity.name,
          explanation: `${fromDeity.name} is the ${relLabel} ${toDeity.name}.`,
          ...quizLearnMore(fromDeity),
        });
      }
    }

    // 3. Domain/Symbol Questions (Fill remaining slots to reach 5)
    while (newQuestions.length < 5) {
      const target = deities[Math.floor(Math.random() * deities.length)];
      if (usedIds.has(target.id + "_domain")) continue;

      if (Math.random() > 0.5 && target.domain.length > 0) {
        usedIds.add(target.id + "_domain");
        newQuestions.push({
          id: newQuestions.length + 1,
          type: "text",
          question: `Which deity is associated with ${target.domain[0]}?`,
          options: [
            target.name,
            ...getRandomDeities(3, target.id).map((d) => d.name),
          ].sort(() => Math.random() - 0.5),
          correctAnswer: target.name,
          explanation: `${target.name} is the deity of ${target.domain.join(", ")}.`,
          ...quizLearnMore(target),
        });
      } else if (target.symbols.length > 0) {
        usedIds.add(target.id + "_symbol");
        newQuestions.push({
          id: newQuestions.length + 1,
          type: "text",
          question: `Which deity is symbolized by ${target.symbols[0]}?`,
          options: [
            target.name,
            ...getRandomDeities(3, target.id).map((d) => d.name),
          ].sort(() => Math.random() - 0.5),
          correctAnswer: target.name,
          explanation: `${target.name}'s symbols include ${target.symbols.join(", ")}.`,
          ...quizLearnMore(target),
        });
      }
    }

    const shuffled = newQuestions.toSorted(() => Math.random() - 0.5); // Shuffle order
    // eslint-disable-next-line react-hooks/set-state-in-effect -- generate questions when data loads
    setQuestions(shuffled);
  }, [deities, relationships, pool]);

  const handleAnswerSelect = (answer: string) => {
    // Counted on the first answer rather than on mount, so a visitor who
    // opens the quiz and leaves does not inflate the start of the funnel.
    if (!startedQuiz.current) {
      startedQuiz.current = true;
      trackEvent("quiz_started", { quizId: "mythology-quiz" });
    }
    setSelectedAnswer(answer);
    setShowResult(true);

    if (answer === questions[currentQuestion].correctAnswer) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem("mythos_quiz_highscore", newScore.toString());
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const restartQuiz = () => {
    // Force re-generation of questions by invalidating query or just simple state reset?
    // For simplicity, just reset state. To get new questions we'd need to re-run the effect.
    // We can just refetch queries or manual logic.
    // Let's just reload the page or trigger state update.
    globalThis.location.reload();
  };

  if (questions.length === 0) return <QuizSkeleton />;

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);

    let resultMessage: ReactNode;
    if (percentage >= 80) {
      resultMessage = (
        <p className="text-lg text-gold-text font-serif">
          Radiant divine wisdom! You rival Athena herself!
        </p>
      );
    } else if (percentage >= 60) {
      resultMessage = (
        <p className="text-lg text-foreground font-serif">
          A worthy effort! Make an offering to the Muses and try again.
        </p>
      );
    } else {
      resultMessage = (
        <p className="text-lg text-muted-foreground font-serif">
          The library of Alexandria awaits your return to study.
        </p>
      );
    }

    return (
      <Card className="max-w-2xl mx-auto border-gold/20 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-linear-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
        <CardHeader className="text-center pt-8">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
            <Trophy className="size-8 text-gold-text" aria-hidden="true" />
          </div>
          <CardTitle className="text-3xl font-serif">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pb-8">
          <div className="text-center">
            <div className="mb-2 font-serif text-6xl font-semibold tabular-nums tracking-tight text-gold-text">
              {score}/{questions.length}
            </div>
            <p className="text-lg text-muted-foreground font-medium">
              {percentage}% Mastery
            </p>
          </div>

          <div className="flex justify-center gap-8 text-sm">
            <div className="text-center p-3 rounded-lg bg-muted/50 w-24">
              <div className="text-muted-foreground mb-1">Score</div>
              <div className="font-bold text-lg">{score * 100}</div>
            </div>
            <div className="text-center p-3 rounded-lg w-24 border border-gold/20 bg-gold/5">
              <div className="text-gold-text mb-1 flex items-center justify-center gap-1">
                <Crown className="h-3 w-3" /> Best
              </div>
              <div className="font-bold text-lg text-gold-text">
                {highScore * 100}
              </div>
            </div>
          </div>

          <div className="text-center max-w-sm mx-auto">{resultMessage}</div>

          <QuizRetentionSurvey score={score} total={questions.length} />

          <SupportNudge moment="quiz_completed" placement="quiz_results" />

          <div className="flex flex-col sm:flex-row gap-3">
            {/* The score lives in the path so the Open Graph card can render
                it; a shared /quiz link carries no score at all. */}
            <ShareButton
              surface="quiz_results"
              title="Mythos Atlas Quiz Results"
              text={`I scored ${score}/${questions.length} (${percentage}%) on the Mythos Atlas mythology quiz! Can you beat my score?`}
              url={`https://mythosatlas.com${quizResultPath(score, questions.length)}`}
              className="flex-1 [&_button]:w-full [&_button]:h-12 [&_button]:text-lg"
            />
            <Button
              onClick={restartQuiz}
              className="flex-1 h-12 text-lg gap-2 bg-gold hover:bg-gold/90 text-black"
            >
              <RefreshCw className="h-5 w-5" />
              Challenge Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  let questionTypeLabel: string;
  if (question.type === "visual") {
    questionTypeLabel = "Visual ID";
  } else if (question.type === "relationship") {
    questionTypeLabel = "Relationship";
  } else {
    questionTypeLabel = "Knowledge";
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span
            id="quiz-progress-label"
            className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
          >
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <Progress
            value={(currentQuestion / questions.length) * 100}
            className="h-1.5 w-32"
            aria-labelledby="quiz-progress-label"
            aria-valuenow={currentQuestion + 1}
            aria-valuemin={1}
            aria-valuemax={questions.length}
          />
        </div>
        <output
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold-text text-sm font-medium"
          aria-label={`Current score: ${score} correct answers`}
        >
          <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{score}</span>
        </output>
      </div>

      <Card
        className="border-t-4 border-t-gold shadow-lg overflow-hidden"
        role="region"
        aria-label={`Quiz question ${currentQuestion + 1} of ${questions.length}`}
      >
        <CardHeader className="pb-2">
          <p className="type-eyebrow">{questionTypeLabel}</p>
          <CardTitle
            id="quiz-question"
            className="mt-2 font-serif text-xl leading-snug md:text-2xl"
          >
            {question.question}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {question.imageUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border shadow-inner bg-black/5">
              <Image
                src={question.imageUrl}
                alt="Identify this deity"
                fill
                className="object-contain"
              />
            </div>
          )}

          <div
            role="group"
            aria-label="Select your answer"
            aria-describedby="quiz-question"
            className="grid gap-3"
          >
            {question.options.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === question.correctAnswer;
              const showCorrect = showResult && isCorrect;
              const showIncorrect = showResult && isSelected && !isCorrect;

              let buttonVariant: "default" | "destructive" | "outline" =
                "outline";
              if (showCorrect) buttonVariant = "default";
              else if (showIncorrect) buttonVariant = "destructive";

              return (
                <Button
                  key={option}
                  type="button"
                  aria-pressed={isSelected}
                  aria-disabled={showResult}
                  variant={buttonVariant}
                  className={`w-full justify-between items-center h-auto py-4 px-5 text-lg group transition-all duration-200 ${
                    showCorrect
                      ? "bg-green-600 hover:bg-green-700 border-green-600 text-white"
                      : ""
                  } ${showIncorrect ? "bg-red-600 hover:bg-red-700 border-red-600 text-white" : ""} ${
                    !showResult && !isSelected
                      ? "hover:border-gold/50 hover:bg-gold/5"
                      : ""
                  }`}
                  onClick={() => !showResult && handleAnswerSelect(option)}
                  disabled={showResult}
                >
                  <span className="font-medium">{option}</span>
                  {showCorrect && (
                    <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
                  )}
                  {showIncorrect && (
                    <X className="h-5 w-5 shrink-0" aria-hidden="true" />
                  )}
                </Button>
              );
            })}
          </div>

          {showResult && (
            <output
              aria-live="polite"
              aria-atomic="true"
              className="mt-6 p-4 rounded-xl bg-muted/50 border border-border animate-in fade-in slide-in-from-top-2 block"
            >
              <div className="flex items-start gap-3">
                <div
                  className="p-1 rounded-full bg-gold/20 mt-0.5"
                  aria-hidden="true"
                >
                  <ArrowRight className="h-4 w-4 text-gold" />
                </div>
                <p className="text-secondary-foreground leading-relaxed">
                  <span className="sr-only">
                    {selectedAnswer === question.correctAnswer
                      ? "Correct! "
                      : "Incorrect. "}
                  </span>
                  {question.explanation}
                </p>
              </div>
              <p className="mt-3 pl-10">
                <Link
                  href={question.learnMoreHref}
                  className="text-gold-text underline underline-offset-4 hover:decoration-current"
                >
                  {question.learnMoreLabel}
                </Link>
                {question.sourceCite ? (
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Source: {question.sourceCite}
                  </span>
                ) : null}
              </p>
            </output>
          )}
        </CardContent>

        {showResult && (
          <CardFooter className="bg-muted/30 pt-4 pb-6">
            <Button
              onClick={handleNext}
              size="lg"
              className="w-full gap-2 text-lg font-semibold bg-primary hover:bg-primary/90"
            >
              {currentQuestion < questions.length - 1 ? (
                <>
                  Next Question <ArrowRight className="h-5 w-5" />
                </>
              ) : (
                <>
                  See Results <Trophy className="h-5 w-5" />
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

/**
 * Server-rendered stand-in: the questions are drawn at random on the client,
 * so the static HTML shows the quiz frame (same size, no answers) instead of
 * an empty gap until hydration.
 */
function QuizSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Five questions
          </span>
          <div className="h-1.5 w-32 rounded-full bg-muted" />
        </div>
      </div>
      <Card className="overflow-hidden border-t-4 border-t-gold shadow-lg">
        <CardHeader className="pb-2">
          <p className="type-eyebrow">Knowledge</p>
          <p
            role="status"
            className="mt-2 font-serif text-xl leading-snug md:text-2xl"
          >
            Drawing your questions from the atlas…
          </p>
        </CardHeader>
        <CardContent className="space-y-3 pt-4" aria-hidden="true">
          {[0, 1, 2, 3].map((row) => (
            <div
              key={row}
              className="h-15 rounded-md border border-border bg-muted/40 motion-safe:animate-pulse"
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
