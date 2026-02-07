'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X, SortAsc, SortDesc } from 'lucide-react';

interface Deity {
  id: string;
  name: string;
  slug: string;
  gender: string | null;
  domain: string[];
  symbols: string[];
  description: string | null;
  importanceRank: number | null;
  imageUrl: string | null;
  alternateNames: string[];
  pantheonId?: string;
}

interface DeityFiltersProps {
  deities: Deity[];
  onFilteredChange: (filtered: Deity[]) => void;
}

export function DeityFilters({ deities, onFilteredChange }: DeityFiltersProps) {
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [pantheonFilter, setPantheonFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('importance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const allDomains = Array.from(
    new Set(deities.flatMap(d => d.domain || []))
  ).sort();

  const allPantheons = Array.from(
    new Set(deities.map(d => d.pantheonId).filter(Boolean) as string[])
  ).sort();

  const applyFilters = () => {
    let filtered = [...deities];

    // Apply gender filter
    if (genderFilter !== 'all') {
      filtered = filtered.filter(d => d.gender === genderFilter);
    }

    // Apply domain filter
    if (domainFilter !== 'all') {
      filtered = filtered.filter(d => d.domain?.includes(domainFilter));
    }

    // Apply pantheon filter
    if (pantheonFilter !== 'all') {
      filtered = filtered.filter(d => d.pantheonId === pantheonFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'importance':
          const rankA = a.importanceRank || 999;
          const rankB = b.importanceRank || 999;
          comparison = rankA - rankB;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    onFilteredChange(filtered);
  };

  // Apply filters whenever any filter changes
  useState(() => {
    applyFilters();
  });

  const resetFilters = () => {
    setGenderFilter('all');
    setDomainFilter('all');
    setPantheonFilter('all');
    setSortBy('importance');
    setSortOrder('asc');
    onFilteredChange(deities);
  };

  const hasActiveFilters = genderFilter !== 'all' || domainFilter !== 'all' || pantheonFilter !== 'all';

  return (
    <Card className="p-4 mb-6 bg-card overflow-hidden">
      <div className="flex items-center gap-4 overflow-x-auto pb-2 -mb-2 scrollbar-thin">
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <Select value={pantheonFilter} onValueChange={(value) => {
          setPantheonFilter(value);
          setTimeout(applyFilters, 0);
        }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Pantheon" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pantheons</SelectItem>
            {allPantheons.map(pantheon => (
              <SelectItem key={pantheon} value={pantheon}>
                {pantheon.replace('-pantheon', '').replace(/^\w/, c => c.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={genderFilter} onValueChange={(value) => {
          setGenderFilter(value);
          setTimeout(applyFilters, 0);
        }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>

        <Select value={domainFilter} onValueChange={(value) => {
          setDomainFilter(value);
          setTimeout(applyFilters, 0);
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {allDomains.slice(0, 20).map(domain => (
              <SelectItem key={domain} value={domain}>
                {domain.charAt(0).toUpperCase() + domain.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="h-6 w-px bg-border shrink-0" />

        <Select value={sortBy} onValueChange={(value) => {
          setSortBy(value);
          setTimeout(applyFilters, 0);
        }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="importance">Importance</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            setTimeout(applyFilters, 0);
          }}
          className="shrink-0"
        >
          {sortOrder === 'asc' ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </Button>

        {hasActiveFilters && (
          <>
            <div className="h-6 w-px bg-border shrink-0" />
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="gap-2 shrink-0"
            >
              <X className="h-4 w-4" />
              Reset
            </Button>
          </>
        )}

        <div className="ml-auto text-sm text-muted-foreground shrink-0 pl-4">
          {deities.length} {deities.length === 1 ? 'deity' : 'deities'}
        </div>
      </div>
    </Card>
  );
}
