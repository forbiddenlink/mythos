import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesGrid } from '@/components/home/FeaturesGrid';
import { StatsSection } from '@/components/home/StatsSection';
import { PantheonShowcase } from '@/components/home/PantheonShowcase';
import { CTASection } from '@/components/home/CTASection';
import { ComparativeMythology } from '@/components/mythology/ComparativeMythology';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mythos Atlas - Explore World Mythology',
  description: 'Discover gods, goddesses, and epic tales from Greek, Norse, Egyptian, and world mythologies. Interactive family trees, comparative analysis, and educational resources.',
  keywords: ['mythology', 'Greek gods', 'Norse mythology', 'Egyptian deities', 'pantheons', 'family tree', 'comparative mythology'],
  openGraph: {
    title: 'Mythos Atlas - Journey Through World Mythology',
    description: 'Explore deities, stories, and connections across ancient civilizations',
    type: 'website',
    url: 'https://mythos-web-seven.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mythos Atlas - Explore World Mythology',
    description: 'Discover gods, goddesses, and epic tales from ancient civilizations',
  },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
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
