"use client";

import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isValidLocale, type Locale } from "@/i18n/config";
import { LOCALE_CHANGE_EVENT, readLocaleCookie } from "@/i18n/client-locale";

async function loadMessages(locale: Locale): Promise<AbstractIntlMessages> {
  // One lazily loaded chunk per locale; the default locale's messages arrive
  // with the prerendered page.
  const mod = (await import(`../../../messages/${locale}.json`)) as {
    default: AbstractIntlMessages;
  };
  return mod.default;
}

/**
 * Client i18n provider for statically generated pages.
 *
 * Pages are prerendered in the default locale. After hydration this provider
 * reads the `locale` cookie (set by the proxy from Accept-Language, or by the
 * language switcher) and, when it names another supported locale, loads that
 * locale's messages and re-renders translated UI. The switcher announces
 * changes with a `LOCALE_CHANGE_EVENT`, so no navigation is needed.
 */
export function IntlProvider({
  locale: initialLocale,
  messages: initialMessages,
  children,
}: {
  locale: string;
  messages: AbstractIntlMessages;
  children: ReactNode;
}) {
  const [state, setState] = useState({
    locale: initialLocale,
    messages: initialMessages,
  });

  // Only the newest request may commit: a slower earlier load must not
  // overwrite a later choice (the cookie already holds the later one).
  const latestRequest = useRef(0);

  const apply = useCallback(
    async (next: string | null) => {
      if (!next || !isValidLocale(next)) return;
      const request = ++latestRequest.current;
      const messages =
        next === initialLocale ? initialMessages : await loadMessages(next);
      if (request !== latestRequest.current) return;
      setState((current) =>
        current.locale === next ? current : { locale: next, messages },
      );
      // <html lang> stays "en": pages are prerendered English and only some
      // strings translate. Translated elements carry lang={locale} themselves.
    },
    [initialLocale, initialMessages],
  );

  useEffect(() => {
    const saved = readLocaleCookie();
    if (saved && saved !== initialLocale) {
      void apply(saved).catch(() => {
        // Keep the default locale if the messages chunk fails to load.
      });
    }
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<string>).detail;
      void apply(next).catch(() => {});
    };
    window.addEventListener(LOCALE_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(LOCALE_CHANGE_EVENT, onChange);
  }, [apply, initialLocale]);

  return (
    <NextIntlClientProvider
      locale={state.locale}
      messages={state.messages}
      timeZone="UTC"
    >
      {children}
    </NextIntlClientProvider>
  );
}
