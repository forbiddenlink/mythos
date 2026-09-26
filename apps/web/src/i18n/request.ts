import { getRequestConfig } from "next-intl/server";
import { defaultLocale } from "./config";
import defaultMessages from "../../messages/en.json";

/**
 * Server-side i18n config: always the default locale.
 *
 * Reading the `locale` cookie here (as this file used to) makes every route
 * dynamic, which disabled static generation for the whole site. Pages are now
 * prerendered in the default locale, and `IntlProvider` (a client component in
 * the root layout) swaps in the reader's saved locale after hydration. The
 * cookie is still set by `proxy.ts` from Accept-Language and by the language
 * switcher, so a reader's choice persists across visits.
 */
export default getRequestConfig(async () => ({
  locale: defaultLocale,
  messages: defaultMessages,
  timeZone: "UTC",
}));
