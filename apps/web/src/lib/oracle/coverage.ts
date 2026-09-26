/**
 * "Not in our sources" handling. Client-safe (no server imports).
 *
 * The system prompt tells the model to open with this exact sentence (in the
 * reply language) whenever the Mythos Atlas grounding does not answer the
 * question, and the route sends it verbatim when retrieval finds nothing at
 * all. The UI keys its "not in our sources" state off the same strings.
 */

import type { Locale } from "@/i18n/config";

export const NOT_IN_SOURCES_PHRASES: Record<Locale, string> = {
  en: "Our sources don't cover that.",
  es: "Nuestras fuentes no cubren eso.",
  fr: "Nos sources ne couvrent pas cela.",
  de: "Unsere Quellen decken das nicht ab.",
};

export function notInSourcesPhrase(locale: Locale): string {
  return NOT_IN_SOURCES_PHRASES[locale] ?? NOT_IN_SOURCES_PHRASES.en;
}

const NOT_IN_SOURCES_HINTS: Record<Locale, string> = {
  en: "Ask me about a god, hero, creature, place, or myth from the Atlas and I will answer from its pages.",
  es: "Pregúntame por un dios, héroe, criatura, lugar o mito del Atlas y responderé a partir de sus páginas.",
  fr: "Interrogez-moi sur un dieu, un héros, une créature, un lieu ou un mythe de l'Atlas et je répondrai à partir de ses pages.",
  de: "Fragt mich nach einem Gott, Helden, Wesen, Ort oder Mythos aus dem Atlas, und ich antworte aus seinen Seiten.",
};

/** Full reply sent without calling the model when retrieval finds nothing. */
export function notInSourcesReply(locale: Locale): string {
  return `${notInSourcesPhrase(locale)} ${NOT_IN_SOURCES_HINTS[locale] ?? NOT_IN_SOURCES_HINTS.en}`;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const NORMALIZED_PHRASES = Object.values(NOT_IN_SOURCES_PHRASES).map((p) =>
  normalize(p).replace(/\.$/, ""),
);

/**
 * True when an answer opens by declaring that Mythos Atlas sources do not
 * cover the question. Only the opening counts: a grounded answer that notes a
 * gap further on ("…but our sources don't cover his later life") is still a
 * grounded answer.
 */
export function isNotInSourcesAnswer(text: string): boolean {
  const t = normalize(text);
  if (!t) return false;
  return NORMALIZED_PHRASES.some((p) => t.startsWith(p));
}
