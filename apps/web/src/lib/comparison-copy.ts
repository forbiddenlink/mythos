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

/**
 * "sky, thunder, and justice". The catalog writes domains and symbols in
 * lower case and capitalises only proper nouns ("the founding of Cusco"), so
 * the items are joined as written.
 */
export function phraseList(items: readonly string[]): string {
  return listFormat.format(items);
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
    sentences.push(`Both are associated with ${phraseList(sharedDomains)}.`);
  }
  if (sharedSymbols.length > 0) {
    sentences.push(
      `They share ${sharedSymbols.length === 1 ? "a symbol" : "symbols"}: ${phraseList(sharedSymbols)}.`,
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

/** How many domains a summary sentence names before it stops. */
const SUMMARY_DOMAINS = 3;

/**
 * What the two share and where they part, by domain, in one or two sentences.
 * Each list keeps the order of the deity's own record, which puts the domains
 * the deity is best known for first.
 */
export function contrastSummary(comparison: DeityComparison): string {
  const { a, b, sharedDomains, distinctDomains } = comparison;
  const shared = sharedDomains.slice(0, SUMMARY_DOMAINS);
  const onlyA = distinctDomains.a.slice(0, SUMMARY_DOMAINS);
  const onlyB = distinctDomains.b.slice(0, SUMMARY_DOMAINS);

  if (shared.length === 0) {
    return `${a.displayName} is associated with ${phraseList(onlyA)}, and ${b.displayName} with ${phraseList(onlyB)}.`;
  }
  const both = `Both are associated with ${phraseList(shared)}.`;
  if (onlyA.length > 0 && onlyB.length > 0) {
    return `${both} ${a.displayName} is also associated with ${phraseList(onlyA)}, and ${b.displayName} with ${phraseList(onlyB)}.`;
  }
  const [deity, domains] = onlyA.length > 0 ? [a, onlyA] : [b, onlyB];
  return domains.length > 0
    ? `${both} ${deity.displayName} is also associated with ${phraseList(domains)}.`
    : both;
}

function traditionsSentence(comparison: DeityComparison): string {
  const { a, b } = comparison;
  return comparison.sameTradition
    ? `Both belong to the ${a.pantheonName}.`
    : `${a.displayName} belongs to the ${a.pantheonName}, and ${b.displayName} to the ${b.pantheonName}.`;
}

/** Every domain the records give to one of the two and not to the other. */
function domainDifference(comparison: DeityComparison): string {
  const { a, b, distinctDomains } = comparison;
  const onlyA = distinctDomains.a;
  const onlyB = distinctDomains.b;
  if (onlyA.length > 0 && onlyB.length > 0) {
    return `In this atlas, only ${a.displayName} is associated with ${phraseList(onlyA)}, and only ${b.displayName} with ${phraseList(onlyB)}.`;
  }
  if (onlyA.length === 0 && onlyB.length === 0) {
    return "The atlas records the same domains for both.";
  }
  const [deity, other, domains] =
    onlyA.length > 0 ? [a, b, onlyA] : [b, a, onlyB];
  return `In this atlas, only ${deity.displayName} is associated with ${phraseList(domains)}; every domain recorded for ${other.displayName} is shared with ${deity.displayName}.`;
}

/**
 * The questions a comparison page answers, in page order. The tradition is a
 * difference between two figures only when they come from two traditions, so
 * it is part of the first answer there and its own question otherwise.
 */
export function comparisonFaq(comparison: DeityComparison): EntryFaqItem[] {
  const { a, b } = comparison;
  const difference = domainDifference(comparison);
  return [
    {
      question: `What is the difference between ${a.displayName} and ${b.displayName}?`,
      answer: comparison.sameTradition
        ? difference
        : `${traditionsSentence(comparison)} ${difference}`,
    },
    {
      question: `What do ${a.displayName} and ${b.displayName} have in common?`,
      answer: sharedTraitSentences(comparison).join(" "),
    },
    {
      question: `How are ${a.displayName} and ${b.displayName} related?`,
      answer: basisSentence(comparison),
    },
    ...(comparison.sameTradition
      ? [
          {
            question: "Which traditions do they belong to?",
            answer: traditionsSentence(comparison),
          },
        ]
      : []),
  ];
}
