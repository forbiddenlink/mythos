import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageHero } from "@/components/layout/page-hero";
import { generateBaseMetadata } from "@/lib/metadata";
import { AnkiDeckExport } from "@/components/learning/AnkiDeckExport";
import { listGuides } from "./_guides";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythology Study Guides & Anki Decks",
  description:
    "Structured study routes and exportable spaced-repetition Anki flashcard decks for Greek, Norse, and comparative world mythology.",
  url: "/study",
  keywords: [
    "mythology study guide",
    "learn Greek gods",
    "Norse mythology guide",
    "comparative mythology",
    "Anki mythology deck",
    "mythology flashcards",
  ],
});

export default function StudyIndexPage() {
  const guides = listGuides();

  return (
    <div className="min-h-screen">
      <PageHero
        mark="torch"
        tagline="For learners & researchers"
        title="Study Guides & Tools"
        description="Focused curriculum routes and spaced-repetition tools that turn Mythos from a browse-and-hope encyclopedia into an active study loop."
      />
      <div className="container mx-auto max-w-4xl px-4 py-12 bg-mythic space-y-12">
        <Breadcrumbs />

        {/* Study Guides List */}
        <section>
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
            Curated Study Routes
          </h2>
          <ul className="space-y-4">
            {guides.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/study/${guide.slug}`}
                  className="block border border-border/60 bg-card/60 p-5 transition-all hover:border-gold/50 hover:shadow-md hover:shadow-gold/5 rounded-lg"
                >
                  <h3 className="font-serif text-2xl text-foreground hover:text-gold transition-colors">
                    {guide.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {guide.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Anki Flashcard Exporter Tool */}
        <section>
          <AnkiDeckExport />
        </section>
      </div>
    </div>
  );
}
