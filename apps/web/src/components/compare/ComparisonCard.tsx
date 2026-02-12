'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Deity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  gender: string | null;
  domain: string[];
  symbols: string[];
  description: string | null;
  importanceRank: number | null;
  imageUrl: string | null;
  alternateNames: string[];
  crossPantheonParallels?: {
    pantheonId: string;
    deityId: string;
    note: string;
  }[];
}

interface ComparisonCardProps {
  deity: Deity;
  onRemove: (id: string) => void;
  highlightedDomains?: string[];
  highlightedSymbols?: string[];
  pantheonName?: string;
}

export function ComparisonCard({
  deity,
  onRemove,
  highlightedDomains = [],
  highlightedSymbols = [],
  pantheonName,
}: ComparisonCardProps) {
  const formatPantheonName = (id: string) => {
    return pantheonName || id.replace('-pantheon', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <Card className="h-full flex flex-col relative group">
      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => onRemove(deity.id)}
        aria-label={`Remove ${deity.name} from comparison`}
      >
        <X className="h-4 w-4" />
      </Button>

      <CardHeader className="pb-4">
        {/* Image/Icon */}
        <div className="flex items-center gap-4 mb-4">
          {deity.imageUrl ? (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gold/20 shadow-sm shrink-0">
              <Image
                src={deity.imageUrl}
                alt={deity.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gold/10 border border-gold/20 shrink-0">
              <Sparkles className="h-8 w-8 text-gold" strokeWidth={1.5} />
            </div>
          )}
          <div>
            <CardTitle className="text-xl">
              <Link
                href={`/deities/${deity.slug}`}
                className="hover:text-gold transition-colors"
              >
                {deity.name}
              </Link>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {formatPantheonName(deity.pantheonId)}
            </p>
            {deity.importanceRank && deity.importanceRank <= 5 && (
              <Badge variant="secondary" className="mt-2 bg-gold/10 text-gold border-gold/20">
                Major Deity
              </Badge>
            )}
          </div>
        </div>

        {/* Alternate Names */}
        {deity.alternateNames && deity.alternateNames.length > 0 && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Also known as:</span>{' '}
            {deity.alternateNames.join(', ')}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        {/* Domains */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Domains
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {deity.domain.map((d) => (
              <Badge
                key={d}
                variant={highlightedDomains.includes(d.toLowerCase()) ? 'default' : 'outline'}
                className={cn(
                  'capitalize',
                  highlightedDomains.includes(d.toLowerCase()) && 'bg-gold text-midnight border-gold'
                )}
              >
                {d}
              </Badge>
            ))}
          </div>
        </div>

        {/* Symbols */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Symbols
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {deity.symbols.map((s) => (
              <Badge
                key={s}
                variant={highlightedSymbols.includes(s.toLowerCase()) ? 'default' : 'outline'}
                className={cn(
                  'capitalize',
                  highlightedSymbols.includes(s.toLowerCase()) && 'bg-emerald-600 text-white border-emerald-600'
                )}
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>

        {/* Description */}
        {deity.description && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
              Description
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {deity.description}
            </p>
          </div>
        )}

        {/* Cross-Pantheon Parallels */}
        {deity.crossPantheonParallels && deity.crossPantheonParallels.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
              Cross-Pantheon Parallels
            </h4>
            <ul className="space-y-2">
              {deity.crossPantheonParallels.slice(0, 3).map((parallel, idx) => (
                <li key={idx} className="text-sm">
                  <Link
                    href={`/deities/${parallel.deityId}`}
                    className="text-gold hover:underline font-medium"
                  >
                    {parallel.deityId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </Link>
                  <span className="text-muted-foreground"> ({formatPantheonName(parallel.pantheonId)})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
