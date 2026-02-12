'use client';

import Image from 'next/image';
import { TransitionLink } from '@/components/transitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrossPantheonParallel {
  pantheonId: string;
  deityId: string;
  note?: string;
}

interface Deity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  domain: string[];
  description?: string | null;
  imageUrl?: string | null;
  alternateNames?: string[];
  crossPantheonParallels?: CrossPantheonParallel[];
}

interface DomainDeityCardProps {
  deity: Deity;
  pantheonName: string;
  selectedDomain?: string | null;
  allDeities?: Deity[];
  className?: string;
}

// Capitalize first letter of each word
function capitalize(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Pantheon color mapping for badges
const PANTHEON_COLORS: Record<string, string> = {
  'greek-pantheon': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'roman-pantheon': 'bg-red-500/20 text-red-400 border-red-500/30',
  'norse-pantheon': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'egyptian-pantheon': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'hindu-pantheon': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'japanese-pantheon': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'celtic-pantheon': 'bg-green-500/20 text-green-400 border-green-500/30',
  'aztec-pantheon': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'chinese-pantheon': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

function getPantheonColor(pantheonId: string): string {
  return PANTHEON_COLORS[pantheonId] || 'bg-gold/20 text-gold border-gold/30';
}

export function DomainDeityCard({
  deity,
  pantheonName,
  selectedDomain,
  allDeities = [],
  className,
}: DomainDeityCardProps) {
  // Find cross-pantheon connections that share the selected domain
  const connections = deity.crossPantheonParallels
    ?.map(parallel => {
      const connectedDeity = allDeities.find(d => d.id === parallel.deityId);
      if (!connectedDeity) return null;
      // Check if connected deity also has the selected domain
      if (
        selectedDomain &&
        !connectedDeity.domain.some(d => d.toLowerCase() === selectedDomain.toLowerCase())
      ) {
        return null;
      }
      return { parallel, deity: connectedDeity };
    })
    .filter(Boolean) as Array<{ parallel: CrossPantheonParallel; deity: Deity }> | undefined;

  const otherDomains = deity.domain
    .filter(d => d.toLowerCase() !== selectedDomain?.toLowerCase())
    .slice(0, 3);

  return (
    <TransitionLink href={`/deities/${deity.slug}`} className="group block">
      <Card
        asArticle
        className={cn(
          'h-full cursor-pointer card-elevated bg-card hover:scale-[1.01] transition-all duration-300',
          className
        )}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            {/* Deity Image with shared element transition */}
            {deity.imageUrl ? (
              <div
                className="relative w-20 h-20 rounded-xl overflow-hidden border border-gold/20 shadow-sm flex-shrink-0"
                style={{ viewTransitionName: `deity-image-${deity.slug}` }}
              >
                <Image
                  src={deity.imageUrl}
                  alt={deity.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div
                className="p-4 rounded-xl bg-gold/10 border border-gold/20 group-hover:bg-gold/15 transition-colors duration-300 flex-shrink-0"
                style={{ viewTransitionName: `deity-image-${deity.slug}` }}
              >
                <Sparkles className="h-8 w-8 text-gold" strokeWidth={1.5} />
              </div>
            )}

            {/* Name and Pantheon */}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-foreground group-hover:text-gold transition-colors duration-300">
                {deity.name}
              </CardTitle>
              <Badge
                variant="outline"
                className={cn('mt-2 text-xs', getPantheonColor(deity.pantheonId))}
              >
                {pantheonName}
              </Badge>
              {deity.alternateNames && deity.alternateNames.length > 0 && (
                <p className="text-xs text-muted-foreground/70 mt-2">
                  Also known as: {deity.alternateNames.slice(0, 2).join(', ')}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* Description */}
          {deity.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {deity.description}
            </p>
          )}

          {/* Other Domains */}
          {otherDomains.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {otherDomains.map(domain => (
                <Badge
                  key={domain}
                  variant="secondary"
                  className="text-xs bg-muted/50 hover:bg-muted"
                >
                  {capitalize(domain)}
                </Badge>
              ))}
            </div>
          )}

          {/* Cross-Pantheon Connections */}
          {connections && connections.length > 0 && (
            <div className="pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                Cross-Pantheon Parallels:
              </p>
              <div className="space-y-1.5">
                {connections.slice(0, 2).map(({ parallel, deity: connectedDeity }) => (
                  <div
                    key={parallel.deityId}
                    className="flex items-center gap-2 text-xs text-muted-foreground/80"
                  >
                    <ArrowRight className="h-3 w-3 text-gold/60" />
                    <span className="font-medium text-foreground/80">{connectedDeity.name}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] px-1.5 py-0',
                        getPantheonColor(parallel.pantheonId)
                      )}
                    >
                      {parallel.pantheonId.replace('-pantheon', '').replace(/^\w/, c => c.toUpperCase())}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TransitionLink>
  );
}
