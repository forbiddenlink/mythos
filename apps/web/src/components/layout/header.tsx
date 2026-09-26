"use client";

import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Command, Heart, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MOBILE_MORE_NAV, PRIMARY_NAV } from "@/components/layout/nav-config";
import { MobileNav } from "@/components/layout/mobile-nav";
import { QuickActions } from "@/components/layout/quick-actions";

/** Shared look for the square icon controls on the right of the header. */
const headerIconButtonClass =
  "size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

export function Header() {
  const t = useTranslations();
  const [isMac, setIsMac] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mobile menu: the same primary IA plus a "More" section.
  const mobileNavSections = useMemo(
    () =>
      [...PRIMARY_NAV, MOBILE_MORE_NAV].map((group) => ({
        title: t(`navigation.${group.titleKey}`),
        links: group.items.map((item) => ({
          href: item.href,
          label: t(`navigation.${item.labelKey}`),
        })),
      })),
    [t],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent));
  }, []);

  const handleSearchClick = () => {
    document.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="layout-container layout-container-content flex h-16 items-center gap-2">
        {/* Mobile Navigation Trigger */}
        <div className="-ml-2 lg:hidden">
          <MobileNav sections={mobileNavSections} />
        </div>

        {/* Logo */}
        <Link
          href="/"
          className="group mr-auto flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold lg:mr-6"
        >
          <span className="text-foreground transition-colors duration-200 group-hover:text-gold-text">
            <Logo className="h-8 w-8" />
          </span>
          <span className="whitespace-nowrap font-serif text-base max-[359px]:sr-only font-semibold leading-none tracking-wide text-foreground transition-colors duration-200 group-hover:text-gold-text sm:text-lg">
            Mythos Atlas
          </span>
        </Link>

        {/* Desktop Navigation with Mega Menu */}
        <div className="hidden flex-1 lg:block">
          <MegaMenu />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {/* Quick Actions (Streak & Review Count) */}
          <QuickActions />

          {/* Command Palette Trigger */}
          <button
            type="button"
            onClick={handleSearchClick}
            className="group inline-flex h-10 items-center gap-2 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:border md:border-border md:bg-card/60 md:pr-1.5 md:pl-3"
            aria-label={t("actions.search")}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden w-20 text-left lg:inline">
              {t("actions.search")}
            </span>
            <kbd
              aria-hidden="true"
              className="hidden h-6 min-w-11 items-center justify-center gap-0.5 rounded border border-border bg-background px-1.5 font-sans text-xs text-muted-foreground md:inline-flex"
            >
              {mounted && isMac ? <Command className="h-3 w-3" /> : null}
              {mounted && !isMac ? "Ctrl" : null}
              <span>K</span>
            </kbd>
          </button>

          {/* Bookmarks */}
          <Link
            href="/bookmarks"
            className={`${headerIconButtonClass} hidden xl:inline-flex`}
            aria-label={t("navigation.bookmarks")}
          >
            <Heart className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} />
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
