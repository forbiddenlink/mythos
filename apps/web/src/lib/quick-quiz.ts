import { matchesDomainFilter } from "./domain-categories";
import { shuffle } from "./shuffle";

export interface QuickQuizDeity {
  id: string;
  name: string;
  domain: string[];
}

export interface QuickQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  domain: string;
}

/** Four distinct answers, with only one matching the catalogued domain. */
export function generateQuickQuizQuestion(
  deities: readonly QuickQuizDeity[],
  random: () => number = Math.random,
): QuickQuizQuestion | null {
  const normalize = (value: string) => value.trim().toLowerCase();
  const candidates = deities.filter((deity) => deity.name.trim());

  for (const target of shuffle(candidates, random)) {
    for (const raw of shuffle(target.domain, random)) {
      const domain = raw.trim();
      if (!domain || /^uncertain\b/i.test(domain)) continue;

      // Exclude every matching name, including duplicate catalogue records and
      // known aliases such as "war"/"warfare" and "sun"/"the sun".
      const acceptedNames = new Set(
        candidates
          .filter((deity) =>
            matchesDomainFilter(deity.domain.map(normalize), normalize(domain)),
          )
          .map((deity) => normalize(deity.name)),
      );
      acceptedNames.add(normalize(target.name));
      const wrongNames = new Map<string, string>();
      for (const deity of candidates) {
        const key = normalize(deity.name);
        if (!acceptedNames.has(key)) wrongNames.set(key, deity.name.trim());
      }
      if (wrongNames.size < 3) continue;

      const answer = target.name.trim();
      return {
        question: `Which figure is linked to "${domain}" in the atlas?`,
        options: shuffle(
          [answer, ...shuffle([...wrongNames.values()], random).slice(0, 3)],
          random,
        ),
        correctAnswer: answer,
        domain,
      };
    }
  }
  return null;
}
