/**
 * Anki & Quizlet Spaced-Repetition Deck Exporter for Mythos Atlas
 *
 * Formats mythological deities, stories, and archetypal parallels into
 * standard TSV (Tab-Separated Values) files with HTML formatting supported
 * natively by Anki, Quizlet, RemNote, and Notion flashcards.
 */

export interface AnkiFlashcard {
  front: string;
  back: string;
  tags?: string[];
}

export interface DeityCardData {
  name: string;
  pantheon: string;
  domains: string[];
  symbols: string[];
  description: string;
  pronunciation?: {
    ipa?: string;
    phonetic?: string;
  };
  alternateNames?: string[];
  originStory?: string;
}

/**
 * Generate standard Anki-compatible TSV text content.
 * Includes Anki format headers for immediate, zero-configuration import.
 */
export function generateAnkiTsv(cards: AnkiFlashcard[]): string {
  const header = [
    "#separator:tab",
    "#html:true",
    "#tags column:3",
    "#columns:Front\tBack\tTags",
    "",
  ].join("\n");

  const rows = cards.map((card) => {
    // Sanitize tabs and newlines within fields to prevent delimiter breakage
    const cleanFront = card.front.replace(/\t/g, " ").replace(/\n/g, "<br>");
    const cleanBack = card.back.replace(/\t/g, " ").replace(/\n/g, "<br>");
    const tags = (card.tags || []).join(" ");
    return `${cleanFront}\t${cleanBack}\t${tags}`;
  });

  return `${header}${rows.join("\n")}\n`;
}

/**
 * Convert an array of deity records into flashcards.
 */
export function createDeityFlashcards(
  deities: DeityCardData[],
): AnkiFlashcard[] {
  return deities.map((deity) => {
    const pronunciationHtml = deity.pronunciation?.ipa
      ? `<div style="color: #c5a880; font-size: 0.9em; margin-top: 4px;">/${deity.pronunciation.ipa}/</div>`
      : "";

    const alternateNamesHtml =
      deity.alternateNames && deity.alternateNames.length > 0
        ? `<div style="font-size: 0.85em; color: #888; margin-top: 4px;">Also known as: ${deity.alternateNames.join(", ")}</div>`
        : "";

    const front = `
<div style="text-align: center; font-family: serif; font-size: 1.4em; color: #d4af37;">
  <strong>${deity.name}</strong>
</div>
<div style="text-align: center; font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.1em; color: #aaa; margin-top: 4px;">
  ${deity.pantheon}
</div>
${pronunciationHtml}
${alternateNamesHtml}
`.trim();

    const domainList =
      deity.domains.length > 0
        ? `<p><strong>Domains:</strong> ${deity.domains.join(", ")}</p>`
        : "";

    const symbolList =
      deity.symbols.length > 0
        ? `<p><strong>Symbols:</strong> ${deity.symbols.join(", ")}</p>`
        : "";

    const back = `
<div style="font-family: serif; line-height: 1.5;">
  ${domainList}
  ${symbolList}
  <hr style="border: 0; border-top: 1px solid #c5a88040; margin: 8px 0;" />
  <p>${deity.description}</p>
</div>
`.trim();

    const tags = [
      "mythos-atlas",
      deity.pantheon.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      ...deity.domains.map((d) => d.toLowerCase().replace(/[^a-z0-9]/g, "-")),
    ];

    return { front, back, tags };
  });
}

/**
 * Triggers a browser download of the generated Anki TSV file.
 */
export function downloadAnkiDeck(filename: string, content: string): void {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], {
    type: "text/tab-separated-values;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    filename.endsWith(".txt") || filename.endsWith(".tsv")
      ? filename
      : `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
