'use client';

import { useMemo } from 'react';
import { ComparisonCard, type Deity } from './ComparisonCard';

interface ComparisonTableProps {
  deities: Deity[];
  onRemove: (id: string) => void;
  pantheons: { id: string; name: string }[];
}

export function ComparisonTable({ deities, onRemove, pantheons }: ComparisonTableProps) {
  // Find shared domains across all selected deities
  const { sharedDomains, sharedSymbols } = useMemo(() => {
    if (deities.length < 2) {
      return { sharedDomains: [], sharedSymbols: [] };
    }

    // Get domains/symbols that appear in at least 2 deities
    const domainCounts = new Map<string, number>();
    const symbolCounts = new Map<string, number>();

    deities.forEach((deity) => {
      deity.domain.forEach((d) => {
        const key = d.toLowerCase();
        domainCounts.set(key, (domainCounts.get(key) || 0) + 1);
      });
      deity.symbols.forEach((s) => {
        const key = s.toLowerCase();
        symbolCounts.set(key, (symbolCounts.get(key) || 0) + 1);
      });
    });

    const sharedDomains = Array.from(domainCounts.entries())
      .filter(([, count]) => count >= 2)
      .map(([domain]) => domain);

    const sharedSymbols = Array.from(symbolCounts.entries())
      .filter(([, count]) => count >= 2)
      .map(([symbol]) => symbol);

    return { sharedDomains, sharedSymbols };
  }, [deities]);

  const getPantheonName = (pantheonId: string) => {
    const pantheon = pantheons.find(p => p.id === pantheonId);
    return pantheon?.name || pantheonId.replace('-pantheon', '').replace(/\b\w/g, c => c.toUpperCase());
  };

  if (deities.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <p className="text-muted-foreground text-lg">
          Select deities above to start comparing
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      {(sharedDomains.length > 0 || sharedSymbols.length > 0) && (
        <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Shared Attributes
          </h3>
          <div className="flex flex-wrap gap-4">
            {sharedDomains.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gold" />
                <span className="text-sm">
                  Shared domains: {sharedDomains.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
                </span>
              </div>
            )}
            {sharedSymbols.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600" />
                <span className="text-sm">
                  Shared symbols: {sharedSymbols.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison Grid */}
      <div
        className={`grid gap-6 ${
          deities.length === 1
            ? 'grid-cols-1 max-w-md mx-auto'
            : deities.length === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : deities.length === 3
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {deities.map((deity) => (
          <ComparisonCard
            key={deity.id}
            deity={deity}
            onRemove={onRemove}
            highlightedDomains={sharedDomains}
            highlightedSymbols={sharedSymbols}
            pantheonName={getPantheonName(deity.pantheonId)}
          />
        ))}
      </div>
    </div>
  );
}
