import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { SupportNudge } from "@/components/support/SupportNudge";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/sharing/ShareButton";
import { generateBaseMetadata, siteConfig } from "@/lib/metadata";
import {
  parseQuizResultSlug,
  quizLabel,
  quizResultVerdict,
} from "@/lib/quiz-share";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ result: string }>;
}): Promise<Metadata> {
  const { result } = await params;
  const parsed = parseQuizResultSlug(result);

  if (!parsed) {
    return generateBaseMetadata({
      title: "Quiz result",
      description: "Take the Mythos Atlas mythology quiz.",
      url: "/quiz",
    });
  }

  const verdict = quizResultVerdict(parsed.score, parsed.total);

  return generateBaseMetadata({
    title: `${verdict.title} — ${parsed.score}/${parsed.total}`,
    description: `${verdict.blurb} Take the ${quizLabel(parsed.quizId)} on Mythos Atlas and see how you compare.`,
    url: `/quiz/result/${result}`,
    // Passed explicitly: generateBaseMetadata always sets openGraph.images,
    // which overrides the opengraph-image file convention and would put the
    // generic site card on every shared score.
    image: `${siteConfig.url}/quiz/result/${result}/opengraph-image`,
  });
}

/**
 * A shareable landing page for a quiz score.
 *
 * The score is in the path rather than a query string so the Open Graph card
 * can render it: social crawlers request the image route without any query,
 * which is why a query-based score always produced a generic card.
 */
export default async function QuizResultPage({
  params,
}: {
  params: Promise<{ result: string }>;
}) {
  const { result } = await params;
  const parsed = parseQuizResultSlug(result);

  if (!parsed) {
    notFound();
  }

  const { score, total } = parsed;
  const quizHref =
    parsed.quizId === "relationships"
      ? "/quiz/relationships"
      : parsed.quizId === "daily"
        ? "/#todays-myth"
        : "/quiz";
  const percent = Math.round((score / total) * 100);
  const verdict = quizResultVerdict(score, total);

  return (
    <div className="min-h-screen bg-mythic">
      <div className="page-shell">
        <Breadcrumbs />
        <div className="mx-auto mt-12 max-w-2xl text-center">
          <p className="page-eyebrow text-gold-text">
            {quizLabel(parsed.quizId)}
          </p>

          <div className="mt-6 flex items-baseline justify-center gap-3">
            <span className="font-display text-7xl font-bold text-gold">
              {score}
            </span>
            <span className="font-display text-4xl text-gold/60">
              / {total}
            </span>
          </div>

          <h1 className="page-title mt-4 text-foreground">{verdict.title}</h1>

          <p className="mt-4 font-body text-xl leading-relaxed text-muted-foreground">
            {verdict.blurb}
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            {percent}% correct
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="gold" size="lg">
              <Link href={quizHref}>Beat this score</Link>
            </Button>
            <ShareButton
              surface="quiz_result_page"
              title="Mythos Atlas quiz result"
              text={`I scored ${score}/${total} on the ${quizLabel(parsed.quizId)}. Can you beat it?`}
              url={`https://mythosatlas.com/quiz/result/${result}`}
            />
          </div>

          <div className="mt-12 text-left">
            <SupportNudge
              moment="quiz_completed"
              placement="quiz_result_page"
            />
          </div>

          <p className="mt-12 font-body text-lg leading-relaxed text-muted-foreground">
            Mythos Atlas is an interactive encyclopedia of world mythology —{" "}
            <Link
              href="/pantheons"
              className="text-gold-text underline underline-offset-4"
            >
              browse the pantheons
            </Link>{" "}
            or{" "}
            <Link
              href="/stories"
              className="text-gold-text underline underline-offset-4"
            >
              read the stories
            </Link>{" "}
            behind the questions.
          </p>
        </div>
      </div>
    </div>
  );
}
