import type { Metadata } from "next";
import Link from "next/link";
import { Brain, Grid2x2, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageHero } from "@/components/layout/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythology Games and Study Challenges",
  description:
    "Play mythology learning games and practice tools, including memory challenges that reinforce symbols, stories, and divine figures.",
  url: "/games",
});

const games = [
  {
    href: "/games/memory",
    title: "Symbol Memory",
    description:
      "Match mythological symbols to sharpen recall for gods, creatures, and artifacts.",
    icon: Grid2x2,
  },
  {
    href: "/quiz",
    title: "Quiz Hub",
    description:
      "Switch from games into quizzes when you want faster recall practice and score tracking.",
    icon: Brain,
  },
  {
    href: "/quiz/quick",
    title: "Quick Quiz",
    description:
      "Use a 60-second sprint when you want rapid mythology recall instead of card matching.",
    icon: Sparkles,
  },
];

export default function GamesPage() {
  return (
    <div className="min-h-screen">
      <PageHero
        icon={<Sparkles />}
        tagline="Practice"
        title="Mythology Games"
        description="Use lightweight study games and challenge modes to turn browsing into active recall."
      />

      <div className="container mx-auto max-w-6xl px-4 py-12 bg-mythic">
        <Breadcrumbs />
        <section className="mt-6 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
          <h2 className="font-serif text-2xl text-foreground">
            Learn By Playing
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            These game modes are meant to reinforce recognition, symbol recall,
            and quick pattern matching. Start with the memory board if you want
            visual repetition, then move into quizzes once you want tighter
            feedback and score tracking.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            The most effective way to use this section is as part of a loop.
            Read a deity or story page first, then come here to pressure-test
            what you actually retained. That turns browsing into active recall
            and makes it easier to notice which names, symbols, and domains
            still need reinforcement.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            If you want a broader practice session, branch from games into the{" "}
            <Link
              href="/quiz/relationships"
              className="text-gold underline hover:text-gold/80"
            >
              divine relationships quiz
            </Link>{" "}
            or the{" "}
            <Link
              href="/quiz/personality"
              className="text-gold underline hover:text-gold/80"
            >
              personality quiz
            </Link>
            . Those routes exercise different kinds of memory and keep the
            practice area from becoming repetitive.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            Treat this section as the lighter side of a full study cycle. The
            games are most valuable when they reveal what still feels fuzzy
            after you read, which domains you confuse, and which symbols still
            need one more pass through the archive.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            A useful pattern is to alternate between visual, verbal, and
            relational practice. Use memory for symbols, quick quiz for rapid
            name-and-domain recall, and relationship drills when you want to
            test whether pantheon structure is holding together in your head.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            That kind of rotation keeps study sessions from flattening into one
            repetitive mechanic. It also gives you clearer feedback about what
            kind of mythology knowledge is improving and what still needs more
            reading, more repetition, or more comparison work.
          </p>
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <Card key={game.href} className="bg-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-gold/20 bg-gold/10 p-3">
                      <Icon className="h-5 w-5 text-gold" />
                    </div>
                    <CardTitle className="font-serif text-2xl">
                      {game.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {game.description}
                  </p>
                  <Button asChild className="mt-4">
                    <Link href={game.href}>Open {game.title}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
