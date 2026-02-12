'use client';

import { useEffect, useState } from 'react';
import { Search, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchTriggerProps {
  onClick: () => void;
  className?: string;
  variant?: 'default' | 'compact';
}

export function SearchTrigger({ onClick, className = '', variant = 'default' }: SearchTriggerProps) {
  const [isMac, setIsMac] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className={`relative ${className}`}
        aria-label="Open search"
      >
        <Search className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-lg border border-border/50 hover:border-border transition-all duration-200 group ${className}`}
      aria-label="Open search"
    >
      <Search className="h-4 w-4 group-hover:text-gold transition-colors duration-200" />
      <span className="hidden lg:inline">Search</span>
      <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded bg-background border border-border/80 text-muted-foreground">
        {mounted && isMac && <Command className="h-2.5 w-2.5" />}
        {mounted && !isMac && <span>Ctrl</span>}
        {!mounted && <span className="w-3" />}
        <span>K</span>
      </kbd>
    </button>
  );
}
