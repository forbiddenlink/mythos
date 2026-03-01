'use client';

import { useState, useEffect, useCallback, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_DEITIES } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Timer, Trophy, RefreshCw, Zap, Check, X, Share2 } from 'lucide-react';
import Link from 'next/link';
import { ProgressContext } from '@/providers/progress-provider';
import { useAchievements } from '@/hooks/useAchievements';

interface Deity {
  id: string;
  name: string;
  domain: string[];
  pantheonId: string;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  deityName: string;
}

function generateQuestion(deities: Deity[]): Question {
  const target = deities[Math.floor(Math.random() * deities.length)];
  const domain = target.domain[Math.floor(Math.random() * target.domain.length)];
  const wrongAnswers = deities
    .filter(d => d.id !== target.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(d => d.name);

  return {
    question: `Which deity is associated with "${domain}"?`,
    options: [target.name, ...wrongAnswers].sort(() => Math.random() - 0.5),
    correctAnswer: target.name,
    deityName: target.name,
  };
}

export default function QuickQuizPage() {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const progressContext = useContext(ProgressContext);
  const { checkAchievements } = useAchievements();

  const { data, isLoading } = useQuery<{ deities: Deity[] }>({
    queryKey: ['quick-quiz-deities'],
    queryFn: async () => graphqlClient.request(GET_DEITIES),
  });

  // Load high score from progress context or localStorage
  useEffect(() => {
    if (progressContext?.progress.quickQuizHighScore) {
      setHighScore(progressContext.progress.quickQuizHighScore);
    } else {
      const saved = localStorage.getItem('mythos_quick_quiz_highscore');
      if (saved) setHighScore(parseInt(saved));
    }
  }, [progressContext?.progress.quickQuizHighScore]);

  const nextQuestion = useCallback(() => {
    if (data?.deities) {
      setQuestion(generateQuestion(data.deities));
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [data?.deities]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setTimeLeft(60);
    setScore(0);
    nextQuestion();
  }, [nextQuestion]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      setGameState('finished');
      if (score > highScore) {
        setHighScore(score);
        setIsNewHighScore(true);
        localStorage.setItem('mythos_quick_quiz_highscore', score.toString());
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

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft, score, highScore, progressContext, checkAchievements]);

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);

    if (answer === question?.correctAnswer) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      nextQuestion();
    }, 800);
  };

  const handleShare = async () => {
    const shareText = `I scored ${score} in the Mythos Atlas Quick Quiz! Can you beat my score?`;
    const shareUrl = `${window.location.origin}/quiz/quick`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mythos Atlas Quick Quiz',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      const fullText = `${shareText}\n${shareUrl}`;
      await navigator.clipboard.writeText(fullText);
      alert('Score copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-mythic">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-xl border border-gold/20 bg-gold/5">
              <Zap className="h-10 w-10 text-gold" />
            </div>
          </div>
          <h1 className="font-serif text-4xl font-bold mb-2">Quick Quiz</h1>
          <p className="text-muted-foreground">60 seconds. How many can you get?</p>
        </div>

        {gameState === 'ready' && (
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Ready to Race?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Answer as many mythology questions as you can in 60 seconds!
              </p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-gold" />
                  <span>60 seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-gold" />
                  <span>High Score: {highScore}</span>
                </div>
              </div>
              <Button onClick={startGame} size="lg" className="gap-2">
                <Zap className="h-5 w-5" />
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        )}

        {gameState === 'playing' && question && (
          <div className="space-y-6">
            {/* Timer and Score */}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={`text-lg px-4 py-2 ${timeLeft <= 10 ? 'border-destructive text-destructive animate-pulse' : 'border-gold text-gold'}`}>
                <Timer className="h-4 w-4 mr-2" />
                {timeLeft}s
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Trophy className="h-4 w-4 mr-2" />
                {score}
              </Badge>
            </div>

            <Progress value={(timeLeft / 60) * 100} className="h-2" />

            {/* Question */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl text-center">
                  {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {question.options.map((option) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === question.correctAnswer;
                    const showFeedback = showResult && (isSelected || isCorrect);

                    return (
                      <Button
                        key={option}
                        variant="outline"
                        className={`h-auto py-4 px-4 text-left justify-start ${
                          showFeedback
                            ? isCorrect
                              ? 'border-green-500 bg-green-500/10 text-green-700'
                              : isSelected
                              ? 'border-destructive bg-destructive/10 text-destructive'
                              : ''
                            : 'hover:border-gold/50'
                        }`}
                        onClick={() => handleAnswer(option)}
                        disabled={showResult}
                      >
                        {showFeedback && (
                          <span className="mr-2">
                            {isCorrect ? <Check className="h-4 w-4" /> : isSelected ? <X className="h-4 w-4" /> : null}
                          </span>
                        )}
                        {option}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === 'finished' && (
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="font-serif text-3xl">Time&apos;s Up!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="py-8">
                <div className="text-6xl font-bold text-gold mb-2">{score}</div>
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
                <Button variant="outline" onClick={handleShare} className="gap-2">
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
    </div>
  );
}
