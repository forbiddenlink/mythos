'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Deity } from './ComparisonCard';

interface ComparisonSelectorProps {
  deities: Deity[];
  selectedDeities: Deity[];
  onSelect: (deity: Deity) => void;
  onRemove: (id: string) => void;
  maxSelection?: number;
  pantheons: { id: string; name: string }[];
}

export function ComparisonSelector({
  deities,
  selectedDeities,
  onSelect,
  onRemove,
  maxSelection = 4,
  pantheons,
}: ComparisonSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPantheon, setSelectedPantheon] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectedIds = useMemo(() => new Set(selectedDeities.map(d => d.id)), [selectedDeities]);

  const filteredDeities = useMemo(() => {
    return deities.filter((deity) => {
      // Exclude already selected
      if (selectedIds.has(deity.id)) return false;

      // Filter by pantheon
      if (selectedPantheon && deity.pantheonId !== selectedPantheon) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = deity.name.toLowerCase().includes(query);
        const matchesAltNames = deity.alternateNames?.some(n => n.toLowerCase().includes(query));
        const matchesDomain = deity.domain.some(d => d.toLowerCase().includes(query));
        return matchesName || matchesAltNames || matchesDomain;
      }

      return true;
    });
  }, [deities, selectedIds, selectedPantheon, searchQuery]);

  const handleSelect = (deity: Deity) => {
    if (selectedDeities.length < maxSelection) {
      onSelect(deity);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  const getPantheonName = (pantheonId: string) => {
    const pantheon = pantheons.find(p => p.id === pantheonId);
    return pantheon?.name || pantheonId.replace('-pantheon', '').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="space-y-4">
      {/* Selected Deities Chips */}
      {selectedDeities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedDeities.map((deity) => (
            <Badge
              key={deity.id}
              variant="secondary"
              className="px-3 py-1.5 text-sm flex items-center gap-2 bg-primary/10 border-primary/20"
            >
              {deity.name}
              <button
                onClick={() => onRemove(deity.id)}
                className="hover:text-destructive transition-colors"
                aria-label={`Remove ${deity.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))}
          {selectedDeities.length < maxSelection && (
            <span className="text-sm text-muted-foreground self-center">
              Select up to {maxSelection - selectedDeities.length} more
            </span>
          )}
        </div>
      )}

      {/* Search and Filter */}
      {selectedDeities.length < maxSelection && (
        <div className="space-y-4">
          {/* Pantheon Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedPantheon === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPantheon(null)}
            >
              All Pantheons
            </Button>
            {pantheons.map((pantheon) => (
              <Button
                key={pantheon.id}
                variant={selectedPantheon === pantheon.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPantheon(pantheon.id)}
              >
                {pantheon.name.replace(' Pantheon', '')}
              </Button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <label htmlFor="compare-deity-search" className="sr-only">Search deities for comparison</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="compare-deity-search"
              type="text"
              placeholder="Search deities by name or domain..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="pl-10"
            />
          </div>

          {/* Dropdown Results */}
          {isOpen && (searchQuery || selectedPantheon) && (
            <div className="border rounded-lg bg-card shadow-lg max-h-64 overflow-y-auto">
              {filteredDeities.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No deities found
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {filteredDeities.slice(0, 20).map((deity) => (
                    <li key={deity.id}>
                      <button
                        onClick={() => handleSelect(deity)}
                        className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center justify-between gap-4"
                      >
                        <div>
                          <span className="font-medium">{deity.name}</span>
                          <span className="text-muted-foreground text-sm ml-2">
                            ({getPantheonName(deity.pantheonId)})
                          </span>
                          {deity.domain.length > 0 && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {deity.domain.slice(0, 3).join(', ')}
                            </p>
                          )}
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
