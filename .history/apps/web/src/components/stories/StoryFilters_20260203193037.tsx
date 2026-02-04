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
import { Filter, X } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  slug: string;
  category: string;
  pantheonId?: string;
  moralThemes?: string[];
}

interface StoryFiltersProps {
  stories: Story[];
  onFilteredChange: (filtered: Story[]) => void;
}

export function StoryFilters({ stories, onFilteredChange }: StoryFiltersProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [themeFilter, setThemeFilter] = useState<string>('all');

  const allCategories = Array.from(
    new Set(stories.map(s => s.category).filter(Boolean))
  ).sort();

  const allThemes = Array.from(
    new Set(stories.flatMap(s => s.moralThemes || []))
  ).sort();

  const applyFilters = () => {
    let filtered = [...stories];

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(s => s.category === categoryFilter);
    }

    if (themeFilter !== 'all') {
      filtered = filtered.filter(s => s.moralThemes?.includes(themeFilter));
    }

    onFilteredChange(filtered);
  };

  useState(() => {
    applyFilters();
  });

  const resetFilters = () => {
    setCategoryFilter('all');
    setThemeFilter('all');
    onFilteredChange(stories);
  };

  const hasActiveFilters = categoryFilter !== 'all' || themeFilter !== 'all';

  return (
    <Card className="p-4 mb-6 bg-card">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <Select value={categoryFilter} onValueChange={(value) => {
          setCategoryFilter(value);
          setTimeout(applyFilters, 0);
        }}>
          <SelectTrigger className="w-[160px]">
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
          <Select value={themeFilter} onValueChange={(value) => {
            setThemeFilter(value);
            setTimeout(applyFilters, 0);
          }}>
            <SelectTrigger className="w-[180px]">
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
          <>
            <div className="h-6 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Reset
            </Button>
          </>
        )}

        <div className="ml-auto text-sm text-muted-foreground">
          {stories.length} {stories.length === 1 ? 'story' : 'stories'}
        </div>
      </div>
    </Card>
  );
}
