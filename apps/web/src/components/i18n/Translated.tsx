"use client";

import { useTranslations } from "next-intl";

/**
 * A translated string inside a server component. Server components render in
 * the default locale at build time; this client leaf follows the reader's
 * locale once `IntlProvider` has loaded it.
 */
export function Translated({ namespace, k }: { namespace: string; k: string }) {
  const t = useTranslations(namespace);
  return <>{t(k)}</>;
}
