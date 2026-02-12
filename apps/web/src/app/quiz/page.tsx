import Link from 'next/link';
import { MythologyQuiz } from '@/components/quiz/MythologyQuiz';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Brain, BookOpen, Trophy, Users, Sparkles, ArrowRight } from 'lucide-react';
import { QuizJsonLd } from '@/components/seo/JsonLd';
import { generateBaseMetadata } from '@/lib/metadata';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = generateBaseMetadata({
  title: 'Mythology Quiz - Test Your Knowledge',
  description: 'Test your knowledge of Greek, Norse, Egyptian, and world mythology. Learn about deities, symbols, and domains through interactive quizzes.',
  url: '/quiz',
  keywords: ['mythology quiz', 'Greek mythology quiz', 'Norse mythology quiz', 'test knowledge', 'trivia', 'educational quiz'],
});

const OTHER_QUIZZES = [
  {
    title: 'Divine Relationships',
    description: 'Test your knowledge of divine family ties, marriages, and connections across pantheons.',
    href: '/quiz/relationships',
    icon: Users,
    badge: 'Challenge',
    color: 'text-blue-500',
  },
  {
    title: 'Which God Are You?',
    description: 'Discover your divine counterpart with our personality quiz. Find out which deity matches your soul.',
    href: '/quiz/personality',
    icon: Sparkles,
    badge: 'Personality',
    color: 'text-gold',
  },
];

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-mythic">
      <QuizJsonLd
        name="Mythology Quiz - Test Your Knowledge"
        description="Test your knowledge of Greek, Norse, Egyptian, and world mythology with interactive quizzes about deities, symbols, and domains."
        url="/quiz"
      />
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Breadcrumbs />

        <div className="text-center mb-12 mt-6">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-xl border border-gold/20 bg-gold/5 backdrop-blur-sm">
              <Brain className="h-10 w-10 text-gold" />
            </div>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Mythology Quiz
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Test your knowledge of ancient deities, symbols, and domains from various pantheons
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <BookOpen className="h-5 w-5 text-gold" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Learn</div>
                <div className="text-xs text-muted-foreground">Expand your knowledge</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <Brain className="h-5 w-5 text-gold" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Challenge</div>
                <div className="text-xs text-muted-foreground">Test yourself</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <Trophy className="h-5 w-5 text-gold" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Achieve</div>
                <div className="text-xs text-muted-foreground">Track progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Quiz Types */}
        <div className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-6 text-center">More Quizzes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {OTHER_QUIZZES.map((quiz) => {
              const Icon = quiz.icon;
              return (
                <Link key={quiz.href} href={quiz.href}>
                  <Card className="h-full border-border hover:border-gold/50 transition-all duration-200 hover:shadow-lg group cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-xl bg-muted border border-border group-hover:bg-gold/10 transition-colors ${quiz.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary">{quiz.badge}</Badge>
                      </div>
                      <CardTitle className="text-xl font-serif mt-4 group-hover:text-gold transition-colors flex items-center gap-2">
                        {quiz.title}
                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {quiz.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Knowledge Quiz */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-bold mb-6 text-center">Knowledge Quiz</h2>
        </div>
        <MythologyQuiz />
      </div>
    </div>
  );
}
