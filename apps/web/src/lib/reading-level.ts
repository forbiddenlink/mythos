/**
 * Flesch-Kincaid grade level of a retelling, so a teacher can pick stories a
 * class can read. Computed from the text by formula, never set by hand:
 *   0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
 * Syllables are counted with the usual vowel-group heuristic, which is close
 * enough for a band (Grades 7-8), not for a decimal claim.
 */

/** Markdown retelling to plain prose: headings, emphasis and link targets out. */
export function toPlainProse(markdown: string): string {
  return markdown
    .split("\n")
    .filter((line) => !/^\s*#/.test(line))
    .join("\n")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>]/g, "");
}

export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;
  const trimmed = w
    .replace(/(?:[^laeiouy]es|[^laeiouy]ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups?.length ?? 0);
}

export function fleschKincaidGrade(markdown: string): number {
  const prose = toPlainProse(markdown);
  const sentences = prose
    .split(/[.!?]+(?=\s|$)|\n{2,}/)
    .filter((s) => /[a-z]/i.test(s)).length;
  const words = prose.match(/[A-Za-z][A-Za-z'’-]*/g) ?? [];
  if (sentences === 0 || words.length === 0) return 0;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  return (
    0.39 * (words.length / sentences) +
    11.8 * (syllables / words.length) -
    15.59
  );
}

export const READING_BANDS = [
  { id: "grades-5-6", label: "Grades 5–6", below: 7 },
  { id: "grades-7-8", label: "Grades 7–8", below: 9 },
  { id: "grades-9-10", label: "Grades 9–10", below: 11 },
  { id: "grades-11-up", label: "Grades 11 and up", below: Infinity },
] as const;

export type ReadingBand = (typeof READING_BANDS)[number];

export function readingBand(grade: number): ReadingBand {
  return READING_BANDS.find((band) => grade < band.below) ?? READING_BANDS[3];
}
