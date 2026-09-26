import { SymbolMemoryGame } from "@/components/games/SymbolMemoryGame";
import { getDeities } from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
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
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Match and remember"
        mark="labyrinth"
        title="Symbol Memory"
        lede="Match ancient deities with their sacred symbols in this classic memory game, and beat your best time."
      />

      <Container className="section-space-sm">
        <SymbolMemoryGame
          deities={project(getDeities(), [
            "id",
            "name",
            "symbols",
            "pantheonId",
          ])}
        />
      </Container>

      <AboutThisPage title="Turn symbol recognition into recall">
        <p>
          The memory board is most useful after you have already read a few
          deity pages. It strips away narrative context and asks whether you
          still remember which symbols belong to which figure once the answer is
          no longer sitting in front of you.
        </p>
        <p>
          Use this game as a bridge between passive reading and harder study. A
          quick round here can tell you whether a symbol has really stuck, and
          it pairs well with the <Link href="/games">full games hub</Link>, the{" "}
          <Link href="/quiz/quick">quick quiz</Link>, and the{" "}
          <Link href="/quiz/relationships">relationships quiz</Link> when you
          want a longer study loop.
        </p>
        <p>
          Short sessions usually work better than long ones. Play a round,
          review the entries you missed, and come back later to check whether
          the symbol pattern now feels automatic.
        </p>
        <p>
          Over time that repetition makes the larger mythology material easier
          to navigate. When a symbol becomes instantly recognizable, stories,
          deity profiles, and comparison pages become faster to read because you
          no longer need to stop and re-learn the same cues.
        </p>
        <p>
          The game is especially useful for crowded pantheons where several
          figures overlap in domain but differ in emblem. Repeating those visual
          distinctions makes later reading cleaner because the symbol starts
          carrying context before you even finish the paragraph.
        </p>
        <p>
          If you miss the same pairings repeatedly, use that as a reading prompt
          rather than just a game score. Open the related entries, study the
          iconography again, and then return for another short round to check
          whether the association now feels automatic.
        </p>
      </AboutThisPage>
    </div>
  );
}
