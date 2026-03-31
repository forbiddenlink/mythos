"use client";

import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import { Command, Heart, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { QuickActions } from "@/components/layout/quick-actions";

// Navigation structure for mobile
export const mobileNavSections = [
  {
    title: "Start Here",
    links: [
      { href: "/pantheons", label: "Pantheons" },
      { href: "/deities", label: "Deities" },
      { href: "/stories", label: "Stories" },
      { href: "/quiz", label: "Quiz" },
    ],
  },
  {
    title: "Discover",
    links: [
      { href: "/collections", label: "Collections" },
      { href: "/compare", label: "Compare Deities" },
      { href: "/knowledge-graph", label: "Knowledge Graph" },
      { href: "/family-tree", label: "Family Tree" },
      { href: "/journeys", label: "Hero Journeys" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/learning-paths", label: "Learning Paths" },
      { href: "/review", label: "Daily Review" },
      { href: "/progress", label: "Progress" },
      { href: "/achievements", label: "Achievements" },
      { href: "/leaderboard", label: "Leaderboard" },
    ],
  },
  {
    title: "More",
    links: [
      { href: "/bookmarks", label: "Bookmarks" },
      { href: "/sources", label: "Sources" },
      { href: "/changelog", label: "Changelog" },
      { href: "/about", label: "About Mythos Atlas" },
      { href: "/contact", label: "Contact Mythos Atlas" },
      { href: "/privacy", label: "Privacy Policy" },
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
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent));

    const handleScroll = () => {
      setScrolled(globalThis.scrollY > 20);
    };

    globalThis.addEventListener("scroll", handleScroll, { passive: true });
    return () => globalThis.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchClick = () => {
    document.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto max-w-7xl flex h-16 items-center px-4">
        {/* Mobile Navigation Trigger */}
        <div className="lg:hidden mr-2">
          <MobileNav sections={mobileNavSections} />
        </div>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group mr-auto lg:mr-0"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
            <span className="text-[10px] text-foreground/75 tracking-[0.15em] uppercase hidden sm:block">
              Ancient Mythology
            </span>
          </div>
        </Link>

        {/* Desktop Navigation with Mega Menu */}
        <div className="mx-auto">
          <MegaMenu />
        </div>

        <div className="hidden 2xl:flex items-center gap-4 mr-4">
          <Link
            href="/about"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            About Mythos Atlas
          </Link>
          <Link
            href="/contact"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact Mythos Atlas
          </Link>
          <Link
            href="/privacy"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy Policy
          </Link>
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
            aria-label="Search"
          >
            <Search className="h-4 w-4 group-hover:text-gold transition-colors duration-200" />
            <span className="hidden lg:inline">Search</span>
            <kbd
              aria-hidden="true"
              className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded bg-background border border-border/80 text-muted-foreground"
            >
              {mounted && isMac ? <Command className="h-2.5 w-2.5" /> : null}
              {mounted && !isMac ? "Ctrl" : null}
              {!mounted && <span className="w-6" aria-hidden="true" />}
              <span>K</span>
            </kbd>
          </button>

          {/* Bookmarks */}
          <Link
            href="/bookmarks"
            className="hidden xl:flex items-center justify-center p-2 text-muted-foreground hover:text-gold rounded-lg hover:bg-muted/50 transition-all duration-200"
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
