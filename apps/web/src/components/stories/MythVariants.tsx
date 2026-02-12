'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, BookMarked, ScrollText, Info } from 'lucide-react';

export interface MythVariant {
  source: string;
  date?: string;
  difference: string;
  note?: string;
}

interface MythVariantsProps {
  variants: MythVariant[];
}

export function MythVariants({ variants }: MythVariantsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <Card className="border-gold/20 bg-midnight-light/50 overflow-hidden">
      <CardHeader className="pb-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between group cursor-pointer"
          aria-expanded={isExpanded}
          aria-controls="myth-variants-content"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <BookMarked className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-left">
              <CardTitle className="text-parchment text-xl font-serif">
                In Other Versions...
              </CardTitle>
              <p className="text-sm text-parchment/60 mt-1">
                {variants.length} alternate {variants.length === 1 ? 'account' : 'accounts'} from ancient sources
              </p>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-gold/10 group-hover:bg-gold/20 transition-colors">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gold" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gold" />
            )}
          </div>
        </button>
      </CardHeader>

      <div
        id="myth-variants-content"
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <CardContent className="pt-6">
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div
                key={index}
                className="relative p-5 rounded-lg border-l-4 border-amber-500/60 bg-midnight/40 hover:bg-midnight/60 transition-colors"
              >
                {/* Source Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ScrollText className="h-4 w-4 text-amber-500/80" />
                    <span className="font-serif text-amber-400 font-medium">
                      {variant.source}
                    </span>
                    {variant.date && (
                      <span className="text-xs text-parchment/40 px-2 py-0.5 bg-midnight/50 rounded">
                        {variant.date}
                      </span>
                    )}
                  </div>
                </div>

                {/* Difference */}
                <p className="text-parchment/85 leading-relaxed mb-3">
                  {variant.difference}
                </p>

                {/* Scholar's Note */}
                {variant.note && (
                  <div className="flex items-start gap-2 mt-3 p-3 rounded bg-midnight/30 border border-gold/10">
                    <Info className="h-4 w-4 text-gold/60 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-parchment/60 italic leading-relaxed">
                      {variant.note}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t border-gold/10">
            <p className="text-xs text-parchment/40 text-center">
              Ancient myths evolved across centuries and cultures. These variations reflect the rich oral and written traditions that preserved these stories.
            </p>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
