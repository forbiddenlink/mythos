import { CollectionsShowcase } from "@/components/home/CollectionsShowcase";
import { CTASection } from "@/components/home/CTASection";
import { DidYouKnow } from "@/components/home/DidYouKnow";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { AtlasOpensHero } from "@/components/home/AtlasOpensHero";
import { InteractiveStoriesBanner } from "@/components/home/InteractiveStoriesBanner";
import { PantheonShowcase } from "@/components/home/PantheonShowcase";
import { SyncretismStrip } from "@/components/mythology/SyncretismStrip";
import { WebSiteJsonLd } from "@/components/seo/JsonLd";
import { generateBaseMetadata } from "@/lib/metadata";

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
      {/* Preload the hero background so it stops being a ~8s LCP (CSS bg images
          are discovered late + fetched at low priority otherwise). */}
      <link
        rel="preload"
        as="image"
        href="/hero-columns.webp"
        fetchPriority="high"
      />
      <WebSiteJsonLd searchActionTarget="https://mythosatlas.com/?search={search_term_string}" />
      <AtlasOpensHero />
      <PantheonShowcase />
      <SyncretismStrip />
      <FeaturesGrid />
      <InteractiveStoriesBanner />
      <CollectionsShowcase />
      <DidYouKnow />
      <CTASection />
    </div>
  );
}
