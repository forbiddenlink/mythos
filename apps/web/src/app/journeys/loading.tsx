import { Compass, Loader2 } from 'lucide-react';

export default function JourneysLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero placeholder */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-midnight/80 z-10" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 rounded-xl border border-gold/20 bg-midnight/50 backdrop-blur-sm animate-pulse">
              <Compass className="h-10 w-10 text-gold/50" strokeWidth={1.5} />
            </div>
          </div>
          <div className="h-8 w-48 bg-gold/20 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-16 w-96 max-w-full bg-muted/30 rounded-lg mx-auto animate-pulse" />
        </div>
      </div>

      {/* Content placeholder */}
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      </div>
    </div>
  );
}
