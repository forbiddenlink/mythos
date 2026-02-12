'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  RefreshCw,
  ArrowRight,
  ChevronLeft,
  Share2,
  Check,
  Zap,
  Mountain,
  Waves,
  Sun,
  Moon,
  Feather,
  Flame,
  Crown,
  Heart,
  Sword,
  Eye,
  Shield,
  Wind,
} from 'lucide-react';

// Deity archetypes with scoring categories
type DeityArchetype =
  | 'wisdom'
  | 'power'
  | 'sea'
  | 'war'
  | 'love'
  | 'knowledge'
  | 'hunt'
  | 'craft'
  | 'trickery'
  | 'underworld';

interface DeityResult {
  name: string;
  title: string;
  description: string;
  whyMatch: string;
  imageUrl?: string;
  slug: string;
  pantheon: string;
  icon: React.ReactNode;
}

interface Question {
  id: number;
  question: string;
  options: {
    text: string;
    scores: Partial<Record<DeityArchetype, number>>;
    icon?: React.ReactNode;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'How do you prefer to solve problems?',
    options: [
      {
        text: 'Through careful planning and strategy',
        scores: { wisdom: 3, knowledge: 1 },
        icon: <Eye className="h-5 w-5" />,
      },
      {
        text: 'With decisive action and strength',
        scores: { power: 3, war: 1 },
        icon: <Zap className="h-5 w-5" />,
      },
      {
        text: 'By adapting and going with the flow',
        scores: { sea: 2, trickery: 2 },
        icon: <Waves className="h-5 w-5" />,
      },
      {
        text: 'Through charm and persuasion',
        scores: { love: 3, trickery: 1 },
        icon: <Heart className="h-5 w-5" />,
      },
    ],
  },
  {
    id: 2,
    question: "What's your ideal environment?",
    options: [
      {
        text: 'High places with commanding views',
        scores: { power: 3, knowledge: 1 },
        icon: <Mountain className="h-5 w-5" />,
      },
      {
        text: 'Near water - oceans, rivers, or lakes',
        scores: { sea: 3, hunt: 1 },
        icon: <Waves className="h-5 w-5" />,
      },
      {
        text: 'Wild forests and untamed nature',
        scores: { hunt: 3, wisdom: 1 },
        icon: <Feather className="h-5 w-5" />,
      },
      {
        text: 'A workshop or creative space',
        scores: { craft: 3, knowledge: 1 },
        icon: <Flame className="h-5 w-5" />,
      },
    ],
  },
  {
    id: 3,
    question: 'How do you handle conflict?',
    options: [
      {
        text: 'Face it head-on with courage',
        scores: { war: 3, power: 1 },
        icon: <Sword className="h-5 w-5" />,
      },
      {
        text: 'Outthink and outmaneuver opponents',
        scores: { wisdom: 2, trickery: 2 },
        icon: <Eye className="h-5 w-5" />,
      },
      {
        text: 'Find common ground and harmony',
        scores: { love: 3, sea: 1 },
        icon: <Heart className="h-5 w-5" />,
      },
      {
        text: 'Wait patiently for the right moment',
        scores: { underworld: 3, hunt: 1 },
        icon: <Moon className="h-5 w-5" />,
      },
    ],
  },
  {
    id: 4,
    question: 'What matters most to you?',
    options: [
      {
        text: 'Justice and fairness',
        scores: { wisdom: 2, underworld: 2 },
        icon: <Shield className="h-5 w-5" />,
      },
      {
        text: 'Love and connection',
        scores: { love: 3, sea: 1 },
        icon: <Heart className="h-5 w-5" />,
      },
      {
        text: 'Knowledge and truth',
        scores: { knowledge: 3, wisdom: 1 },
        icon: <Sun className="h-5 w-5" />,
      },
      {
        text: 'Power and influence',
        scores: { power: 3, war: 1 },
        icon: <Crown className="h-5 w-5" />,
      },
    ],
  },
  {
    id: 5,
    question: 'Pick a symbol that resonates with you.',
    options: [
      {
        text: 'Lightning bolt',
        scores: { power: 3, war: 1 },
        icon: <Zap className="h-5 w-5" />,
      },
      {
        text: 'Owl',
        scores: { wisdom: 3, hunt: 1 },
        icon: <Eye className="h-5 w-5" />,
      },
      {
        text: 'Rose',
        scores: { love: 3, craft: 1 },
        icon: <Heart className="h-5 w-5" />,
      },
      {
        text: 'Lyre',
        scores: { knowledge: 3, love: 1 },
        icon: <Sun className="h-5 w-5" />,
      },
    ],
  },
  {
    id: 6,
    question: "What's your greatest strength?",
    options: [
      {
        text: 'My intellect and strategic mind',
        scores: { wisdom: 3, knowledge: 1 },
        icon: <Eye className="h-5 w-5" />,
      },
      {
        text: 'My creativity and artistic vision',
        scores: { craft: 2, knowledge: 2 },
        icon: <Sparkles className="h-5 w-5" />,
      },
      {
        text: 'My determination and willpower',
        scores: { war: 2, hunt: 2 },
        icon: <Flame className="h-5 w-5" />,
      },
      {
        text: 'My ability to connect with others',
        scores: { love: 2, trickery: 2 },
        icon: <Heart className="h-5 w-5" />,
      },
    ],
  },
  {
    id: 7,
    question: "What's your biggest weakness?",
    options: [
      {
        text: 'I can be too proud or stubborn',
        scores: { power: 2, war: 2 },
        icon: <Crown className="h-5 w-5" />,
      },
      {
        text: 'I sometimes overthink things',
        scores: { wisdom: 2, knowledge: 2 },
        icon: <Eye className="h-5 w-5" />,
      },
      {
        text: 'I can be impulsive or emotional',
        scores: { sea: 2, love: 2 },
        icon: <Waves className="h-5 w-5" />,
      },
      {
        text: 'I prefer solitude over company',
        scores: { hunt: 2, underworld: 2 },
        icon: <Moon className="h-5 w-5" />,
      },
    ],
  },
  {
    id: 8,
    question: 'How do you want to be remembered?',
    options: [
      {
        text: 'As someone who achieved greatness',
        scores: { power: 3, war: 1 },
        icon: <Crown className="h-5 w-5" />,
      },
      {
        text: 'As someone who helped others',
        scores: { love: 2, craft: 2 },
        icon: <Heart className="h-5 w-5" />,
      },
      {
        text: 'As someone who sought truth',
        scores: { knowledge: 2, wisdom: 2 },
        icon: <Sun className="h-5 w-5" />,
      },
      {
        text: 'As someone who lived freely',
        scores: { hunt: 2, trickery: 2 },
        icon: <Wind className="h-5 w-5" />,
      },
    ],
  },
];

const DEITY_RESULTS: Record<DeityArchetype, DeityResult> = {
  wisdom: {
    name: 'Athena',
    title: 'Goddess of Wisdom and Strategy',
    description:
      'You possess a sharp mind and excel at planning. Like Athena, you approach challenges with logic and foresight, preferring to outthink rather than overpower your opponents.',
    whyMatch:
      'Your answers reveal a strategic thinker who values intellect, justice, and careful planning. You likely excel in situations requiring analysis and long-term thinking.',
    imageUrl: '/deities/athena.webp',
    slug: 'athena',
    pantheon: 'Greek',
    icon: <Eye className="h-8 w-8" />,
  },
  power: {
    name: 'Zeus',
    title: 'King of the Gods',
    description:
      'You are a natural leader with commanding presence. Like Zeus, you take charge of situations and inspire others to follow. Your ambition drives you toward greatness.',
    whyMatch:
      'Your answers show someone who values authority, achievement, and making an impact. You are drawn to positions of influence and responsibility.',
    imageUrl: '/deities/zeus.webp',
    slug: 'zeus',
    pantheon: 'Greek',
    icon: <Zap className="h-8 w-8" />,
  },
  sea: {
    name: 'Poseidon',
    title: 'God of the Sea',
    description:
      'You are deeply emotional and adaptable, like the ever-changing ocean. Like Poseidon, you can be calm and nurturing or fierce and unstoppable when provoked.',
    whyMatch:
      'Your answers reveal someone who values emotional depth and flexibility. You adapt to circumstances while maintaining your core strength.',
    imageUrl: '/deities/poseidon.webp',
    slug: 'poseidon',
    pantheon: 'Greek',
    icon: <Waves className="h-8 w-8" />,
  },
  war: {
    name: 'Ares',
    title: 'God of War',
    description:
      'You are bold, courageous, and unafraid of confrontation. Like Ares, you face challenges directly and possess unwavering determination in pursuit of your goals.',
    whyMatch:
      'Your answers show someone with fighting spirit and courage. You do not shy away from conflict and prefer direct action over hesitation.',
    imageUrl: '/deities/ares.webp',
    slug: 'ares',
    pantheon: 'Greek',
    icon: <Sword className="h-8 w-8" />,
  },
  love: {
    name: 'Aphrodite',
    title: 'Goddess of Love and Beauty',
    description:
      'You have a gift for connecting with others and creating harmony. Like Aphrodite, you value relationships, beauty, and the power of emotional bonds.',
    whyMatch:
      'Your answers reveal someone who prioritizes connection and harmony. You understand the importance of love and use charm to navigate the world.',
    imageUrl: '/deities/aphrodite.webp',
    slug: 'aphrodite',
    pantheon: 'Greek',
    icon: <Heart className="h-8 w-8" />,
  },
  knowledge: {
    name: 'Apollo',
    title: 'God of Light and Knowledge',
    description:
      'You seek truth, beauty, and enlightenment. Like Apollo, you have artistic sensibilities and a desire to bring light and understanding to the world around you.',
    whyMatch:
      'Your answers show someone drawn to truth and artistic expression. You value knowledge not just for its own sake, but as a path to greater understanding.',
    imageUrl: '/deities/apollo.webp',
    slug: 'apollo',
    pantheon: 'Greek',
    icon: <Sun className="h-8 w-8" />,
  },
  hunt: {
    name: 'Artemis',
    title: 'Goddess of the Hunt',
    description:
      'You value independence and have a deep connection to nature. Like Artemis, you are fiercely protective of those you care about while cherishing your freedom.',
    whyMatch:
      'Your answers reveal someone who values autonomy and the natural world. You are patient, focused, and prefer to forge your own path.',
    imageUrl: '/deities/artemis.webp',
    slug: 'artemis',
    pantheon: 'Greek',
    icon: <Moon className="h-8 w-8" />,
  },
  craft: {
    name: 'Hephaestus',
    title: 'God of the Forge',
    description:
      'You are a creator and maker, finding joy in building and crafting. Like Hephaestus, you have patience and skill to bring your visions to life through dedicated work.',
    whyMatch:
      'Your answers show someone who values creation and craftsmanship. You find fulfillment in making things and solving practical problems.',
    imageUrl: '/deities/hephaestus.webp',
    slug: 'hephaestus',
    pantheon: 'Greek',
    icon: <Flame className="h-8 w-8" />,
  },
  trickery: {
    name: 'Hermes',
    title: 'Messenger of the Gods',
    description:
      'You are quick-witted, adaptable, and excellent at communication. Like Hermes, you move easily between different worlds and can talk your way through any situation.',
    whyMatch:
      'Your answers reveal someone with versatility and cleverness. You are resourceful and know how to navigate complex social situations.',
    imageUrl: '/deities/hermes.webp',
    slug: 'hermes',
    pantheon: 'Greek',
    icon: <Wind className="h-8 w-8" />,
  },
  underworld: {
    name: 'Hades',
    title: 'Lord of the Underworld',
    description:
      'You are patient, fair, and comfortable with life complexities. Like Hades, you understand that true wealth lies beneath the surface and value depth over appearances.',
    whyMatch:
      'Your answers show someone who is introspective and values justice. You are comfortable with solitude and understand the importance of patience.',
    imageUrl: '/deities/hades.webp',
    slug: 'hades',
    pantheon: 'Greek',
    icon: <Crown className="h-8 w-8" />,
  },
};

export function PersonalityQuiz() {
  const searchParams = useSearchParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<DeityArchetype, number>>({
    wisdom: 0,
    power: 0,
    sea: 0,
    war: 0,
    love: 0,
    knowledge: 0,
    hunt: 0,
    craft: 0,
    trickery: 0,
    underworld: 0,
  });
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check for shared results in URL
  const sharedDeity = searchParams.get('result') as DeityArchetype | null;
  const isSharedResult = sharedDeity !== null && DEITY_RESULTS[sharedDeity];

  const handleAnswerSelect = useCallback(
    (optionScores: Partial<Record<DeityArchetype, number>>) => {
      setScores((prev) => {
        const newScores = { ...prev };
        Object.entries(optionScores).forEach(([archetype, score]) => {
          newScores[archetype as DeityArchetype] += score || 0;
        });
        return newScores;
      });

      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setQuizCompleted(true);
      }
    },
    [currentQuestion]
  );

  const getResult = useCallback((): DeityResult => {
    const maxArchetype = Object.entries(scores).reduce((max, [archetype, score]) =>
      score > max.score ? { archetype: archetype as DeityArchetype, score } : max
    , { archetype: 'wisdom' as DeityArchetype, score: -1 });

    return DEITY_RESULTS[maxArchetype.archetype];
  }, [scores]);

  const getResultArchetype = useCallback((): DeityArchetype => {
    const maxArchetype = Object.entries(scores).reduce((max, [archetype, score]) =>
      score > max.score ? { archetype: archetype as DeityArchetype, score } : max
    , { archetype: 'wisdom' as DeityArchetype, score: -1 });

    return maxArchetype.archetype;
  }, [scores]);

  const restartQuiz = useCallback(() => {
    setCurrentQuestion(0);
    setScores({
      wisdom: 0,
      power: 0,
      sea: 0,
      war: 0,
      love: 0,
      knowledge: 0,
      hunt: 0,
      craft: 0,
      trickery: 0,
      underworld: 0,
    });
    setQuizCompleted(false);
  }, []);

  const handleShare = useCallback(async (archetype: DeityArchetype) => {
    const deity = DEITY_RESULTS[archetype];
    const shareUrl = `${window.location.origin}/quiz/personality?result=${archetype}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `I'm ${deity.name}! - Mythos Atlas`,
          text: `I took the "Which God Are You?" quiz and got ${deity.name}, ${deity.title}! Find your divine counterpart:`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  // Shared Results View
  if (isSharedResult && sharedDeity) {
    const deity = DEITY_RESULTS[sharedDeity];

    return (
      <Card className="max-w-2xl mx-auto border-gold/20 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
        <CardHeader className="text-center pt-8">
          <div className="mx-auto mb-4 p-2 rounded-full bg-gold/10 w-fit">
            <Badge variant="secondary" className="text-xs uppercase tracking-wider">
              Shared Result
            </Badge>
          </div>
          <div className="mx-auto mb-6 p-6 rounded-full bg-gradient-to-br from-gold/20 to-amber-500/10 w-fit ring-1 ring-gold/30 shadow-inner text-gold">
            {deity.icon}
          </div>
          <CardTitle className="text-3xl font-serif">Someone got {deity.name}!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <div className="text-center">
            <Badge className="mb-2">{deity.pantheon} Pantheon</Badge>
            <p className="text-lg text-muted-foreground">{deity.title}</p>
          </div>

          <p className="text-center text-muted-foreground">{deity.description}</p>

          <div className="text-center max-w-sm mx-auto">
            <p className="text-lg">Think you will get the same result? Take the quiz yourself!</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={restartQuiz}
              className="flex-1 h-12 text-lg gap-2 bg-gold hover:bg-gold/90 text-black"
            >
              <Sparkles className="h-5 w-5" />
              Take the Quiz
            </Button>
            <Button variant="outline" asChild className="flex-1 h-12 text-lg gap-2">
              <Link href="/quiz">
                <ChevronLeft className="h-5 w-5" />
                All Quizzes
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz Complete - Show Result
  if (quizCompleted) {
    const result = getResult();
    const resultArchetype = getResultArchetype();

    return (
      <Card className="max-w-2xl mx-auto border-gold/20 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
        <CardHeader className="text-center pt-8">
          <div className="mx-auto mb-4 p-2 rounded-full bg-gold/10 w-fit">
            <Badge variant="secondary" className="text-xs uppercase tracking-wider">
              Your Result
            </Badge>
          </div>

          {result.imageUrl ? (
            <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden ring-4 ring-gold/30 shadow-xl">
              <Image
                src={result.imageUrl}
                alt={result.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="mx-auto mb-6 p-6 rounded-full bg-gradient-to-br from-gold/20 to-amber-500/10 w-fit ring-1 ring-gold/30 shadow-inner text-gold">
              {result.icon}
            </div>
          )}

          <CardTitle className="text-3xl font-serif">You are {result.name}!</CardTitle>
          <p className="text-lg text-muted-foreground mt-2">{result.title}</p>
          <Badge className="mt-2">{result.pantheon} Pantheon</Badge>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-secondary-foreground leading-relaxed">{result.description}</p>
          </div>

          <div className="p-4 rounded-lg bg-gold/5 border border-gold/20">
            <h4 className="font-semibold text-gold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Why You Matched
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.whyMatch}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => handleShare(resultArchetype)}
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
                  Share Result
                </>
              )}
            </Button>
            <Button
              onClick={restartQuiz}
              className="flex-1 h-12 text-lg gap-2 bg-gold hover:bg-gold/90 text-black"
            >
              <RefreshCw className="h-5 w-5" />
              Retake Quiz
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="outline" asChild className="flex-1 h-10 gap-2">
              <Link href={`/deities/${result.slug}`}>
                Learn more about {result.name}
                <ArrowRight className="h-4 w-4" />
              </Link>
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
    );
  }

  // Quiz In Progress
  const question = QUESTIONS[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span
            id="quiz-progress-label"
            className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
          >
            Question {currentQuestion + 1} of {QUESTIONS.length}
          </span>
          <Progress
            value={(currentQuestion / QUESTIONS.length) * 100}
            className="h-1.5 w-32"
            aria-labelledby="quiz-progress-label"
            aria-valuenow={currentQuestion + 1}
            aria-valuemin={1}
            aria-valuemax={QUESTIONS.length}
          />
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium"
          role="status"
          aria-label="Personality quiz in progress"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Personality</span>
        </div>
      </div>

      <Card
        className="border-t-4 border-t-gold shadow-lg overflow-hidden"
        role="region"
        aria-label={`Quiz question ${currentQuestion + 1} of ${QUESTIONS.length}`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-muted border border-border shrink-0 mt-1">
              <Sparkles className="h-6 w-6 text-gold" />
            </div>
            <div>
              <Badge variant="secondary" className="mb-2 w-fit">
                Personality
              </Badge>
              <CardTitle id="quiz-question" className="text-xl md:text-2xl leading-tight font-serif">
                {question.question}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-4">
          <div
            role="radiogroup"
            aria-label="Select your answer"
            aria-describedby="quiz-question"
            className="grid gap-3"
          >
            {question.options.map((option, index) => (
              <Button
                key={index}
                role="radio"
                aria-checked={false}
                variant="outline"
                className="w-full justify-start items-center h-auto py-4 px-5 text-left group transition-all duration-200 hover:border-gold/50 hover:bg-gold/5"
                onClick={() => handleAnswerSelect(option.scores)}
              >
                <div className="flex items-center gap-4 w-full">
                  {option.icon && (
                    <div className="p-2 rounded-lg bg-muted group-hover:bg-gold/10 transition-colors shrink-0">
                      <div className="text-muted-foreground group-hover:text-gold transition-colors">
                        {option.icon}
                      </div>
                    </div>
                  )}
                  <span className="font-medium text-base">{option.text}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
