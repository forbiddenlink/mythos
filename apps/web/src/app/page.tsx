import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesGrid } from '@/components/home/FeaturesGrid';
import { StatsSection } from '@/components/home/StatsSection';
import { PantheonShowcase } from '@/components/home/PantheonShowcase';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesGrid />
      <StatsSection />
      <PantheonShowcase />
      
      {/* Call to Action Section */}
      <section className="py-24 bg-gradient-to-br from-amber-900 via-orange-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Begin Your Journey
          </h2>
          <p className="text-xl text-amber-100 max-w-2xl mx-auto mb-8">
            Explore the divine stories, legendary heroes, and timeless wisdom of ancient civilizations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/deities"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-white text-slate-900 font-semibold hover:bg-amber-50 transition-colors"
            >
              Browse Deities
            </a>
            <a
              href="/stories"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Read Stories
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
