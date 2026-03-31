import { SymbolMemoryGame } from "@/components/games/SymbolMemoryGame";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { Sparkles, Brain, Timer } from "lucide-react";
import { generateBaseMetadata } from "@/lib/metadata";
import Link from "next/link";

export const metadata = generateBaseMetadata({
  title: "Mythology Symbol Memory Game",
  description:
    "Test your mythology knowledge with this memory matching game. Match ancient deities with their sacred symbols from Greek, Norse, Egyptian, and other pantheons.",
  url: "/games/memory",
  keywords: [
    "memory game",
    "matching game",
    "mythology symbols",
    "deity symbols",
    "Greek symbols",
    "Norse symbols",
    "educational game",
  ],
});

export default function MemoryGamePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-mythic">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Breadcrumbs />

        <div className="text-center mb-12 mt-6">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-xl border border-gold/20 bg-gold/5 backdrop-blur-sm">
              <Sparkles className="h-10 w-10 text-gold" />
            </div>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Symbol Memory
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Match ancient deities with their sacred symbols in this classic
            memory game
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <Sparkles className="h-5 w-5 text-gold" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Match</div>
                <div className="text-xs text-muted-foreground">
                  Symbols to deities
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <Brain className="h-5 w-5 text-gold" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Remember</div>
                <div className="text-xs text-muted-foreground">
                  Train your memory
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <Timer className="h-5 w-5 text-gold" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Beat the Clock</div>
                <div className="text-xs text-muted-foreground">
                  Track your best time
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mx-auto mb-12 max-w-4xl rounded-2xl border border-border/60 bg-card/60 p-6">
          <h2 className="font-serif text-2xl font-semibold mb-3">
            Turn Symbol Recognition Into Recall
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The memory board is most useful after you have already read a few
            deity pages. It strips away narrative context and asks whether you
            still remember which symbols belong to which figure once the answer
            is no longer sitting in front of you.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Use this game as a bridge between passive reading and harder study.
            A quick round here can tell you whether a symbol has really stuck,
            and it pairs well with the{" "}
            <Link
              href="/games"
              className="text-gold underline hover:text-gold/80"
            >
              full games hub
            </Link>
            , the{" "}
            <Link
              href="/quiz/quick"
              className="text-gold underline hover:text-gold/80"
            >
              quick quiz
            </Link>
            , and the{" "}
            <Link
              href="/quiz/relationships"
              className="text-gold underline hover:text-gold/80"
            >
              relationships quiz
            </Link>{" "}
            when you want a longer study loop.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Short sessions usually work better than long ones. Play a round,
            review the entries you missed, and come back later to check whether
            the symbol pattern now feels automatic.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Over time that repetition makes the larger mythology material easier
            to navigate. When a symbol becomes instantly recognizable, stories,
            deity profiles, and comparison pages become faster to read because
            you no longer need to stop and re-learn the same cues.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            The game is especially useful for crowded pantheons where several
            figures overlap in domain but differ in emblem. Repeating those
            visual distinctions makes later reading cleaner because the symbol
            starts carrying context before you even finish the paragraph.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            If you miss the same pairings repeatedly, use that as a reading
            prompt rather than just a game score. Open the related entries,
            study the iconography again, and then return for another short round
            to check whether the association now feels automatic.
          </p>
        </section>

        <SymbolMemoryGame />
      </div>
    </div>
  );
}
