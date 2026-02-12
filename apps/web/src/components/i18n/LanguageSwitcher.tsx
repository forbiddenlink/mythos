'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ChevronDown, Globe } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentLocale = useLocale() as Locale;
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLocaleChange = (locale: Locale) => {
    // Set cookie for server-side locale detection
    document.cookie = `locale=${locale};path=/;max-age=31536000;SameSite=Lax`;

    // Store in localStorage as backup
    localStorage.setItem('locale', locale);

    setIsOpen(false);

    // Refresh the page to apply new locale
    router.refresh();
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-2 text-muted-foreground rounded-lg">
        <Globe className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all duration-200"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-base" aria-hidden="true">
          {localeFlags[currentLocale]}
        </span>
        <span className="hidden sm:inline text-xs font-medium uppercase">
          {currentLocale}
        </span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-background shadow-lg overflow-hidden z-50"
          role="listbox"
          aria-label="Available languages"
        >
          <div className="py-1">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors duration-150 ${
                  locale === currentLocale
                    ? 'bg-gold/10 text-gold'
                    : 'text-foreground hover:bg-muted'
                }`}
                role="option"
                aria-selected={locale === currentLocale}
              >
                <span className="text-base" aria-hidden="true">
                  {localeFlags[locale]}
                </span>
                <span className="flex-1 text-left">
                  {localeNames[locale]}
                </span>
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
