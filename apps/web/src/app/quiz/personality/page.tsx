import { Suspense } from "react";
import { PersonalityQuiz } from "@/components/quiz/PersonalityQuiz";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
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
    <div className="min-h-screen">
      <QuizJsonLd
        name="Which God Are You? Personality Quiz"
        description="Discover your divine counterpart by answering personality questions that match you to a deity from ancient mythology."
        url="/quiz/personality"
      />
      <PageHeader
        eyebrow="Personality quiz"
        mark="lyre"
        title="Which God Are You?"
        lede="Answer eight questions to discover your divine counterpart, and why you match."
        count="8 questions · about two minutes"
      />

      <Container size="reading" className="section-space-sm">
        <Suspense
          fallback={
            <p
              role="status"
              aria-busy="true"
              className="py-12 text-center type-ui text-muted-foreground"
            >
              Consulting the Oracle…
            </p>
          }
        >
          <PersonalityQuiz />
        </Suspense>
      </Container>

      <AboutThisPage title="A lighter way to explore archetypes">
        <p>
          This quiz is designed less as scholarship and more as an entry point.
          It uses familiar deity archetypes like wisdom, war, love, craft and
          trickery to give you a playful route into the wider mythology archive
          without asking you to know the source material in advance.
        </p>
        <p>
          The result works best as a starting prompt. Once you get a match, open
          that deity page, compare it with nearby figures, and use the answer as
          a way to branch into stories, domains and pantheons that share the
          same personality pattern.
        </p>
        <p>
          That makes the page useful even if you take it casually. A quick
          personality result can still point you toward a more serious reading
          path, especially when you want a fun way to begin exploring mythology
          before moving into deeper reference pages or study modes.
        </p>
      </AboutThisPage>
    </div>
  );
}
