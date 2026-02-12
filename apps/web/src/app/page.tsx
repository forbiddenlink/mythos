import { HeroSection } from '@/components/home/HeroSection';
import { StreakWidget } from '@/components/home/StreakWidget';
import { FeaturesGrid } from '@/components/home/FeaturesGrid';
import { StatsSection } from '@/components/home/StatsSection';
import { PantheonShowcase } from '@/components/home/PantheonShowcase';
import { CTASection } from '@/components/home/CTASection';
import { ComparativeMythology } from '@/components/mythology/ComparativeMythology';
import { WebSiteJsonLd } from '@/components/seo/JsonLd';
import { generateBaseMetadata } from '@/lib/metadata';

export const metadata = generateBaseMetadata({
  title: 'Mythos Atlas - Explore World Mythology',
  description: 'Discover gods, goddesses, and epic tales from Greek, Norse, Egyptian, and world mythologies. Interactive family trees, comparative analysis, and educational resources. Built by Elizabeth Stein.',
  url: '/',
  keywords: ['mythology', 'Greek gods', 'Norse mythology', 'Egyptian deities', 'pantheons', 'family tree', 'comparative mythology', 'Elizabeth Stein'],
});

export default function Home() {
  return (
    <main className="min-h-screen">
      <WebSiteJsonLd
        searchActionTarget="https://mythos-web-seven.vercel.app/?search={search_term_string}"
      />
      <HeroSection />
      <StreakWidget />
      <FeaturesGrid />
      <StatsSection />
      <PantheonShowcase />
      <section className="py-20 bg-gradient-to-b from-mythic to-background">
        <div className="container mx-auto max-w-7xl px-4">
          <ComparativeMythology />
        </div>
      </section>
      <CTASection />
    </main>
  );
}
