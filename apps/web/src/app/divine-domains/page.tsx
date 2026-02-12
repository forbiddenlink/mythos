'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Compass, Sparkles, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { DomainSelector, getDomainIcon, PRIMARY_DOMAINS } from '@/components/domains/DomainSelector';
import { DomainDeityCard } from '@/components/domains/DomainDeityCard';
import deitiesData from '@/data/deities.json';
import pantheonsData from '@/data/pantheons.json';
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
  importanceRank?: number | null;
  crossPantheonParallels?: CrossPantheonParallel[];
}

interface Pantheon {
  id: string;
  name: string;
  slug: string;
}

// Get pantheon name by ID
function getPantheonName(pantheonId: string): string {
  const pantheon = (pantheonsData as Pantheon[]).find(p => p.id === pantheonId);
  return pantheon?.name.replace(' Pantheon', '') || pantheonId;
}

// Capitalize first letter
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Pantheon color mapping
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

export default function DivinDomainsPage() {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [pantheonFilter, setPantheonFilter] = useState<string>('all');

  const deities = deitiesData as Deity[];

  // Get all unique domains from deities
  const allDomains = useMemo(() => {
    const domainSet = new Set<string>();
    deities.forEach(deity => {
      deity.domain?.forEach(d => domainSet.add(d.toLowerCase()));
    });
    return Array.from(domainSet).sort();
  }, [deities]);

  // Filter deities by selected domain
  const filteredDeities = useMemo(() => {
    if (!selectedDomain) return [];
    return deities.filter(deity =>
      deity.domain?.some(d => d.toLowerCase() === selectedDomain.toLowerCase())
    );
  }, [deities, selectedDomain]);

  // Further filter by pantheon
  const displayDeities = useMemo(() => {
    if (pantheonFilter === 'all') return filteredDeities;
    return filteredDeities.filter(d => d.pantheonId === pantheonFilter);
  }, [filteredDeities, pantheonFilter]);

  // Get available pantheons for the selected domain
  const availablePantheons = useMemo(() => {
    if (!selectedDomain) return [];
    const pantheonIds = [...new Set(filteredDeities.map(d => d.pantheonId))];
    return pantheonIds
      .map(id => ({
        id,
        name: getPantheonName(id),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedDomain, filteredDeities]);

  // Find cross-pantheon connections for the selected domain
  const crossPantheonConnections = useMemo(() => {
    if (!selectedDomain) return [];

    const connections: Array<{
      from: Deity;
      to: Deity;
      note: string;
    }> = [];

    filteredDeities.forEach(deity => {
      deity.crossPantheonParallels?.forEach(parallel => {
        const connectedDeity = deities.find(d => d.id === parallel.deityId);
        if (
          connectedDeity &&
          connectedDeity.domain?.some(d => d.toLowerCase() === selectedDomain.toLowerCase())
        ) {
          // Avoid duplicates (A->B and B->A)
          const exists = connections.some(
            c =>
              (c.from.id === deity.id && c.to.id === connectedDeity.id) ||
              (c.from.id === connectedDeity.id && c.to.id === deity.id)
          );
          if (!exists) {
            connections.push({
              from: deity,
              to: connectedDeity,
              note: parallel.note || '',
            });
          }
        }
      });
    });

    return connections;
  }, [selectedDomain, filteredDeities, deities]);

  // Calculate domain statistics
  const domainStats = useMemo(() => {
    const stats: Record<string, { count: number; pantheons: Set<string> }> = {};
    deities.forEach(deity => {
      deity.domain?.forEach(domain => {
        const key = domain.toLowerCase();
        if (!stats[key]) {
          stats[key] = { count: 0, pantheons: new Set() };
        }
        stats[key].count++;
        stats[key].pantheons.add(deity.pantheonId);
      });
    });
    return stats;
  }, [deities]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background - gradient with subtle effects */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-midnight via-midnight/95 to-midnight">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
          </div>
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/50 via-midnight/40 to-midnight/80 z-10" />

        {/* Radial gold glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-gold/10 via-transparent to-transparent z-10" />

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <div className="relative p-4 rounded-xl border border-gold/20 bg-midnight/50 backdrop-blur-sm">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/10 to-transparent" />
              <Compass className="relative h-10 w-10 text-gold" strokeWidth={1.5} />
            </div>
          </div>
          <span className="inline-block text-gold/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            Cross-Pantheon Comparison
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 text-parchment">
            Divine Domains
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto font-body leading-relaxed">
            Compare deities across all pantheons who share the same divine sphere of influence - from war and wisdom to love and death
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto max-w-7xl px-4 py-16 bg-mythic">
        <Breadcrumbs />

        {/* Domain Selector */}
        <div className="mt-8 mb-10">
          <h2 className="text-lg font-serif font-medium text-foreground mb-4">
            Select a Domain
          </h2>
          <DomainSelector
            selectedDomain={selectedDomain}
            onDomainSelect={domain => {
              setSelectedDomain(domain);
              setPantheonFilter('all');
            }}
            availableDomains={allDomains}
          />
        </div>

        {selectedDomain ? (
          <>
            {/* Domain Header with Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-border/50">
              <div className="flex items-center gap-4">
                {(() => {
                  const Icon = getDomainIcon(selectedDomain);
                  return (
                    <div className="p-3 rounded-xl bg-gold/10 border border-gold/20">
                      <Icon className="h-8 w-8 text-gold" strokeWidth={1.5} />
                    </div>
                  );
                })()}
                <div>
                  <h2 className="font-serif text-3xl font-semibold text-parchment">
                    {capitalize(selectedDomain)}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {filteredDeities.length} deities across {availablePantheons.length} pantheons
                  </p>
                </div>
              </div>

              {/* Pantheon Filter */}
              {availablePantheons.length > 1 && (
                <Select value={pantheonFilter} onValueChange={setPantheonFilter}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Filter by pantheon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pantheons ({filteredDeities.length})</SelectItem>
                    {availablePantheons.map(pantheon => {
                      const count = filteredDeities.filter(d => d.pantheonId === pantheon.id).length;
                      return (
                        <SelectItem key={pantheon.id} value={pantheon.id}>
                          {pantheon.name} ({count})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Cross-Pantheon Connections */}
            {crossPantheonConnections.length > 0 && pantheonFilter === 'all' && (
              <div className="mb-10 p-6 rounded-xl bg-card/50 border border-gold/10">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-5 w-5 text-gold" />
                  <h3 className="font-serif text-lg font-medium text-foreground">
                    Cross-Pantheon Parallels
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  These deities share similar roles across different mythological traditions
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {crossPantheonConnections.slice(0, 6).map((connection, index) => (
                    <div
                      key={`${connection.from.id}-${connection.to.id}-${index}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
                    >
                      {/* From Deity */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {connection.from.imageUrl ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gold/20 flex-shrink-0">
                            <Image
                              src={connection.from.imageUrl}
                              alt={connection.from.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-4 w-4 text-gold" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {connection.from.name}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn('text-[10px] px-1.5 py-0', getPantheonColor(connection.from.pantheonId))}
                          >
                            {getPantheonName(connection.from.pantheonId)}
                          </Badge>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="h-4 w-4 text-gold/60 flex-shrink-0 mx-1" />

                      {/* To Deity */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {connection.to.imageUrl ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gold/20 flex-shrink-0">
                            <Image
                              src={connection.to.imageUrl}
                              alt={connection.to.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-4 w-4 text-gold" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {connection.to.name}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn('text-[10px] px-1.5 py-0', getPantheonColor(connection.to.pantheonId))}
                          >
                            {getPantheonName(connection.to.pantheonId)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {crossPantheonConnections.length > 6 && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    And {crossPantheonConnections.length - 6} more connections...
                  </p>
                )}
              </div>
            )}

            {/* Deity Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayDeities.map(deity => (
                <DomainDeityCard
                  key={deity.id}
                  deity={deity}
                  pantheonName={getPantheonName(deity.pantheonId)}
                  selectedDomain={selectedDomain}
                  allDeities={deities}
                />
              ))}
            </div>

            {displayDeities.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No deities found for this domain in the selected pantheon.
                </p>
              </div>
            )}
          </>
        ) : (
          /* Domain Overview Cards */
          <>
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                Browse Domains
              </h2>
              <p className="text-muted-foreground">
                Select a domain above or click on a domain card below to see all deities who share that sphere of influence
              </p>
            </div>

            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {PRIMARY_DOMAINS.map(domain => {
                const Icon = domain.icon;
                const stats = domainStats[domain.id] || { count: 0, pantheons: new Set() };
                const pantheonCount = stats.pantheons?.size || 0;

                return (
                  <Card
                    key={domain.id}
                    className="group cursor-pointer card-elevated bg-card hover:scale-[1.02] transition-all duration-300"
                    onClick={() => setSelectedDomain(domain.id)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedDomain(domain.id);
                      }
                    }}
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="p-3 rounded-xl bg-gold/10 border border-gold/20 group-hover:bg-gold/15 transition-colors duration-300 mb-4">
                        <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-gold transition-colors duration-300">
                        {domain.label}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {stats.count} {stats.count === 1 ? 'deity' : 'deities'}
                      </p>
                      {pantheonCount > 1 && (
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {pantheonCount} pantheons
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Additional Domains Section */}
            <div className="mt-12">
              <h3 className="font-serif text-xl font-medium text-foreground mb-4">
                All Domains
              </h3>
              <div className="flex flex-wrap gap-2">
                {allDomains
                  .filter(d => !PRIMARY_DOMAINS.some(pd => pd.id === d))
                  .map(domain => {
                    const stats = domainStats[domain] || { count: 0 };
                    return (
                      <button
                        key={domain}
                        onClick={() => setSelectedDomain(domain)}
                        className="px-3 py-1.5 text-sm rounded-full bg-muted/50 hover:bg-muted text-foreground/80 hover:text-foreground border border-border/50 hover:border-border transition-colors"
                      >
                        {capitalize(domain)} ({stats.count})
                      </button>
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
