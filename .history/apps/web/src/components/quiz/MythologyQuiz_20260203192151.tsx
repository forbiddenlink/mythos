'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_DEITIES } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, RefreshCw, ArrowRight, Check, X, Sparkles } from 'lucide-react';

interface Deity {
  id: string;
  name: string;
  domain: string[];
  symbols: string[];
  pantheonId: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export function MythologyQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const { data, isLoading } = useQuery<{ deities: Deity[] }>({
    queryKey: ['deities-quiz'],
    queryFn: async () => graphqlClient.request(GET_DEITIES),
  });

  if (isLoading || !data?.deities) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading quiz...</div>
      </div>
    );
  }

  const deities = data.deities;

  // Generate quiz questions dynamically from deity data
  const generateQuestions = (): Question[] => {
    const questions: Question[] = [];
    const usedDeities = new Set<string>();

    // Question 1: Match deity to domain
    const deityForDomain = deities.find(d => d.domain.length > 0 && !usedDeities.has(d.id));
    if (deityForDomain) {
      usedDeities.add(deityForDomain.id);
      const otherDeities = deities.filter(d => d.id !== deityForDomain.id).slice(0, 3);
      questions.push({
        id: 1,
        question: `Which deity is associated with ${deityForDomain.domain[0]}?`,
        options: [deityForDomain.name, ...otherDeities.map(d => d.name)].sort(() => Math.random() - 0.5),
        correctAnswer: deityForDomain.name,
        explanation: `${deityForDomain.name} is the deity of ${deityForDomain.domain.join(', ')}.`,
      });
    }

    // Question 2: Symbol matching
    const deityWithSymbol = deities.find(d => d.symbols.length > 0 && !usedDeities.has(d.id));
    if (deityWithSymbol) {
      usedDeities.add(deityWithSymbol.id);
      const otherDeities = deities.filter(d => d.id !== deityWithSymbol.id).slice(0, 3);
      questions.push({
        id: 2,
        question: `Which deity is symbolized by ${deityWithSymbol.symbols[0]}?`,
        options: [deityWithSymbol.name, ...otherDeities.map(d => d.name)].sort(() => Math.random() - 0.5),
        correctAnswer: deityWithSymbol.name,
        explanation: `${deityWithSymbol.name}'s symbols include ${deityWithSymbol.symbols.join(', ')}.`,
      });
    }

    // Question 3: Domain matching
    const warDeity = deities.find(d => d.domain.some(dom => dom.toLowerCase().includes('war')) && !usedDeities.has(d.id));
    if (warDeity) {
      usedDeities.add(warDeity.id);
      const otherDeities = deities.filter(d => d.id !== warDeity.id).slice(0, 3);
      questions.push({
        id: 3,
        question: 'Which deity is associated with war and battle?',
        options: [warDeity.name, ...otherDeities.map(d => d.name)].sort(() => Math.random() - 0.5),
        correctAnswer: warDeity.name,
        explanation: `${warDeity.name} is known as a deity of war.`,
      });
    }

    return questions.slice(0, 5); // Limit to 5 questions
  };

  const questions = generateQuestions();

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Not enough data to generate quiz questions.</p>
      </div>
    );
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);

    if (answer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
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
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizCompleted(false);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-gold/10 w-fit">
            <Trophy className="h-12 w-12 text-gold" />
          </div>
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gold mb-2">
              {score}/{questions.length}
            </div>
            <div className="text-lg text-muted-foreground">
              {percentage}% correct
            </div>
          </div>

          <div className="text-center">
            {percentage >= 80 ? (
              <p className="text-lg">🎉 Excellent! You're a mythology expert!</p>
            ) : percentage >= 60 ? (
              <p className="text-lg">👏 Good job! Keep learning about mythology!</p>
            ) : (
              <p className="text-lg">📚 Keep exploring to improve your knowledge!</p>
            )}
          </div>

          <Button onClick={restartQuiz} className="w-full gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gold/10 border border-gold/20 shrink-0">
              <Sparkles className="h-5 w-5 text-gold" />
            </div>
            <CardTitle className="text-xl">{question.question}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === question.correctAnswer;
            const showCorrect = showResult && isCorrect;
            const showIncorrect = showResult && isSelected && !isCorrect;

            return (
              <Button
                key={index}
                variant={showCorrect ? 'default' : showIncorrect ? 'destructive' : 'outline'}
                className={`w-full justify-start text-left h-auto py-3 px-4 ${
                  showCorrect ? 'bg-green-600 hover:bg-green-700 border-green-600' : ''
                } ${showIncorrect ? 'bg-red-600 hover:bg-red-700 border-red-600' : ''}`}
                onClick={() => !showResult && handleAnswerSelect(option)}
                disabled={showResult}
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="flex-1">{option}</span>
                  {showCorrect && <Check className="h-4 w-4" />}
                  {showIncorrect && <X className="h-4 w-4" />}
                </div>
              </Button>
            );
          })}

          {showResult && (
            <div className="mt-4 p-4 rounded-lg bg-muted">
              <p className="text-sm">{question.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showResult && (
        <Button onClick={handleNext} className="w-full gap-2">
          {currentQuestion < questions.length - 1 ? (
            <>
              Next Question
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              See Results
              <Trophy className="h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
