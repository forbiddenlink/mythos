/**
 * Browser-side locale persistence shared by the language switcher and the
 * client i18n provider. Pure apart from `document.cookie`; no server imports.
 */
import { isValidLocale, type Locale } from "./config";

/** Dispatched on `window` with the new locale as `detail`. */
export const LOCALE_CHANGE_EVENT = "mythos:locale-change";

/** The saved `locale` cookie, when it names a supported locale. */
export function parseLocaleCookie(cookie: string): Locale | null {
  for (const part of cookie.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === "locale") {
      const value = decodeURIComponent(rest.join("="));
      return isValidLocale(value) ? value : null;
    }
  }
  return null;
}

export function readLocaleCookie(): Locale | null {
  if (typeof document === "undefined") return null;
  return parseLocaleCookie(document.cookie);
}

/** Persist the reader's locale and tell the provider to switch messages. */
export function saveLocale(locale: Locale): void {
  const secureFlag = process.env.NODE_ENV === "production" ? ";Secure" : "";
  // Mirrors the flags proxy.ts sets on this same cookie.
  document.cookie = `locale=${locale};path=/;max-age=31536000;SameSite=Lax${secureFlag}`;
  try {
    localStorage.setItem("locale", locale);
  } catch {
    /* blocked */
  }
  window.dispatchEvent(
    new CustomEvent(LOCALE_CHANGE_EVENT, { detail: locale }),
  );
}
