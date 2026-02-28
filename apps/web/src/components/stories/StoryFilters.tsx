'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X, Search } from 'lucide-react';

interface Story {
  id: string;
  pantheonId: string;
  title: string;
  slug: string;
  summary: string | null;
  fullNarrative: string | null;
  themes: string[];
  culturalSignificance: string | null;
  imageUrl: string | null;
  category?: string;
  moralThemes?: string[];
}

interface StoryFiltersProps {
  stories: Story[];
  onFilteredChange: (filtered: Story[]) => void;
}

export function StoryFilters({ stories, onFilteredChange }: StoryFiltersProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [themeFilter, setThemeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allCategories = Array.from(
    new Set(stories.map(s => s.category).filter((c): c is string => Boolean(c)))
  ).sort();

  const allThemes = Array.from(
    new Set(stories.flatMap(s => s.moralThemes || []))
  ).sort();

  useEffect(() => {
    let filtered = [...stories];

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(s => s.category === categoryFilter);
    }

    if (themeFilter !== 'all') {
      filtered = filtered.filter(s => s.moralThemes?.includes(themeFilter));
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.summary?.toLowerCase().includes(query)
      );
    }

    onFilteredChange(filtered);
  }, [stories, categoryFilter, themeFilter, searchQuery, onFilteredChange]);

  const resetFilters = () => {
    setCategoryFilter('all');
    setThemeFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = categoryFilter !== 'all' || themeFilter !== 'all' || searchQuery !== '';

  return (
    <Card className="p-4 mb-6 bg-card">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-72 md:mr-auto">
          <label htmlFor="story-search" className="sr-only">Search stories</label>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            id="story-search"
            placeholder="Search stories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium hidden sm:inline">Filters:</span>
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]" aria-label="Filter by category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {allThemes.length > 0 && (
            <Select value={themeFilter} onValueChange={setThemeFilter}>
              <SelectTrigger className="w-[160px]" aria-label="Filter by theme">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Themes</SelectItem>
                {allThemes.slice(0, 15).map(theme => (
                  <SelectItem key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="gap-2 px-2"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
