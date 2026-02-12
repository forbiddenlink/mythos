import { SymbolMemoryGame } from '@/components/games/SymbolMemoryGame';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Sparkles, Brain, Timer } from 'lucide-react';
import { generateBaseMetadata } from '@/lib/metadata';

export const metadata = generateBaseMetadata({
  title: 'Symbol Memory Game - Match Deities with Their Symbols',
  description: 'Test your mythology knowledge with this memory matching game. Match ancient deities with their sacred symbols from Greek, Norse, Egyptian, and other pantheons.',
  url: '/games/memory',
  keywords: ['memory game', 'matching game', 'mythology symbols', 'deity symbols', 'Greek symbols', 'Norse symbols', 'educational game'],
});

export default function MemoryGamePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-mythic">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <Breadcrumbs />

        <div className="text-center mb-12 mt-6">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-xl border border-gold/20 bg-gold/5 backdrop-blur-sm">
              <Sparkles className="h-10 w-10 text-gold" />
            </div>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Symbol Memory
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Match ancient deities with their sacred symbols in this classic memory game
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <Sparkles className="h-5 w-5 text-gold" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Match</div>
                <div className="text-xs text-muted-foreground">Symbols to deities</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <Brain className="h-5 w-5 text-gold" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Remember</div>
                <div className="text-xs text-muted-foreground">Train your memory</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
              <div className="p-2 rounded-lg bg-gold/10">
                <Timer className="h-5 w-5 text-gold" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Beat the Clock</div>
                <div className="text-xs text-muted-foreground">Track your best time</div>
              </div>
            </div>
          </div>
        </div>

        <SymbolMemoryGame />
      </div>
    </div>
  );
}
