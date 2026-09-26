import type { Bloodline, Kin } from "@/lib/deity-page";

/**
 * Family questions answered from the atlas's own kinship records.
 *
 * Every answer restates relationships.json and says so: ancient sources often
 * disagree on parentage, and the catalog records some lines and not others, so
 * an answer never claims to be the complete or only tradition.
 */

export interface FamilyAnswer {
  question: string;
  /** Full answer text (structured data and screen readers). */
  answer: string;
  /** Visible form: `lead`, then the relatives as links, then `tail`. */
  lead: string;
  kin: Kin[];
  tail: string;
}

export function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
}

/** "Zeus's", "Heracles's": the atlas follows Chicago style for names in -s. */
function possessive(name: string): string {
  return `${name}'s`;
}

function entry(
  question: string,
  lead: string,
  kin: Kin[],
  tail: string,
): FamilyAnswer {
  return {
    question,
    answer: `${lead} ${joinNames(kin.map((k) => k.name))}${tail}`,
    lead,
    kin,
    tail,
  };
}

export function familyFaq(name: string, bloodline: Bloodline): FamilyAnswer[] {
  const out: FamilyAnswer[] = [];
  const { parents, children, consorts, siblings } = bloodline;
  const caveat = " Ancient accounts do not always agree on divine parentage.";

  if (parents.length > 0) {
    out.push(
      entry(
        `Who are ${possessive(name)} parents?`,
        parents.length === 1
          ? `The atlas's kinship records name one parent of ${name}:`
          : `The atlas's kinship records name ${parents.length} parents of ${name}:`,
        parents,
        `.${caveat}`,
      ),
    );
  }
  if (children.length > 0) {
    out.push(
      entry(
        `Who are ${possessive(name)} children?`,
        `Children of ${name} recorded in the atlas:`,
        children,
        ".",
      ),
    );
  }
  if (consorts.length > 0) {
    out.push(
      entry(
        `Who were ${possessive(name)} spouses and consorts?`,
        `Spouses and consorts of ${name} recorded in the atlas:`,
        consorts,
        ".",
      ),
    );
  }
  if (siblings.length > 0) {
    out.push(
      entry(
        `Who are ${possessive(name)} siblings?`,
        `Siblings of ${name} recorded in the atlas:`,
        siblings,
        ".",
      ),
    );
  }
  return out;
}
