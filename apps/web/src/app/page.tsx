import { DailyChallengeBanner } from "@/components/challenges/DailyChallengeBanner";
import { CollectionsShowcase } from "@/components/home/CollectionsShowcase";
import { CTASection } from "@/components/home/CTASection";
import { DailyCard } from "@/components/home/DailyCard";
import { DidYouKnow } from "@/components/home/DidYouKnow";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { HeroSection } from "@/components/home/HeroSection";
import { InteractiveStoriesBanner } from "@/components/home/InteractiveStoriesBanner";
import { PantheonShowcase } from "@/components/home/PantheonShowcase";
import { StatsSection } from "@/components/home/StatsSection";
import { StreakWidget } from "@/components/home/StreakWidget";
import { LeaderboardWidget } from "@/components/leaderboard/LeaderboardWidget";
import { ComparativeMythology } from "@/components/mythology/ComparativeMythology";
import { WebSiteJsonLd } from "@/components/seo/JsonLd";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata = generateBaseMetadata({
  title: "Mythos Atlas - Explore World Mythology",
  description:
    "Discover gods, goddesses, and epic tales from Greek, Norse, Egyptian, and world mythologies. Interactive family trees, comparative analysis, and educational resources. Built by Elizabeth Stein.",
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
      <StreakWidget />
      <DailyChallengeBanner />
      <DailyCard />
      <DidYouKnow />
      <CollectionsShowcase />
      <InteractiveStoriesBanner />
      <LeaderboardWidget />
      <FeaturesGrid />
      <StatsSection />
      <PantheonShowcase />
      <section className="py-20 bg-linear-to-b from-mythic to-background">
        <div className="container mx-auto max-w-7xl px-4">
          <ComparativeMythology />
        </div>
      </section>
      <CTASection />
    </div>
  );
}
