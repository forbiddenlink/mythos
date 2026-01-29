import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesGrid } from '@/components/home/FeaturesGrid';
import { StatsSection } from '@/components/home/StatsSection';
import { PantheonShowcase } from '@/components/home/PantheonShowcase';
import { CTASection } from '@/components/home/CTASection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesGrid />
      <StatsSection />
      <PantheonShowcase />
      <CTASection />
    </main>
  );
}
