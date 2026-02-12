'use client'

import Link from 'next/link';
import { Search, Command, Heart } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { MobileNav } from '@/components/layout/mobile-nav';
import { MegaMenu } from '@/components/layout/mega-menu';
import { QuickActions } from '@/components/layout/quick-actions';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

// Navigation structure for mobile
export const mobileNavSections = [
  {
    title: 'Explore',
    links: [
      { href: '/pantheons', label: 'Pantheons' },
      { href: '/deities', label: 'Deities' },
      { href: '/stories', label: 'Stories' },
      { href: '/creatures', label: 'Creatures' },
      { href: '/artifacts', label: 'Artifacts' },
      { href: '/locations', label: 'Locations' },
      { href: '/journeys', label: 'Hero Journeys' },
    ],
  },
  {
    title: 'Discover',
    links: [
      { href: '/divine-domains', label: 'Divine Domains' },
      { href: '/compare', label: 'Compare Deities' },
      { href: '/knowledge-graph', label: 'Knowledge Graph' },
      { href: '/family-tree', label: 'Family Tree' },
      { href: '/timeline', label: 'Timeline' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { href: '/quiz', label: 'Quiz' },
      { href: '/review', label: 'Daily Review' },
      { href: '/progress', label: 'Progress' },
      { href: '/achievements', label: 'Achievements' },
    ],
  },
  {
    title: 'More',
    links: [
      { href: '/bookmarks', label: 'Bookmarks' },
      { href: '/about', label: 'About' },
    ],
  },
];

export function Header() {
  const [isMac, setIsMac] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchClick = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true
    });
    document.dispatchEvent(event);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
        ? 'bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm'
        : 'bg-transparent border-b border-transparent'
        }`}
    >
      <div className="container mx-auto max-w-7xl flex h-16 items-center px-4">
        {/* Mobile Navigation Trigger */}
        <div className="lg:hidden mr-2">
          <MobileNav sections={mobileNavSections} />
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group mr-auto lg:mr-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gold/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative text-foreground group-hover:text-gold transition-colors duration-300">
              <Logo className="h-8 w-8 sm:h-9 sm:w-9" />
            </div>
          </motion.div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-semibold text-foreground tracking-wide leading-tight">
              Mythos Atlas
            </span>
            <span className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase hidden sm:block">
              Ancient Mythology
            </span>
          </div>
        </Link>

        {/* Desktop Navigation with Mega Menu */}
        <div className="mx-auto">
          <MegaMenu />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          {/* Divider */}
          <div className="hidden lg:block w-px h-6 bg-border mx-2" />

          {/* Quick Actions (Streak & Review Count) */}
          <QuickActions />

          {/* Command Palette Trigger */}
          <button
            onClick={handleSearchClick}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-lg border border-border/50 hover:border-border transition-all duration-200 group"
            aria-label="Open command palette"
          >
            <Search className="h-4 w-4 group-hover:text-gold transition-colors duration-200" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded bg-background border border-border/80 text-muted-foreground">
              {mounted && isMac ? <Command className="h-2.5 w-2.5" /> : null}
              {mounted && !isMac ? 'Ctrl' : null}
              {!mounted ? <span className="w-3" /> : null}
              <span>K</span>
            </kbd>
          </button>

          {/* Bookmarks */}
          <Link
            href="/bookmarks"
            className="flex items-center justify-center p-2 text-muted-foreground hover:text-gold rounded-lg hover:bg-muted/50 transition-all duration-200"
            aria-label="Bookmarks"
          >
            <Heart className="h-4 w-4" strokeWidth={1.5} />
          </Link>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
