'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_DEITIES, GET_ALL_RELATIONSHIPS } from '@/lib/queries';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { RelationshipQuizCard } from '@/components/quiz/RelationshipQuizCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from 'lucide-react';
import {
  generateRelationshipQuiz,
  calculateQuizXP,
  TIME_LIMITS,
  XP_REWARDS,
  type RelationshipQuestion,
  type Difficulty,
  type Relationship,
} from '@/lib/relationship-quiz';
import { useProgress } from '@/hooks/use-progress';
import type { Deity } from '@/types/Entity';

interface QuizState {
  questions: RelationshipQuestion[];
  currentIndex: number;
  score: number;
  answers: { question: RelationshipQuestion; answer: string; isCorrect: boolean }[];
  isComplete: boolean;
}

export default function RelationshipQuizPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [useTimer, setUseTimer] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [highScore, setHighScore] = useState(0);

  const { recordQuizScore, unlockAchievement, progress } = useProgress();

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('mythos_relationship_quiz_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const { data, isLoading, error } = useQuery<{ deities: Deity[]; relationships: Relationship[] }>({
    queryKey: ['relationship-quiz-data'],
    queryFn: async () => {
      const [deitiesRes, relationshipsRes] = await Promise.all([
        graphqlClient.request<{ deities: Deity[] }>(GET_DEITIES),
        graphqlClient.request<{ allRelationships: Relationship[] }>(GET_ALL_RELATIONSHIPS),
      ]);
      return {
        deities: deitiesRes.deities,
        relationships: relationshipsRes.allRelationships,
      };
    },
  });

  const startQuiz = useCallback(() => {
    if (!data?.deities || !data?.relationships) return;

    const questions = generateRelationshipQuiz(
      data.deities,
      data.relationships,
      questionCount,
      difficulty
    );

    setQuizState({
      questions,
      currentIndex: 0,
      score: 0,
      answers: [],
      isComplete: false,
    });
    setQuizStarted(true);
  }, [data, questionCount, difficulty]);

  const handleAnswer = useCallback((answer: string, isCorrect: boolean) => {
    if (!quizState) return;

    const currentQuestion = quizState.questions[quizState.currentIndex];
    const newScore = isCorrect ? quizState.score + 1 : quizState.score;

    setQuizState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        score: newScore,
        answers: [...prev.answers, { question: currentQuestion, answer, isCorrect }],
      };
    });
  }, [quizState]);

  const handleNext = useCallback(() => {
    if (!quizState) return;

    const isLastQuestion = quizState.currentIndex >= quizState.questions.length - 1;

    if (isLastQuestion) {
      // Complete quiz
      const finalScore = quizState.score;
      const totalXP = calculateQuizXP(finalScore, quizState.questions.length, difficulty, useTimer);

      // Update high score
      if (finalScore > highScore) {
        setHighScore(finalScore);
        localStorage.setItem('mythos_relationship_quiz_highscore', finalScore.toString());
      }

      // Record quiz score
      const quizId = `relationship-${difficulty}-${Date.now()}`;
      recordQuizScore(quizId, Math.round((finalScore / quizState.questions.length) * 100));

      // Unlock achievements
      if (finalScore === quizState.questions.length) {
        unlockAchievement('perfect_relationship_quiz', totalXP);
      } else if (finalScore >= quizState.questions.length * 0.8) {
        unlockAchievement('relationship_expert', Math.floor(totalXP * 0.5));
      }

      if (useTimer) {
        unlockAchievement('speed_demon', 25);
      }

      setQuizState(prev => prev ? { ...prev, isComplete: true } : null);
    } else {
      setQuizState(prev => prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : null);
    }
  }, [quizState, difficulty, useTimer, highScore, recordQuizScore, unlockAchievement]);

  const handleTimeUp = useCallback(() => {
    handleAnswer('', false);
  }, [handleAnswer]);

  const restartQuiz = useCallback(() => {
    setQuizStarted(false);
    setQuizState(null);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-mythic">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
              <p className="text-muted-foreground">Gathering divine connections...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-mythic">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="p-6 text-center">
              <p className="text-destructive dark:text-red-400">Failed to load quiz data. Please try again.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz Complete Screen
  if (quizState?.isComplete) {
    const percentage = Math.round((quizState.score / quizState.questions.length) * 100);
    const totalXP = calculateQuizXP(quizState.score, quizState.questions.length, difficulty, useTimer);

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-mythic">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <Breadcrumbs />

          <Card className="max-w-2xl mx-auto mt-6 border-gold/20 shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="text-center pt-8">
              <div className="mx-auto mb-6 p-6 rounded-full bg-gradient-to-br from-gold/20 to-amber-500/10 w-fit ring-1 ring-gold/30 shadow-inner">
                <Trophy className="h-16 w-16 text-gold drop-shadow-md" />
              </div>
              <CardTitle className="text-3xl font-serif">Quiz Complete!</CardTitle>
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
                <div className="text-center p-4 rounded-lg bg-muted/50 min-w-[100px]">
                  <div className="text-muted-foreground text-sm mb-1">Difficulty</div>
                  <div className="font-bold text-lg capitalize">{difficulty}</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gold/10 border border-gold/20 min-w-[100px]">
                  <div className="text-gold/80 text-sm mb-1 flex items-center justify-center gap-1">
                    <Zap className="h-3 w-3" /> XP Earned
                  </div>
                  <div className="font-bold text-lg text-gold">+{totalXP}</div>
                </div>
                {useTimer && (
                  <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 min-w-[100px]">
                    <div className="text-purple-500/80 text-sm mb-1 flex items-center justify-center gap-1">
                      <Timer className="h-3 w-3" /> Challenge
                    </div>
                    <div className="font-bold text-lg text-purple-500">+15%</div>
                  </div>
                )}
                <div className="text-center p-4 rounded-lg bg-muted/50 border border-gold/20 bg-gold/5 min-w-[100px]">
                  <div className="text-gold/80 text-sm mb-1 flex items-center justify-center gap-1">
                    <Crown className="h-3 w-3" /> Best
                  </div>
                  <div className="font-bold text-lg text-gold">{highScore}</div>
                </div>
              </div>

              <div className="text-center max-w-sm mx-auto">
                {percentage === 100 ? (
                  <p className="text-lg">Perfect score! You have mastered the divine family tree!</p>
                ) : percentage >= 80 ? (
                  <p className="text-lg">Excellent! Your knowledge of divine relationships is impressive!</p>
                ) : percentage >= 60 ? (
                  <p className="text-lg">Well done! The gods recognize your dedication to learning.</p>
                ) : (
                  <p className="text-lg">Keep studying the divine lineages. The Muses will guide you.</p>
                )}
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

  // Quiz In Progress
  if (quizStarted && quizState) {
    const currentQuestion = quizState.questions[quizState.currentIndex];
    const hasAnswered = quizState.answers.length > quizState.currentIndex;

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-mythic">
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
                  Question {quizState.currentIndex + 1} of {quizState.questions.length}
                </span>
                <Progress
                  value={(quizState.currentIndex / quizState.questions.length) * 100}
                  className="h-1.5 w-32"
                  aria-labelledby="quiz-progress-label"
                />
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="capitalize">
                  {difficulty}
                </Badge>
                <div
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium"
                  role="status"
                  aria-label={`Current score: ${quizState.score} correct answers`}
                >
                  <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{quizState.score}</span>
                </div>
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
                    <>Next Question <ArrowRight className="h-5 w-5" /></>
                  ) : (
                    <>See Results <Trophy className="h-5 w-5" /></>
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
    <div className="min-h-screen bg-gradient-to-b from-background to-mythic">
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
            Test your knowledge of divine family ties, marriages, and connections across pantheons
          </p>
        </div>

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
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                <SelectTrigger className="w-full">
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
                {difficulty === 'easy' && 'More domain questions, basic relationships'}
                {difficulty === 'medium' && 'Balanced mix of relationships and domains'}
                {difficulty === 'hard' && 'Complex relationships, less domain questions'}
              </p>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Questions</label>
              <Select value={questionCount.toString()} onValueChange={(v) => setQuestionCount(parseInt(v))}>
                <SelectTrigger className="w-full">
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
                variant={useTimer ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUseTimer(!useTimer)}
                className={useTimer ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                {useTimer ? 'On' : 'Off'}
              </Button>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-muted-foreground text-xs mb-1">Your High Score</div>
                <div className="font-bold text-lg flex items-center justify-center gap-1">
                  <Crown className="h-4 w-4 text-gold" />
                  {highScore}
                </div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-muted-foreground text-xs mb-1">Total XP</div>
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
