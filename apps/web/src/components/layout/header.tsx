'use client'

import Link from 'next/link';
import { Search, Command } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState, useEffect } from 'react';

export function Header() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-backdrop-filter:bg-white/80 dark:supports-backdrop-filter:bg-slate-950/80 shadow-sm">
      <div className="container mx-auto max-w-7xl flex h-16 items-center px-4">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
            <Logo className="h-8 w-8" />
          </div>
          <span className="font-serif text-xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Mythos Atlas
          </span>
        </Link>
        
        <nav className="ml-auto flex gap-6 items-center">
          <Link 
            href="/pantheons" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Pantheons
          </Link>
          <Link 
            href="/deities" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Deities
          </Link>
          <Link 
            href="/family-tree" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Family Tree
          </Link>
          <Link 
            href="/stories" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Stories
          </Link>

          {/* Command Palette Trigger */}
          <button
            onClick={() => {
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: isMac,
                ctrlKey: !isMac,
                bubbles: true
              });
              document.dispatchEvent(event);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors group"
            aria-label="Open command palette"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600">
              {isMac ? <Command className="h-3 w-3" /> : 'Ctrl'}
              <span>K</span>
            </kbd>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
