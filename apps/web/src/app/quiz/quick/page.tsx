import Link from "next/link";
import { AboutThisPage } from "@/components/layout/about-this-page";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { getDeities } from "@/lib/data/catalog";
import { project } from "@/lib/data/project";
import { QuickQuizPageClient } from "./QuickQuizPageClient";

export default function Page() {
  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Timed recall"
        mark="bolt"
        title="Quick Quiz"
        lede="60 seconds. How many can you get?"
      />
      <Container size="reading" className="section-space-sm">
        <QuickQuizPageClient
          deitiesData={project(getDeities(), [
            "id",
            "name",
            "domain",
            "pantheonId",
          ])}
        />
      </Container>
      <AboutThisPage title="Use the quick quiz for fast recall">
        <p>
          This mode is built for speed rather than long explanation. It works
          best when you want to check whether deity domains and names are
          becoming automatic, especially after reading reference pages or
          finishing a deeper story session.
        </p>
        <p>
          Short bursts are the point. Play a round, note which questions slow
          you down, then branch into the full <Link href="/quiz">quiz hub</Link>
          , the <Link href="/games">games section</Link>, or the relevant deity
          pages before coming back for another timed run.
        </p>
        <p>
          Because every question is compressed into a few seconds of recall, the
          quick quiz is useful as a warm-up, a checkpoint, or a daily habit when
          you do not have time for a longer mythology session. It also helps
          expose clusters of weak recall: if several questions around war, sun,
          or underworld figures keep slowing you down, revisit those deity pages
          before a longer review.
        </p>
        <p>
          Because the quiz is timed, it measures confidence as much as raw
          correctness. A right answer that takes too long usually means the
          concept is still fragile. The best results come from repetition across
          days: one fast round in the morning or after a reading session builds
          a small but reliable habit.
        </p>
      </AboutThisPage>
    </div>
  );
}
