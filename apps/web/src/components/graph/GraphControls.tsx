'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  X,
  Filter,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Pantheon {
  id: string;
  name: string;
}

interface DeitySearchResult {
  id: string;
  name: string;
  pantheonId: string;
  domain?: string[];
}

interface GraphControlsProps {
  pantheons: Pantheon[];
  deities: DeitySearchResult[];
  selectedPantheons: Set<string>;
  onPantheonsChange: (pantheons: Set<string>) => void;
  relationshipFilters: {
    parent: boolean;
    spouse: boolean;
    sibling: boolean;
    crossPantheon: boolean;
  };
  onRelationshipFiltersChange: (filters: {
    parent: boolean;
    spouse: boolean;
    sibling: boolean;
    crossPantheon: boolean;
  }) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onCenterNode: (nodeId: string) => void;
  clusterByPantheon: boolean;
  onClusterChange: (cluster: boolean) => void;
  className?: string;
}

export function GraphControls({
  pantheons,
  deities,
  selectedPantheons,
  onPantheonsChange,
  relationshipFilters,
  onRelationshipFiltersChange,
  onZoomIn,
  onZoomOut,
  onFitView,
  onCenterNode,
  clusterByPantheon,
  onClusterChange,
  className,
}: GraphControlsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter deities based on search query
  const searchResults = searchQuery.trim()
    ? deities
        .filter((d) => {
          const query = searchQuery.toLowerCase();
          return (
            d.name.toLowerCase().includes(query) ||
            d.domain?.some((dom) => dom.toLowerCase().includes(query))
          );
        })
        .slice(0, 8)
    : [];

  const handleSearchSelect = useCallback(
    (deity: DeitySearchResult) => {
      onCenterNode(deity.id);
      setSearchQuery('');
      setShowSearchResults(false);
    },
    [onCenterNode]
  );

  const handlePantheonToggle = useCallback(
    (pantheonId: string) => {
      const newSelected = new Set(selectedPantheons);
      if (newSelected.has(pantheonId)) {
        newSelected.delete(pantheonId);
      } else {
        newSelected.add(pantheonId);
      }
      onPantheonsChange(newSelected);
    },
    [selectedPantheons, onPantheonsChange]
  );

  const toggleAllPantheons = useCallback(() => {
    if (selectedPantheons.size === pantheons.length) {
      onPantheonsChange(new Set());
    } else {
      onPantheonsChange(new Set(pantheons.map((p) => p.id)));
    }
  }, [selectedPantheons, pantheons, onPantheonsChange]);

  const toggleRelationshipFilter = useCallback(
    (key: keyof typeof relationshipFilters) => {
      onRelationshipFiltersChange({
        ...relationshipFilters,
        [key]: !relationshipFilters[key],
      });
    },
    [relationshipFilters, onRelationshipFiltersChange]
  );

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Search Bar */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <label htmlFor="graph-deity-search" className="sr-only">Search deities in graph</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
          <Input
            id="graph-deity-search"
            type="text"
            placeholder="Search deities..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="pl-9 pr-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
            {searchResults.map((deity) => (
              <button
                key={deity.id}
                onClick={() => handleSearchSelect(deity)}
                className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm flex flex-col border-b border-slate-100 dark:border-slate-800 last:border-b-0"
              >
                <span className="font-medium">{deity.name}</span>
                {deity.domain && deity.domain.length > 0 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {deity.domain.slice(0, 2).join(', ')}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Control Buttons Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onZoomIn}
            aria-label="Zoom in"
            className="h-8 w-8"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onZoomOut}
            aria-label="Zoom out"
            className="h-8 w-8"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onFitView}
            aria-label="Fit view"
            className="h-8 w-8"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter Toggle */}
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </Button>

        {/* Cluster Toggle */}
        <Button
          variant={clusterByPantheon ? 'default' : 'outline'}
          size="sm"
          onClick={() => onClusterChange(!clusterByPantheon)}
          className="gap-2"
        >
          <Layers className="h-4 w-4" />
          <span className="hidden sm:inline">Cluster</span>
        </Button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4">
          {/* Pantheon Filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Pantheons
              </h4>
              <button
                onClick={toggleAllPantheons}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
              >
                {selectedPantheons.size === pantheons.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {pantheons.map((pantheon) => (
                <Button
                  key={pantheon.id}
                  variant={selectedPantheons.has(pantheon.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePantheonToggle(pantheon.id)}
                  className="text-xs h-7"
                >
                  {pantheon.name.replace(' Pantheon', '')}
                </Button>
              ))}
            </div>
          </div>

          {/* Relationship Type Filters */}
          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Relationship Types
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={relationshipFilters.parent ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleRelationshipFilter('parent')}
                className="text-xs h-7"
              >
                Parent/Child
              </Button>
              <Button
                variant={relationshipFilters.spouse ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleRelationshipFilter('spouse')}
                className="text-xs h-7"
                style={relationshipFilters.spouse ? { backgroundColor: '#ec4899' } : {}}
              >
                Spouse/Lover
              </Button>
              <Button
                variant={relationshipFilters.sibling ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleRelationshipFilter('sibling')}
                className="text-xs h-7"
                style={relationshipFilters.sibling ? { backgroundColor: '#3b82f6' } : {}}
              >
                Sibling
              </Button>
              <Button
                variant={relationshipFilters.crossPantheon ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleRelationshipFilter('crossPantheon')}
                className="text-xs h-7"
                style={
                  relationshipFilters.crossPantheon
                    ? { background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }
                    : {}
                }
              >
                Cross-Pantheon
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
