import { Loader2 } from 'lucide-react';

export default function JourneyDetailLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero placeholder */}
      <div className="relative h-[35vh] min-h-[280px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/70 via-midnight/60 to-midnight/80 z-10" />

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="h-6 w-32 bg-gold/20 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-12 w-80 max-w-full bg-muted/30 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-48 bg-muted/20 rounded-lg mx-auto animate-pulse" />
        </div>
      </div>

      {/* Content placeholder */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map placeholder */}
          <div className="lg:col-span-2">
            <div className="h-[600px] rounded-xl border border-border bg-card flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          </div>

          {/* Sidebar placeholder */}
          <div className="space-y-6">
            <div className="h-64 rounded-xl border border-border bg-card animate-pulse" />
            <div className="h-96 rounded-xl border border-border bg-card animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
