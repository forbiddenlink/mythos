"use client";

import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import { Command, Heart, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { QuickActions } from "@/components/layout/quick-actions";

export function Header() {
  const t = useTranslations();
  const [isMac, setIsMac] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Navigation structure for mobile
  const mobileNavSections = useMemo(
    () => [
      {
        title: t("navigation.startHere"),
        links: [
          { href: "/pantheons", label: t("navigation.pantheons") },
          { href: "/deities", label: t("navigation.deities") },
          { href: "/stories", label: t("navigation.stories") },
          { href: "/quiz", label: t("navigation.quiz") },
        ],
      },
      {
        title: t("navigation.discover"),
        links: [
          { href: "/atlas", label: t("navigation.atlas") },
          { href: "/oracle", label: t("navigation.oracle") },
          { href: "/collections", label: t("navigation.collections") },
          { href: "/compare", label: t("navigation.compareDeities") },
          { href: "/knowledge-graph", label: t("navigation.knowledgeGraph") },
          { href: "/family-tree", label: t("navigation.familyTree") },
          { href: "/journeys", label: t("navigation.heroJourneys") },
        ],
      },
      {
        title: t("navigation.learn"),
        links: [
          { href: "/learning-paths", label: t("navigation.learningPaths") },
          { href: "/review", label: t("navigation.dailyReview") },
          { href: "/progress", label: t("navigation.progress") },
          { href: "/achievements", label: t("navigation.achievements") },
          { href: "/leaderboard", label: t("navigation.leaderboard") },
        ],
      },
      {
        title: t("navigation.more"),
        links: [
          { href: "/bookmarks", label: t("navigation.bookmarks") },
          { href: "/sources", label: t("navigation.sources") },
          { href: "/changelog", label: t("navigation.changelog") },
          { href: "/about", label: t("pages.about.title") },
          { href: "/contact", label: t("navigation.contactMythosAtlas") },
          { href: "/privacy", label: t("navigation.privacyPolicy") },
        ],
      },
    ],
    [t],
  );

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
            aria-label={t("actions.search")}
          >
            <Search className="h-4 w-4 group-hover:text-gold transition-colors duration-200" />
            <span className="hidden lg:inline">{t("actions.search")}</span>
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
            aria-label={t("navigation.bookmarks")}
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
