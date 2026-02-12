import { Suspense } from 'react';
import { PersonalityQuiz } from '@/components/quiz/PersonalityQuiz';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Sparkles, Heart, Brain } from 'lucide-react';
import { QuizJsonLd } from '@/components/seo/JsonLd';
import { generateBaseMetadata } from '@/lib/metadata';

export const metadata = generateBaseMetadata({
  title: 'Which God Are You? - Personality Quiz',
  description: 'Discover your divine counterpart with our personality quiz. Answer 8 questions to find out which deity from ancient mythology matches your personality.',
  url: '/quiz/personality',
  keywords: [
    'personality quiz',
    'which god am I',
    'deity personality test',
    'Greek god quiz',
    'mythology personality',
    'divine counterpart',
    'Athena',
    'Zeus',
    'Poseidon',
    'Apollo',
  ],
});

export default function PersonalityQuizPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-mythic">
      <QuizJsonLd
        name="Which God Are You? Personality Quiz"
        description="Discover your divine counterpart by answering personality questions that match you to a deity from ancient mythology."
        url="/quiz/personality"
      />
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Breadcrumbs />

        <div className="text-center mb-12 mt-6">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-xl border border-gold/20 bg-gold/5 backdrop-blur-sm">
              <Sparkles className="h-10 w-10 text-gold" />
            </div>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Which God Are You?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Answer these questions to discover your divine counterpart
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <Heart className="h-5 w-5 text-gold" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Discover</div>
                <div className="text-xs text-muted-foreground">Your divine match</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <Brain className="h-5 w-5 text-gold" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">8 Questions</div>
                <div className="text-xs text-muted-foreground">Quick and fun</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <Sparkles className="h-5 w-5 text-gold" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Share</div>
                <div className="text-xs text-muted-foreground">Challenge friends</div>
              </div>
            </div>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                <p className="text-muted-foreground">Consulting the Oracle...</p>
              </div>
            </div>
          }
        >
          <PersonalityQuiz />
        </Suspense>
      </div>
    </div>
  );
}
