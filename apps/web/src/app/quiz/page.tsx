import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Translated } from "@/components/i18n/Translated";
import { MythologyQuiz } from "@/components/quiz/MythologyQuiz";
import { getMythologyQuizPool } from "@/lib/data/quiz-pool";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { QuizJsonLd } from "@/components/seo/JsonLd";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata = generateBaseMetadata({
  title: "Mythology Quiz - Test Your Knowledge",
  description:
    "Test your knowledge of Greek, Norse, Egyptian, and world mythology. Learn about deities, symbols, and domains through interactive quizzes.",
  url: "/quiz",
  keywords: [
    "mythology quiz",
    "Greek mythology quiz",
    "Norse mythology quiz",
    "test knowledge",
    "trivia",
    "educational quiz",
  ],
});

const OTHER_QUIZZES = [
  {
    titleKey: "quickQuizTitle",
    descriptionKey: "quickQuizDescription",
    badgeKey: "speedBadge",
    href: "/quiz/quick",
    image: "/deities/zeus.jpg",
  },
  {
    titleKey: "relationshipsTitle",
    descriptionKey: "relationshipsDescription",
    badgeKey: "challengeTitle",
    href: "/quiz/relationships",
    image: "/deities/hera.jpg",
  },
  {
    titleKey: "personalityTitle",
    descriptionKey: "personalityDescription",
    badgeKey: "personalityBadge",
    href: "/quiz/personality",
    image: "/deities/athena.jpg",
  },
] as const;

export default function QuizPage() {
  return (
    <div className="min-h-screen">
      <QuizJsonLd
        name="Mythology Quiz - Test Your Knowledge"
        description="Test your knowledge of Greek, Norse, Egyptian, and world mythology with interactive quizzes about deities, symbols, and domains."
        url="/quiz"
      />
      <PageHeader
        eyebrow="Test yourself"
        mark="lyre"
        title={<Translated namespace="pages.quiz" k="title" />}
        lede={<Translated namespace="pages.quiz" k="subtitle" />}
      />

      <Container className="section-space-sm">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section aria-labelledby="knowledge-quiz-title" className="min-w-0">
            <div className="mx-auto mb-6 max-w-2xl">
              <p className="type-eyebrow">Five questions · one sitting</p>
              <h2
                id="knowledge-quiz-title"
                className="page-section-title mt-2 text-foreground"
              >
                <Translated namespace="pages.quiz" k="knowledgeQuizTitle" />
              </h2>
            </div>
            <MythologyQuiz pool={getMythologyQuizPool()} />
          </section>

          <aside aria-labelledby="more-quizzes-title" className="min-w-0">
            <h2
              id="more-quizzes-title"
              className="type-h3 border-b border-border/70 pb-3 text-foreground"
            >
              <Translated namespace="pages.quiz" k="moreQuizzesTitle" />
            </h2>
            <ul className="divide-y divide-border/70">
              {OTHER_QUIZZES.map((quiz) => (
                <li key={quiz.href}>
                  <Link
                    href={quiz.href}
                    className="group grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    <span className="relative block aspect-4/5 overflow-hidden rounded-md bg-muted ring-1 ring-border/70">
                      <Image
                        src={quiz.image}
                        alt=""
                        fill
                        sizes="72px"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.05]"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="type-eyebrow block text-[0.75rem]!">
                        <Translated namespace="pages.quiz" k={quiz.badgeKey} />
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 font-serif text-lg font-semibold leading-snug text-foreground group-hover:text-gold-text">
                        <Translated namespace="pages.quiz" k={quiz.titleKey} />
                        <ArrowRight
                          className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="mt-1 block type-ui text-muted-foreground">
                        <Translated
                          namespace="pages.quiz"
                          k={quiz.descriptionKey}
                        />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="border-t border-border/70 pt-4 type-ui text-muted-foreground">
              Scores and streaks are kept in this browser on{" "}
              <Link
                href="/progress"
                className="text-gold-text underline underline-offset-4"
              >
                Your Stats
              </Link>
              .
            </p>
          </aside>
        </div>
      </Container>

      <AboutThisPage title="Study with every quiz mode">
        <p>
          <Translated namespace="pages.quiz" k="studySectionDescription" />
        </p>
      </AboutThisPage>
    </div>
  );
}
