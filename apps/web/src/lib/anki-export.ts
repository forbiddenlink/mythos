import type { ReviewCard } from "@/lib/spaced-repetition";

/**
 * Tab-separated text for Anki import (File → Import).
 * @see https://docs.ankiweb.net/importing/text-files.html
 */
export function reviewCardsToAnkiTsv(cards: ReviewCard[]): string {
  const lines = [
    "#separator:tab",
    "#html:false",
    "#tags column:3",
    "Front\tBack\tTags",
  ];

  for (const c of cards) {
    const front = escapeAnkiField(c.question);
    const back = escapeAnkiField(
      [c.answer, c.hint ? `\n\nHint: ${c.hint}` : ""].join(""),
    );
    const tag = tagFromCard(c);
    lines.push(`${front}\t${back}\t${tag}`);
  }

  return lines.join("\n");
}

function escapeAnkiField(s: string): string {
  return s.replace(/\t/g, " ").replace(/\r?\n/g, "<br>");
}

function tagFromCard(c: ReviewCard): string {
  const p = c.metadata?.pantheonId?.replace(/-/g, "_") ?? "mythos";
  const t = c.type.replace(/-/g, "_");
  return `mythos_${t} ${p}`;
}

export function downloadAnkiTsv(filename: string, content: string): void {
  const blob = new Blob([content], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
