'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_DEITIES, GET_ALL_RELATIONSHIPS } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, RefreshCw, ArrowRight, Check, X, Sparkles, Image as ImageIcon, Users, Crown } from 'lucide-react';
import Image from 'next/image';

interface Deity {
  id: string;
  name: string;
  domain: string[];
  symbols: string[];
  pantheonId: string;
  imageUrl?: string;
  gender: string;
}

interface Relationship {
  id: string;
  fromDeityId: string;
  toDeityId: string;
  relationshipType: string;
}

interface Question {
  id: number;
  type: 'text' | 'visual' | 'relationship';
  question: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export function MythologyQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('mythos_quiz_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const { data, isLoading } = useQuery<{ deities: Deity[], relationships: Relationship[] }>({
    queryKey: ['quiz-data-v2'],
    queryFn: async () => {
      const [deitiesRes, relationshipsRes] = await Promise.all([
        graphqlClient.request<{ deities: Deity[] }>(GET_DEITIES),
        graphqlClient.request<{ allRelationships: Relationship[] }>(GET_ALL_RELATIONSHIPS)
      ]);
      return {
        deities: deitiesRes.deities,
        relationships: relationshipsRes.allRelationships
      };
    },
  });

  // Generate Questions
  useEffect(() => {
    if (!data?.deities || !data?.relationships) return;

    const { deities, relationships } = data;
    const newQuestions: Question[] = [];
    const usedIds = new Set<string>();

    const getRandomDeities = (count: number, excludeId: string) =>
      deities.filter(d => d.id !== excludeId).sort(() => Math.random() - 0.5).slice(0, count);

    // 1. Visual Questions (Identify Deity)
    const visualDeities = deities.filter(d => d.imageUrl && !d.imageUrl.includes('unsplash'));
    if (visualDeities.length > 0) {
      const target = visualDeities[Math.floor(Math.random() * visualDeities.length)];
      usedIds.add(target.id + '_visual');
      newQuestions.push({
        id: 1,
        type: 'visual',
        question: 'Which deity is depicted in this image?',
        imageUrl: target.imageUrl,
        options: [target.name, ...getRandomDeities(3, target.id).map(d => d.name)].sort(() => Math.random() - 0.5),
        correctAnswer: target.name,
        explanation: `This is ${target.name}, the deity of ${target.domain.join(', ')}.`
      });
    }

    // 2. Relationship Questions
    const validRelTypes = ['parent_of', 'sibling_of', 'spouse_of'];
    const rels = relationships.filter(r => validRelTypes.includes(r.relationshipType));
    if (rels.length > 0) {
      const rel = rels[Math.floor(Math.random() * rels.length)];
      const fromDeity = deities.find(d => d.id === rel.fromDeityId);
      const toDeity = deities.find(d => d.id === rel.toDeityId);

      if (fromDeity && toDeity) {
        usedIds.add(rel.id);
        const relLabel = rel.relationshipType.replace('_', ' '); // "parent of"
        newQuestions.push({
          id: 2,
          type: 'relationship',
          question: `Who is the ${relLabel.split(' ')[0]} of ${toDeity.name}?`, // Who is the parent of Ares?
          options: [fromDeity.name, ...getRandomDeities(3, fromDeity.id).map(d => d.name)].sort(() => Math.random() - 0.5),
          correctAnswer: fromDeity.name,
          explanation: `${fromDeity.name} is the ${relLabel} ${toDeity.name}.`
        });
      }
    }

    // 3. Domain/Symbol Questions (Fill remaining slots to reach 5)
    while (newQuestions.length < 5) {
      const target = deities[Math.floor(Math.random() * deities.length)];
      if (usedIds.has(target.id + '_domain')) continue;

      if (Math.random() > 0.5 && target.domain.length > 0) {
        usedIds.add(target.id + '_domain');
        newQuestions.push({
          id: newQuestions.length + 1,
          type: 'text',
          question: `Which deity is associated with ${target.domain[0]}?`,
          options: [target.name, ...getRandomDeities(3, target.id).map(d => d.name)].sort(() => Math.random() - 0.5),
          correctAnswer: target.name,
          explanation: `${target.name} is the deity of ${target.domain.join(', ')}.`
        });
      } else if (target.symbols.length > 0) {
        usedIds.add(target.id + '_symbol');
        newQuestions.push({
          id: newQuestions.length + 1,
          type: 'text',
          question: `Which deity is symbolized by ${target.symbols[0]}?`,
          options: [target.name, ...getRandomDeities(3, target.id).map(d => d.name)].sort(() => Math.random() - 0.5),
          correctAnswer: target.name,
          explanation: `${target.name}'s symbols include ${target.symbols.join(', ')}.`
        });
      }
    }

    setQuestions(newQuestions.sort(() => Math.random() - 0.5)); // Shuffle order
  }, [data]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);

    if (answer === questions[currentQuestion].correctAnswer) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('mythos_quiz_highscore', newScore.toString());
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
    window.location.reload();
  };

  if (isLoading || !data?.deities) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
          <p className="text-muted-foreground">Summoning the Muses...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card className="max-w-2xl mx-auto border-gold/20 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
        <CardHeader className="text-center pt-8">
          <div className="mx-auto mb-6 p-6 rounded-full bg-linear-to-br from-gold/20 to-amber-500/10 w-fit ring-1 ring-gold/30 shadow-inner">
            <Trophy className="h-16 w-16 text-gold drop-shadow-md" />
          </div>
          <CardTitle className="text-3xl font-serif">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pb-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-gold mb-2 tracking-tight">
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
            <div className="text-center p-3 rounded-lg bg-muted/50 w-24 border border-gold/20 bg-gold/5">
              <div className="text-gold/80 mb-1 flex items-center justify-center gap-1">
                <Crown className="h-3 w-3" /> Best
              </div>
              <div className="font-bold text-lg text-gold">{highScore * 100}</div>
            </div>
          </div>

          <div className="text-center max-w-sm mx-auto">
            {percentage >= 80 ? (
              <p className="text-lg">🎉 divine wisdom! You rival Athena herself!</p>
            ) : percentage >= 60 ? (
              <p className="text-lg">👏 A worthy effort! Make an offering to the Muses and try again.</p>
            ) : (
              <p className="text-lg">📚 The library of Alexandria awaits your return.</p>
            )}
          </div>

          <Button onClick={restartQuiz} className="w-full h-12 text-lg gap-2 bg-gold hover:bg-gold/90 text-black">
            <RefreshCw className="h-5 w-5" />
            Challenge Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Question {currentQuestion + 1}/{questions.length}</span>
          <Progress value={((currentQuestion) / questions.length) * 100} className="h-1.5 w-32" />
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium">
          <Trophy className="h-3.5 w-3.5" />
          <span>{score}</span>
        </div>
      </div>

      <Card className="border-t-4 border-t-gold shadow-lg overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-muted border border-border shrink-0 mt-1">
              {question.type === 'visual' ? <ImageIcon className="h-6 w-6 text-purple-500" /> :
                question.type === 'relationship' ? <Users className="h-6 w-6 text-blue-500" /> :
                  <Sparkles className="h-6 w-6 text-gold" />}
            </div>
            <div>
              <Badge variant="secondary" className="mb-2 w-fit">
                {question.type === 'visual' ? 'Visual ID' :
                  question.type === 'relationship' ? 'Relationship' : 'Knowledge'}
              </Badge>
              <CardTitle className="text-xl md:text-2xl leading-tight font-serif">
                {question.question}
              </CardTitle>
            </div>
          </div>
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

          <div className="grid gap-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === question.correctAnswer;
              const showCorrect = showResult && isCorrect;
              const showIncorrect = showResult && isSelected && !isCorrect;

              return (
                <Button
                  key={index}
                  variant={showCorrect ? 'default' : showIncorrect ? 'destructive' : 'outline'}
                  className={`w-full justify-between items-center h-auto py-4 px-5 text-lg group transition-all duration-200 ${showCorrect ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' : ''
                    } ${showIncorrect ? 'bg-red-600 hover:bg-red-700 border-red-600 text-white' : ''} ${!showResult && !isSelected ? 'hover:border-gold/50 hover:bg-gold/5' : ''
                    }`}
                  onClick={() => !showResult && handleAnswerSelect(option)}
                  disabled={showResult}
                >
                  <span className="font-medium">{option}</span>
                  {showCorrect && <Check className="h-5 w-5 shrink-0" />}
                  {showIncorrect && <X className="h-5 w-5 shrink-0" />}
                </Button>
              );
            })}
          </div>

          {showResult && (
            <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-gold/20 mt-0.5">
                  <ArrowRight className="h-4 w-4 text-gold" />
                </div>
                <p className="text-secondary-foreground leading-relaxed">{question.explanation}</p>
              </div>
            </div>
          )}
        </CardContent>

        {showResult && (
          <CardFooter className="bg-muted/30 pt-4 pb-6">
            <Button onClick={handleNext} size="lg" className="w-full gap-2 text-lg font-semibold bg-primary hover:bg-primary/90">
              {currentQuestion < questions.length - 1 ? (
                <>Next Question <ArrowRight className="h-5 w-5" /></>
              ) : (
                <>See Results <Trophy className="h-5 w-5" /></>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
