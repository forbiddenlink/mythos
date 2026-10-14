/**
 * Plain question-and-answer pairs for creature and story entries, restating
 * the entry's own fields. A question is skipped when its field is empty, so no
 * answer is ever written for data the catalog does not hold.
 */

export interface EntryFaqItem {
  question: string;
  answer: string;
}

function clean(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

export function creatureFaq(creature: {
  name: string;
  description?: string | null;
  habitat?: string | null;
  abilities?: readonly string[] | null;
}): EntryFaqItem[] {
  const out: EntryFaqItem[] = [];
  const description = clean(creature.description);
  const habitat = clean(creature.habitat);
  const abilities = (creature.abilities ?? []).map(clean).filter(Boolean);

  if (description) {
    out.push({ question: `What is ${creature.name}?`, answer: description });
  }
  if (habitat) {
    out.push({
      question: `Where does ${creature.name} live?`,
      answer: `The atlas lists ${creature.name}'s habitat as ${habitat}.`,
    });
  }
  if (abilities.length > 0) {
    out.push({
      question: `What abilities does ${creature.name} have?`,
      answer: `The atlas lists these abilities for ${creature.name}: ${joinList(abilities)}.`,
    });
  }
  return out;
}

export function storyFaq(story: {
  title: string;
  summary?: string | null;
  moralThemes?: readonly string[] | null;
}): EntryFaqItem[] {
  const out: EntryFaqItem[] = [];
  const summary = clean(story.summary);
  const themes = (story.moralThemes ?? []).map(clean).filter(Boolean);

  if (summary) {
    out.push({
      question: `What is the story of ${story.title} about?`,
      answer: summary,
    });
  }
  if (themes.length > 0) {
    out.push({
      question: `What themes does ${story.title} explore?`,
      answer: `The atlas lists these themes for ${story.title}: ${joinList(themes)}.`,
    });
  }
  return out;
}
