import { Suspense } from "react";
import { PersonalityQuiz } from "@/components/quiz/PersonalityQuiz";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { SimplePageHeader } from "@/components/layout/simple-page-header";
import { Sparkles, Heart, Brain } from "lucide-react";
import { QuizJsonLd } from "@/components/seo/JsonLd";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata = generateBaseMetadata({
  title: "Which God Are You? - Personality Quiz",
  description:
    "Discover your divine counterpart with our personality quiz. Answer 8 questions to find out which deity from ancient mythology matches your personality.",
  url: "/quiz/personality",
  keywords: [
    "personality quiz",
    "which god am I",
    "deity personality test",
    "Greek god quiz",
    "mythology personality",
    "divine counterpart",
    "Athena",
    "Zeus",
    "Poseidon",
    "Apollo",
  ],
});

export default function PersonalityQuizPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-mythic">
      <QuizJsonLd
        name="Which God Are You? Personality Quiz"
        description="Discover your divine counterpart by answering personality questions that match you to a deity from ancient mythology."
        url="/quiz/personality"
      />
      <div className="page-shell">
        <Breadcrumbs />

        <SimplePageHeader
          mark="lyre"
          tagline="Personality"
          title="Which God Are You?"
          description="Answer these questions to discover your divine counterpart"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <Heart className="h-5 w-5 text-gold" aria-hidden="true" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Discover</div>
                <div className="text-xs text-muted-foreground">
                  Your divine match
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <Brain className="h-5 w-5 text-gold" aria-hidden="true" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">8 Questions</div>
                <div className="text-xs text-muted-foreground">
                  Quick and fun
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <Sparkles className="h-5 w-5 text-gold" aria-hidden="true" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Learn</div>
                <div className="text-xs text-muted-foreground">
                  Why you match
                </div>
              </div>
            </div>
          </div>
        </SimplePageHeader>

        <section className="mx-auto mb-8 max-w-3xl rounded-xl border border-border/60 bg-card/60 p-6">
          <h2 className="page-section-title text-foreground">
            A Lighter Way To Explore Archetypes
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            This quiz is designed less as scholarship and more as an entry
            point. It uses familiar deity archetypes like wisdom, war, love,
            craft, and trickery to give you a playful route into the wider
            mythology archive without asking you to know the source material in
            advance.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            The result works best as a starting prompt. Once you get a match,
            open that deity page, compare it with nearby figures, and use the
            answer as a way to branch into stories, domains, and pantheons that
            share the same personality pattern.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            That makes the page useful even if you take it casually. A quick
            personality result can still point you toward a more serious reading
            path, especially when you want a fun way to begin exploring
            mythology before moving into deeper reference pages or study modes.
          </p>
        </section>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                <p className="text-muted-foreground">
                  Consulting the Oracle...
                </p>
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
