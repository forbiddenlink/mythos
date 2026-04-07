import type { Locale } from "@/i18n/config";
import { isValidLocale } from "@/i18n/config";

/** Extra stopwords per UI locale (merged with the English core list in grounding). */
const LOCALE_STOPS: Record<Locale, string[]> = {
  en: [],
  es: [
    "cual",
    "cuál",
    "cómo",
    "donde",
    "dónde",
    "sobre",
    "para",
    "por",
    "una",
    "unos",
    "este",
    "esta",
    "estos",
    "muy",
    "más",
    "como",
    "dios",
    "diosa",
  ],
  fr: [
    "qui",
    "quel",
    "quelle",
    "comment",
    "pourquoi",
    "dans",
    "cette",
    "cela",
    "très",
    "plus",
    "une",
    "des",
    "les",
    "vous",
    "nous",
  ],
  de: [
    "welche",
    "welcher",
    "welches",
    "wenn",
    "noch",
    "auch",
    "nur",
    "eine",
    "einen",
    "einem",
    "einer",
    "dies",
    "diese",
    "dieser",
    "ihr",
    "ihre",
  ],
};

/**
 * Non-English UI: instruct the model to answer in that language when appropriate.
 */
export function oracleLocaleInstruction(locale: Locale): string {
  switch (locale) {
    case "es":
      return `\n\nIMPORTANT: The user's interface is in Spanish. Answer in Spanish unless they clearly write in another language.`;
    case "fr":
      return `\n\nIMPORTANT: The user's interface is in French. Answer in French unless they clearly write in another language.`;
    case "de":
      return `\n\nIMPORTANT: The user's interface is in German. Answer in German unless they clearly write in another language.`;
    default:
      return "";
  }
}

export function getLocaleStopwords(locale: Locale): Set<string> {
  return new Set(LOCALE_STOPS[locale] ?? []);
}

export function parseOracleLocale(raw: unknown): Locale {
  if (typeof raw !== "string" || !isValidLocale(raw)) return "en";
  return raw;
}
