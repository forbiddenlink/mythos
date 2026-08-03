import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MythologyQuiz } from "@/components/quiz/MythologyQuiz";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import {
  Brain,
  BookOpen,
  Trophy,
  Users,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";
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
    icon: Zap,
    badgeKey: "speedBadge",
    color: "text-amber-500",
  },
  {
    titleKey: "relationshipsTitle",
    descriptionKey: "relationshipsDescription",
    href: "/quiz/relationships",
    icon: Users,
    badgeKey: "challengeTitle",
    color: "text-blue-500",
  },
  {
    titleKey: "personalityTitle",
    descriptionKey: "personalityDescription",
    href: "/quiz/personality",
    icon: Sparkles,
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
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Breadcrumbs />

        <div className="text-center mb-12 mt-6">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-xl border border-gold/20 bg-gold/5 backdrop-blur-sm">
              <Brain className="h-10 w-10 text-gold" />
            </div>
          </div>

          <h1 className="font-serif text-display font-bold mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("subtitle")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <BookOpen className="h-5 w-5 text-gold" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">{t("learn")}</div>
                <div className="text-xs text-muted-foreground">
                  {t("learnDescription")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <Brain className="h-5 w-5 text-gold" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">
                  {t("challengeTitle")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t("challengeDescription")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <Trophy className="h-5 w-5 text-gold" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">{t("achieveTitle")}</div>
                <div className="text-xs text-muted-foreground">
                  {t("achieveDescription")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Knowledge Quiz */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-bold mb-6 text-center">
            {t("knowledgeQuizTitle")}
          </h2>
        </div>
        <MythologyQuiz />

        {/* Other Quiz Types */}
        <div className="mb-12 mt-16">
          <h2 className="font-serif text-2xl font-bold mb-6 text-center">
            {t("moreQuizzesTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {OTHER_QUIZZES.map((quiz) => {
              const Icon = quiz.icon;
              return (
                <Link key={quiz.href} href={quiz.href}>
                  <Card className="h-full border-border hover:border-gold/50 transition-all duration-200 hover:shadow-lg group cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div
                          className={`p-3 rounded-xl bg-muted border border-border group-hover:bg-gold/10 transition-colors ${quiz.color}`}
                        >
                          <Icon className="h-6 w-6" />
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

        <section className="mx-auto mb-12 max-w-4xl rounded-2xl border border-border/60 bg-card/60 p-6">
          <h2 className="font-serif text-2xl font-semibold mb-3">
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
