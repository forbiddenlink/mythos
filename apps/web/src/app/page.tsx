import { CollectionsShowcase } from "@/components/home/CollectionsShowcase";
import { CTASection } from "@/components/home/CTASection";
import { DailyCard } from "@/components/home/DailyCard";
import { DidYouKnow } from "@/components/home/DidYouKnow";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { GamificationSection } from "@/components/home/GamificationSection";
import { HeroSection } from "@/components/home/HeroSection";
import { InteractiveStoriesBanner } from "@/components/home/InteractiveStoriesBanner";
import { PantheonShowcase } from "@/components/home/PantheonShowcase";
import { WebSiteJsonLd } from "@/components/seo/JsonLd";
import { generateBaseMetadata } from "@/lib/metadata";
import Link from "next/link";

export const metadata = generateBaseMetadata({
  title: "Mythos Atlas - Explore World Mythology",
  description:
    "Explore gods, myths, and legendary worlds from 13 civilizations with family trees, quizzes, stories, and interactive mythology tools.",
  url: "/",
  keywords: [
    "mythology",
    "Greek gods",
    "Norse mythology",
    "Egyptian deities",
    "pantheons",
    "family tree",
    "comparative mythology",
    "Elizabeth Stein",
  ],
});

export default function Home() {
  return (
    <div className="min-h-screen">
      <WebSiteJsonLd searchActionTarget="https://mythosatlas.com/?search={search_term_string}" />
      <HeroSection />
      <PantheonShowcase />
      <FeaturesGrid />
      <section className="bg-mythic">
        <div className="container mx-auto max-w-6xl px-4 py-10">
          <div className="mb-6 rounded-3xl border border-border/60 bg-card/60 p-6">
            <h2 className="font-serif text-3xl font-semibold text-foreground">
              Editorial Standards And Policies
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
              Mythos Atlas is an editorial reference project maintained by
              Elizabeth Stein. If you want the project background, source and
              correction routes, or site policies, start with the core pages
              below.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Link
                href="/about"
                className="rounded-xl border border-border bg-background/70 px-4 py-4 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
              >
                About Mythos Atlas
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border border-border bg-background/70 px-4 py-4 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
              >
                Contact Mythos Atlas
              </Link>
              <Link
                href="/privacy"
                className="rounded-xl border border-border bg-background/70 px-4 py-4 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card/60 p-6">
            <h2 className="font-serif text-3xl font-semibold text-foreground">
              Start With A Study Route
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
              If you want more direction than browsing, jump straight into one
              of the practice routes below. They cover rapid recall, game-based
              repetition, relationship knowledge, personality discovery, and a
              strong culture-specific starting point.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Link
                href="/games"
                className="rounded-xl border border-border bg-background/70 px-4 py-4 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
              >
                Mythology Games
              </Link>
              <Link
                href="/quiz/quick"
                className="rounded-xl border border-border bg-background/70 px-4 py-4 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
              >
                Quick Quiz
              </Link>
              <Link
                href="/quiz/relationships"
                className="rounded-xl border border-border bg-background/70 px-4 py-4 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
              >
                Relationships Quiz
              </Link>
              <Link
                href="/quiz/personality"
                className="rounded-xl border border-border bg-background/70 px-4 py-4 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
              >
                Personality Quiz
              </Link>
              <Link
                href="/pantheons/celtic"
                className="rounded-xl border border-border bg-background/70 px-4 py-4 text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
              >
                Celtic Pantheon
              </Link>
            </div>
          </div>
        </div>
      </section>
      <InteractiveStoriesBanner />
      <CollectionsShowcase />
      <DidYouKnow />
      <DailyCard />
      <GamificationSection />
      <CTASection />
    </div>
  );
}
