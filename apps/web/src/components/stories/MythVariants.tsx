"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  BookMarked,
  ScrollText,
  Info,
} from "lucide-react";

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
    <Card className="border-border bg-card/50 shadow-none overflow-hidden">
      <CardHeader className="pb-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between group cursor-pointer"
          aria-expanded={isExpanded}
          aria-controls="myth-variants-content"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10 border border-gold/25">
              <BookMarked className="h-5 w-5 text-gold" />
            </div>
            <div className="text-left">
              <CardTitle className="text-foreground text-xl font-serif">
                In Other Versions...
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {variants.length} alternate{" "}
                {variants.length === 1 ? "account" : "accounts"} from ancient
                sources
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
          isExpanded ? "max-h-500 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <CardContent className="pt-6">
          <div className="space-y-4">
            {variants.map((variant) => (
              <div
                key={variant.source}
                className="relative p-5 rounded-lg border-l-4 border-gold/50 bg-muted/40 hover:bg-muted/60 transition-colors"
              >
                {/* Source Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ScrollText className="h-4 w-4 text-gold/80" />
                    <span className="font-serif text-gold-text font-medium">
                      {variant.source}
                    </span>
                    {variant.date && (
                      <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
                        {variant.date}
                      </span>
                    )}
                  </div>
                </div>

                {/* Difference */}
                <p className="text-foreground/85 leading-relaxed mb-3">
                  {variant.difference}
                </p>

                {/* Scholar's Note */}
                {variant.note && (
                  <div className="flex items-start gap-2 mt-3 p-3 rounded bg-muted/50 border border-border">
                    <Info className="h-4 w-4 text-gold/60 mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      {variant.note}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Ancient myths evolved across centuries and cultures. These
              variations reflect the rich oral and written traditions that
              preserved these stories.
            </p>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
