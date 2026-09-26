import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Container } from "@/components/layout/container";
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
    <div className="min-h-screen">
      <Container className="pt-5">
        <Breadcrumbs />
      </Container>
      <Container size="reading" className="section-space-sm">
        <div className="dark relative isolate overflow-hidden rounded-lg bg-midnight px-6 py-12 text-center text-foreground shadow-xl shadow-black/10 md:px-12 md:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_65%_60%_at_50%_0%,color-mix(in_oklch,var(--gold)_24%,transparent),transparent_70%)]"
          />
          <p className="type-eyebrow text-gold-light">
            {quizLabel(parsed.quizId)}
          </p>

          <div className="mt-6 flex items-baseline justify-center gap-3">
            <span className="font-serif text-7xl font-semibold tabular-nums text-gold-light md:text-8xl">
              {score}
            </span>
            <span className="font-serif text-4xl tabular-nums text-parchment/70">
              / {total}
            </span>
          </div>

          <h1 className="page-title mt-4 text-parchment">{verdict.title}</h1>

          <p className="type-lede mx-auto mt-4 max-w-xl text-parchment/85">
            {verdict.blurb}
          </p>

          <p className="mt-2 type-ui text-parchment/70">{percent}% correct</p>

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
        </div>

        <div className="mt-12">
          <SupportNudge moment="quiz_completed" placement="quiz_result_page" />
        </div>

        <p className="mt-12 type-reading text-muted-foreground">
          Mythos Atlas is an interactive encyclopedia of world mythology:{" "}
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
      </Container>
    </div>
  );
}
