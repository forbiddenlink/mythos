import type { ComparisonDeity, DeityComparison } from "@/lib/comparisons";
import type { EntryFaqItem } from "@/lib/entry-faq";

/**
 * Sentences a comparison page says about its pair, built only from the two
 * deity records and the note or kinship that justifies the pairing. The page
 * and its structured data read the same functions, so they cannot disagree.
 */

const listFormat = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

/** "sky, thunder, and justice": lower case, as a sentence reads it. */
export function lowerList(items: readonly string[]): string {
  return listFormat.format(items.map((item) => item.toLowerCase()));
}

export function sentence(text: string): string {
  const trimmed = text.trim();
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

export function shortTradition(deity: ComparisonDeity): string {
  return deity.pantheonName.replace(/\s+(Pantheon|Tradition|Traditions)$/, "");
}

/** "Zeus vs Odin": the page heading and the label of links to the page. */
export function comparisonHeadline(comparison: DeityComparison): string {
  return `${comparison.a.displayName} vs ${comparison.b.displayName}`;
}

/** One sentence saying why these two share a page (lede and description). */
export function basisSentence(comparison: DeityComparison): string {
  const { a, b, basis } = comparison;
  if (basis.kind === "parallel") {
    const note = basis.notes[0];
    return note
      ? sentence(note)
      : `${a.displayName} and ${b.displayName} hold comparable places in the ${shortTradition(a)} and ${shortTradition(b)} traditions.`;
  }
  if (basis.relation === "parent and child") {
    return `${a.displayName} and ${b.displayName} are recorded as parent and child in the ${a.pantheonName}.`;
  }
  if (basis.relation === "rivals") {
    return `${a.displayName} and ${b.displayName} are recorded as rivals in the ${a.pantheonName}.`;
  }
  return `${a.displayName} and ${b.displayName} are recorded as siblings in the ${a.pantheonName}.`;
}

/** Plain-language account of what the two share. */
export function sharedTraitSentences(comparison: DeityComparison): string[] {
  const { a, b, sharedDomains, sharedSymbols, basis } = comparison;
  const sentences: string[] = [];
  if (sharedDomains.length > 0) {
    sentences.push(`Both are associated with ${lowerList(sharedDomains)}.`);
  }
  if (sharedSymbols.length > 0) {
    sentences.push(
      `They share ${sharedSymbols.length === 1 ? "a symbol" : "symbols"}: ${lowerList(sharedSymbols)}.`,
    );
  }
  if (sentences.length === 0) {
    sentences.push(
      `The atlas records no domain or symbol that ${a.name} and ${b.name} share.`,
    );
    sentences.push(
      basis.kind === "parallel"
        ? "They are compared for the part each plays in their own tradition rather than for any attribute in common."
        : "They are compared because of how the myths connect them, not because of what they rule.",
    );
  }
  return sentences;
}

/** The questions a comparison page answers, in page order. */
export function comparisonFaq(comparison: DeityComparison): EntryFaqItem[] {
  const { a, b, sharedDomains } = comparison;
  return [
    {
      question: `How are ${a.displayName} and ${b.displayName} related?`,
      answer: basisSentence(comparison),
    },
    {
      question: `What do ${a.name} and ${b.name} have in common?`,
      answer: sharedDomains.length
        ? `Both are associated with ${lowerList(sharedDomains)}.`
        : `They share no domain in this atlas: ${a.name} is associated with ${lowerList(a.domain)}, and ${b.name} with ${lowerList(b.domain)}.`,
    },
    {
      question: `Which traditions do they belong to?`,
      answer: comparison.sameTradition
        ? `Both belong to the ${a.pantheonName}.`
        : `${a.displayName} belongs to the ${a.pantheonName}, and ${b.displayName} to the ${b.pantheonName}.`,
    },
  ];
}
