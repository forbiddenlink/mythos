"use client";

import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { useCallback, useEffect, useState, type ReactNode } from "react";
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

  const apply = useCallback(
    async (next: string | null) => {
      if (!next || !isValidLocale(next)) return;
      const messages =
        next === initialLocale ? initialMessages : await loadMessages(next);
      setState((current) =>
        current.locale === next ? current : { locale: next, messages },
      );
      document.documentElement.lang = next;
    },
    [initialLocale, initialMessages],
  );

  useEffect(() => {
    const saved = readLocaleCookie();
    if (saved && saved !== initialLocale) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- adopt the saved locale after hydration (cookie is client state)
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
