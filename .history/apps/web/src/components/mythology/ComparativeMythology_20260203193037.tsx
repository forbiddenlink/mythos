'use client';

import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_DEITIES, GET_PANTHEONS } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Crown, Zap } from 'lucide-react';
import Link from 'next/link';

interface Deity {
  id: string;
  name: string;
  slug: string;
  domain: string[];
  pantheonId: string;
  symbols: string[];
  gender: string | null;
}

interface Pantheon {
  id: string;
  name: string;
  slug: string;
  culture: string;
}

export function ComparativeMythology() {
  const { data: deitiesData, isLoading: deitiesLoading } = useQuery<{ deities: Deity[] }>({
    queryKey: ['deities-comparative'],
    queryFn: async () => graphqlClient.request(GET_DEITIES),
  });

  const { data: pantheonsData, isLoading: pantheonsLoading } = useQuery<{ pantheons: Pantheon[] }>({
    queryKey: ['pantheons-comparative'],
    queryFn: async () => graphqlClient.request(GET_PANTHEONS),
  });

  if (deitiesLoading || pantheonsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const deities = deitiesData?.deities || [];
  const pantheons = pantheonsData?.pantheons || [];

  // Group deities by domain to find equivalents
  const domainGroups: Record<string, Deity[]> = {};
  deities.forEach(deity => {
    deity.domain.forEach(domain => {
      if (!domainGroups[domain]) {
        domainGroups[domain] = [];
      }
      domainGroups[domain].push(deity);
    });
  });

  // Find interesting comparisons (deities from different pantheons with same domains)
  const comparisons = Object.entries(domainGroups)
    .filter(([_, gods]) => {
      const pantheonIds = new Set(gods.map(g => g.pantheonId));
      return pantheonIds.size >= 2; // At least 2 different pantheons
    })
    .map(([domain, gods]) => ({
      domain,
      deities: gods,
    }))
    .sort((a, b) => b.deities.length - a.deities.length)
    .slice(0, 8); // Top 8 most interesting comparisons

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-bold mb-2">Comparative Mythology</h2>
        <p className="text-muted-foreground">
          Discover parallels and connections across different pantheons
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {comparisons.map(({ domain, deities: groupDeities }) => (
          <Card key={domain} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gold/10 to-transparent">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-gold" />
                <Badge variant="secondary">{domain.charAt(0).toUpperCase() + domain.slice(1)}</Badge>
              </div>
              <CardTitle className="text-xl">
                {groupDeities.length} Deities Across Cultures
              </CardTitle>
              <CardDescription>
                Different pantheons, similar domains
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {groupDeities.slice(0, 4).map(deity => {
                  const pantheon = pantheons.find(p => p.id === deity.pantheonId);
                  return (
                    <Link key={deity.id} href={`/deities/${deity.slug}`}>
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors group">
                        <div className="p-2 rounded-lg bg-gold/10 border border-gold/20 group-hover:bg-gold/15 shrink-0">
                          <Sparkles className="h-4 w-4 text-gold" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold group-hover:text-gold transition-colors">
                            {deity.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {pantheon?.culture || 'Unknown'} • {deity.gender || 'Divine'}
                          </div>
                          {deity.symbols.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {deity.symbols.slice(0, 3).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {groupDeities.length > 4 && (
                  <div className="text-sm text-center text-muted-foreground pt-2">
                    +{groupDeities.length - 4} more deities
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
