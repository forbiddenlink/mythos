"use client";

import { localeFlags, localeNames, locales, type Locale } from "@/i18n/config";
import { ChevronDown, Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { saveLocale } from "@/i18n/client-locale";
import { useEffect, useRef, useState } from "react";

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentLocale = useLocale() as Locale;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard hydration-safe mounted flag
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    // Pages are prerendered in the default locale; IntlProvider swaps the
    // messages in place when it hears about the change.
    saveLocale(locale);
    setIsOpen(false);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex h-10 items-center justify-center px-2.5 text-muted-foreground">
        <Globe className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        aria-label={`Interface language: ${currentLocale.toUpperCase()}. Navigation and Oracle chat follow this locale; most encyclopedia pages remain in English.`}
        title="Navigation and Oracle language"
        aria-expanded={isOpen ? "true" : "false"}
        aria-haspopup="menu"
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline text-xs font-medium uppercase">
          {currentLocale}
        </span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-52 rounded-lg border border-border bg-background shadow-lg overflow-hidden z-50"
          role="menu"
          aria-label="Interface languages"
        >
          <p className="px-3 py-2 text-[11px] leading-snug text-muted-foreground border-b border-border">
            Affects navigation and Oracle replies. Encyclopedia articles stay in
            English for now.
          </p>
          <div className="py-1">
            {locales.map((locale) => (
              <button
                key={locale}
                type="button"
                role="menuitemradio"
                aria-checked={locale === currentLocale}
                onClick={() => handleLocaleChange(locale)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors duration-150 ${
                  locale === currentLocale
                    ? "bg-gold/10 text-gold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="text-base" aria-hidden="true">
                  {localeFlags[locale]}
                </span>
                <span className="flex-1 text-left">{localeNames[locale]}</span>
                {locale === currentLocale && (
                  <span className="text-gold" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
