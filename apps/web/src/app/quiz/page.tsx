import { MythologyQuiz } from '@/components/quiz/MythologyQuiz';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Brain, BookOpen, Trophy } from 'lucide-react';
import { QuizJsonLd } from '@/components/seo/JsonLd';
import { generateBaseMetadata } from '@/lib/metadata';

export const metadata = generateBaseMetadata({
  title: 'Mythology Quiz - Test Your Knowledge',
  description: 'Test your knowledge of Greek, Norse, Egyptian, and world mythology. Learn about deities, symbols, and domains through interactive quizzes.',
  url: '/quiz',
  keywords: ['mythology quiz', 'Greek mythology quiz', 'Norse mythology quiz', 'test knowledge', 'trivia', 'educational quiz'],
});

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

        <MythologyQuiz />
      </div>
    </div>
  );
}
