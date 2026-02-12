'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  X,
  ArrowRight,
  Crown,
  Baby,
  Users,
  Heart,
  Sparkles,
  ExternalLink,
  Timer
} from 'lucide-react';
import type { RelationshipQuestion, QuestionType } from '@/lib/relationship-quiz';

interface RelationshipQuizCardProps {
  question: RelationshipQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  showTimer?: boolean;
  timeLimit?: number;
  onTimeUp?: () => void;
}

function getQuestionTypeIcon(type: QuestionType) {
  const iconClass = 'h-5 w-5';
  switch (type) {
    case 'parent':
      return <Crown className={`${iconClass} text-amber-500`} />;
    case 'child':
      return <Baby className={`${iconClass} text-green-500`} />;
    case 'sibling':
      return <Users className={`${iconClass} text-blue-500`} />;
    case 'spouse':
      return <Heart className={`${iconClass} text-pink-500`} />;
    case 'domain':
      return <Sparkles className={`${iconClass} text-purple-500`} />;
    default:
      return <Users className={iconClass} />;
  }
}

function getQuestionTypeLabel(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    parent: 'Parent',
    child: 'Child',
    sibling: 'Sibling',
    spouse: 'Spouse',
    domain: 'Domain',
  };
  return labels[type];
}

export function RelationshipQuizCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  showTimer = false,
  timeLimit = 30,
  onTimeUp,
}: RelationshipQuizCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeRemaining(timeLimit);
  }, [question.id, timeLimit]);

  // Timer logic
  useEffect(() => {
    if (!showTimer || showResult || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeUp && !showResult) {
            handleTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showTimer, showResult, timeRemaining, onTimeUp]);

  const handleTimeUp = () => {
    if (!showResult) {
      setShowResult(true);
      onAnswer('', false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === question.correctAnswer;
    onAnswer(answer, isCorrect);
  };

  const isCorrect = selectedAnswer === question.correctAnswer;
  const timerPercentage = (timeRemaining / timeLimit) * 100;
  const timerColor = timerPercentage > 50 ? 'bg-green-500' :
                     timerPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <Card
      className="border-t-4 border-t-gold shadow-lg overflow-hidden"
      role="region"
      aria-label={`Question ${questionNumber} of ${totalQuestions}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="flex items-center gap-1.5">
            {getQuestionTypeIcon(question.questionType)}
            {getQuestionTypeLabel(question.questionType)}
          </Badge>

          {showTimer && (
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${timerColor}`}
                  style={{ width: `${timerPercentage}%` }}
                />
              </div>
              <span className={`text-sm font-mono ${timeRemaining <= 5 ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`}>
                {timeRemaining}s
              </span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-4">
          {question.deityImageUrl && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border shrink-0">
              <Image
                src={question.deityImageUrl}
                alt={question.deityName}
                fill
                className="object-cover"
              />
            </div>
          )}
          <CardTitle id={`question-${question.id}`} className="text-xl md:text-2xl leading-tight font-serif flex-1">
            {question.questionText}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div
          role="radiogroup"
          aria-label="Select your answer"
          aria-describedby={`question-${question.id}`}
          className="grid gap-3"
        >
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === question.correctAnswer;
            const showCorrect = showResult && isCorrectOption;
            const showIncorrect = showResult && isSelected && !isCorrectOption;

            return (
              <Button
                key={`${question.id}-option-${index}`}
                role="radio"
                aria-checked={isSelected}
                aria-disabled={showResult}
                variant={showCorrect ? 'default' : showIncorrect ? 'destructive' : 'outline'}
                className={`w-full justify-between items-center h-auto py-4 px-5 text-lg group transition-all duration-200
                  ${showCorrect ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' : ''}
                  ${showIncorrect ? 'bg-red-600 hover:bg-red-700 border-red-600 text-white' : ''}
                  ${!showResult && !isSelected ? 'hover:border-gold/50 hover:bg-gold/5' : ''}
                `}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
              >
                <span className="font-medium">{option}</span>
                {showCorrect && <Check className="h-5 w-5 shrink-0" aria-hidden="true" />}
                {showIncorrect && <X className="h-5 w-5 shrink-0" aria-hidden="true" />}
              </Button>
            );
          })}
        </div>

        {showResult && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`mt-6 p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 ${
              isCorrect || !selectedAnswer
                ? 'bg-muted/50 border-border'
                : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-1 rounded-full mt-0.5 ${isCorrect ? 'bg-green-500/20' : 'bg-gold/20'}`} aria-hidden="true">
                <ArrowRight className={`h-4 w-4 ${isCorrect ? 'text-green-500' : 'text-gold'}`} />
              </div>
              <div className="flex-1">
                <p className="text-secondary-foreground leading-relaxed">
                  <span className="sr-only">
                    {isCorrect ? 'Correct! ' : selectedAnswer ? 'Incorrect. ' : 'Time expired. '}
                  </span>
                  {isCorrect ? (
                    <span className="text-green-600 dark:text-green-400 font-medium">Correct! </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {selectedAnswer ? 'Incorrect. ' : "Time's up! "}
                      The answer is <strong>{question.correctAnswer}</strong>.
                    </span>
                  )}
                </p>

                {question.questionType !== 'domain' && (
                  <Link
                    href={`/deities/${question.correctDeityId}`}
                    className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
                  >
                    Learn more about {question.correctAnswer}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
