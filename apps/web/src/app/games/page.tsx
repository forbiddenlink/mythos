import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
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
    kind: "Memory game",
    image: "/deities/thoth.jpg",
  },
  {
    href: "/quiz",
    title: "Quiz Hub",
    description:
      "Switch from games into quizzes when you want faster recall practice and score tracking.",
    kind: "Quizzes",
    image: "/deities/athena.jpg",
  },
  {
    href: "/quiz/quick",
    title: "Quick Quiz",
    description:
      "Use a 60-second sprint when you want rapid mythology recall instead of card matching.",
    kind: "60-second sprint",
    image: "/deities/zeus.jpg",
  },
];

export default function GamesPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Practice"
        mark="labyrinth"
        title="Mythology Games"
        lede="Lightweight study games and challenge modes that turn browsing into active recall."
      />

      <Container className="section-space-sm">
        <ul className="grid gap-4 md:grid-cols-3">
          {games.map((game) => (
            <li key={game.href}>
              <Link
                href={game.href}
                className="dark group relative isolate flex h-full min-h-80 flex-col justify-end overflow-hidden rounded-lg bg-midnight p-6 text-parchment ring-1 ring-border/60 transition-shadow hover:shadow-xl hover:shadow-black/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <Image
                  src={game.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 24rem, 100vw"
                  className="-z-10 object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-linear-to-t from-midnight via-midnight/70 to-midnight/5"
                />
                <span className="type-eyebrow text-gold-light">
                  {game.kind}
                </span>
                <span className="mt-1 font-serif text-2xl font-semibold">
                  {game.title}
                </span>
                <span className="mt-2 font-body text-lg leading-snug text-parchment/85">
                  {game.description}
                </span>
                <span className="mt-4 inline-flex items-center gap-1.5 type-ui font-medium text-gold-light">
                  Play
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      <AboutThisPage title="Learn by playing">
        <p>
          These game modes are meant to reinforce recognition, symbol recall,
          and quick pattern matching. Start with the memory board if you want
          visual repetition, then move into quizzes once you want tighter
          feedback and score tracking.
        </p>
        <p>
          The most effective way to use this section is as part of a loop. Read
          a deity or story page first, then come here to pressure-test what you
          actually retained. That turns browsing into active recall and makes it
          easier to notice which names, symbols, and domains still need
          reinforcement.
        </p>
        <p>
          If you want a broader practice session, branch from games into the{" "}
          <Link href="/quiz/relationships">divine relationships quiz</Link> or
          the <Link href="/quiz/personality">personality quiz</Link>. Those
          routes exercise different kinds of memory and keep the practice area
          from becoming repetitive.
        </p>
        <p>
          Treat this section as the lighter side of a full study cycle. The
          games are most valuable when they reveal what still feels fuzzy after
          you read, which domains you confuse, and which symbols still need one
          more pass through the archive.
        </p>
        <p>
          A useful pattern is to alternate between visual, verbal, and
          relational practice. Use memory for symbols, quick quiz for rapid
          name-and-domain recall, and relationship drills when you want to test
          whether pantheon structure is holding together in your head.
        </p>
        <p>
          That kind of rotation keeps study sessions from flattening into one
          repetitive mechanic. It also gives you clearer feedback about what
          kind of mythology knowledge is improving and what still needs more
          reading, more repetition, or more comparison work.
        </p>
      </AboutThisPage>
    </div>
  );
}
