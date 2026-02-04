'use client'

import Link from 'next/link';
import { Search, Command } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const navLinks = [
  { href: '/pantheons', label: 'Pantheons' },
  { href: '/deities', label: 'Deities' },
  { href: '/family-tree', label: 'Family Tree' },
  { href: '/stories', label: 'Stories' },
  { href: '/quiz', label: 'Quiz' },
  { href: '/about', label: 'About' },
];

export function Header() {
  const [isMac, setIsMac] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
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
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="container mx-auto max-w-7xl flex h-18 items-center px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gold/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative text-foreground group-hover:text-gold transition-colors duration-300">
              <Logo className="h-9 w-9" />
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

        {/* Navigation */}
        <nav className="ml-auto flex items-center gap-1 md:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 group"
            >
              <span className="relative z-10">{link.label}</span>
              <span className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </Link>
          ))}

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-border mx-2" />

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

          {/* Theme Toggle */}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
