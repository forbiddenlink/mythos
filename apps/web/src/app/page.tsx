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
      <PantheonShowcase />
      <FeaturesGrid />
      <InteractiveStoriesBanner />
      <CollectionsShowcase />
      <DidYouKnow />
      <DailyCard />
      <GamificationSection />
      <CTASection />
    </div>
  );
}
