import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MythologyQuiz } from "@/components/quiz/MythologyQuiz";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { SimplePageHeader } from "@/components/layout/simple-page-header";
import { pageSectionTitleClass } from "@/components/layout/page-typography";
import { ArrowRight } from "lucide-react";
import { MythosMark, type MythosMarkId } from "@/components/icons/mythos-marks";
import { QuizJsonLd } from "@/components/seo/JsonLd";
import { generateBaseMetadata } from "@/lib/metadata";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    href: "/quiz/quick",
    mark: "bolt" as MythosMarkId,
    badgeKey: "speedBadge",
    color: "text-gold",
  },
  {
    titleKey: "relationshipsTitle",
    descriptionKey: "relationshipsDescription",
    href: "/quiz/relationships",
    mark: "tree" as MythosMarkId,
    badgeKey: "challengeTitle",
    color: "text-patina",
  },
  {
    titleKey: "personalityTitle",
    descriptionKey: "personalityDescription",
    href: "/quiz/personality",
    mark: "lyre" as MythosMarkId,
    badgeKey: "personalityBadge",
    color: "text-gold",
  },
] as const;

export default async function QuizPage() {
  const t = await getTranslations("pages.quiz");

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-mythic">
      <QuizJsonLd
        name="Mythology Quiz - Test Your Knowledge"
        description="Test your knowledge of Greek, Norse, Egyptian, and world mythology with interactive quizzes about deities, symbols, and domains."
        url="/quiz"
      />
      <div className="page-shell">
        <Breadcrumbs />

        <SimplePageHeader
          mark="lyre"
          tagline="Test yourself"
          title={t("title")}
          description={t("subtitle")}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 p-4 bg-card border border-border">
              <MythosMark id="scroll" className="h-5 w-5 text-gold" />
              <div className="text-left">
                <div className="font-semibold text-sm">{t("learn")}</div>
                <div className="text-xs text-muted-foreground">
                  {t("learnDescription")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-card border border-border">
              <MythosMark id="owl" className="h-5 w-5 text-gold" />
              <div className="text-left">
                <div className="font-semibold text-sm">
                  {t("challengeTitle")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("challengeDescription")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-card border border-border">
              <MythosMark id="laurel" className="h-5 w-5 text-gold" />
              <div className="text-left">
                <div className="font-semibold text-sm">{t("achieveTitle")}</div>
                <div className="text-xs text-muted-foreground">
                  {t("achieveDescription")}
                </div>
              </div>
            </div>
          </div>
        </SimplePageHeader>

        {/* Main Knowledge Quiz */}
        <div className="mb-8">
          <h2 className={cn(pageSectionTitleClass, "mb-6 text-center")}>
            {t("knowledgeQuizTitle")}
          </h2>
        </div>
        <MythologyQuiz />

        {/* Other Quiz Types */}
        <div className="mb-12 mt-16">
          <h2 className={cn(pageSectionTitleClass, "mb-6 text-center")}>
            {t("moreQuizzesTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {OTHER_QUIZZES.map((quiz) => {
              return (
                <Link key={quiz.href} href={quiz.href}>
                  <Card className="h-full border-border hover:border-gold/50 transition-all duration-200 hover:shadow-lg group cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div
                          className={`border border-border bg-muted p-3 transition-colors group-hover:bg-gold/10 ${quiz.color}`}
                        >
                          <MythosMark id={quiz.mark} className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary">{t(quiz.badgeKey)}</Badge>
                      </div>
                      <CardTitle className="text-xl font-serif mt-4 group-hover:text-gold transition-colors flex items-center gap-2">
                        {t(quiz.titleKey)}
                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {t(quiz.descriptionKey)}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <section className="mx-auto mb-12 max-w-4xl rounded-xl border border-border/60 bg-card/60 p-6">
          <h2 className={cn(pageSectionTitleClass, "mb-3")}>
            {t("studySectionTitle")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("studySectionDescription")}
          </p>
        </section>
      </div>
    </div>
  );
}
