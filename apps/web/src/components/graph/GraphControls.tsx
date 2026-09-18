"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  X,
  Filter,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  layoutMode?: "cluster" | "grid" | "radial";
  onLayoutModeChange?: (mode: "cluster" | "grid" | "radial") => void;
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
  layoutMode,
  onLayoutModeChange,
  className,
}: GraphControlsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      setSearchQuery("");
      setShowSearchResults(false);
    },
    [onCenterNode],
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
    [selectedPantheons, onPantheonsChange],
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
    [relationshipFilters, onRelationshipFiltersChange],
  );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Search Bar */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <label htmlFor="graph-deity-search" className="sr-only">
            Search deities in graph
          </label>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
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
            className="bg-card pl-9 pr-9 border-border"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
            {searchResults.map((deity) => (
              <button
                key={deity.id}
                onClick={() => handleSearchSelect(deity)}
                className="flex w-full flex-col border-b border-border px-3 py-2 text-left text-sm text-popover-foreground last:border-b-0 hover:bg-accent"
              >
                <span className="font-medium">{deity.name}</span>
                {deity.domain && deity.domain.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {deity.domain.slice(0, 2).join(", ")}
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
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
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
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
          aria-label={showFilters ? "Hide graph filters" : "Show graph filters"}
          aria-expanded={showFilters}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </Button>

        {/* Layout cycle: cluster → radial → grid */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const order = ["cluster", "radial", "grid"] as const;
            const current =
              layoutMode ?? (clusterByPantheon ? "cluster" : "grid");
            const next = order[(order.indexOf(current) + 1) % order.length];
            onLayoutModeChange?.(next);
            onClusterChange(next === "cluster");
          }}
          className="gap-2"
          aria-label={`Switch graph layout from ${layoutMode ?? (clusterByPantheon ? "cluster" : "grid")}`}
        >
          <Layers className="h-4 w-4" />
          <span className="hidden sm:inline capitalize">
            {layoutMode ?? (clusterByPantheon ? "cluster" : "grid")}
          </span>
        </Button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
          {/* Pantheon Filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Pantheons
              </h4>
              <button
                onClick={toggleAllPantheons}
                className="text-xs text-gold-text hover:underline"
              >
                {selectedPantheons.size === pantheons.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {pantheons.map((pantheon) => (
                <Button
                  key={pantheon.id}
                  variant={
                    selectedPantheons.has(pantheon.id) ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handlePantheonToggle(pantheon.id)}
                  className="text-xs h-7"
                >
                  {pantheon.name.replace(" Pantheon", "")}
                </Button>
              ))}
            </div>
          </div>

          {/* Relationship Type Filters */}
          <div className="space-y-2 border-t border-border pt-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Relationship Types
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={relationshipFilters.parent ? "default" : "outline"}
                size="sm"
                onClick={() => toggleRelationshipFilter("parent")}
                className="text-xs h-7"
              >
                Parent/Child
              </Button>
              <Button
                variant={relationshipFilters.spouse ? "default" : "outline"}
                size="sm"
                onClick={() => toggleRelationshipFilter("spouse")}
                className="text-xs h-7"
              >
                Spouse/Lover
              </Button>
              <Button
                variant={relationshipFilters.sibling ? "default" : "outline"}
                size="sm"
                onClick={() => toggleRelationshipFilter("sibling")}
                className="text-xs h-7"
              >
                Sibling
              </Button>
              <Button
                variant={
                  relationshipFilters.crossPantheon ? "default" : "outline"
                }
                size="sm"
                onClick={() => toggleRelationshipFilter("crossPantheon")}
                className="text-xs h-7"
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
