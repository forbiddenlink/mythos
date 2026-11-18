import { describe, expect, it } from "vitest";
import {
  basisSentence,
  comparisonFaq,
  comparisonHeadline,
  contrastSummary,
  phraseList,
  sentence,
  sharedTraitSentences,
  shortTradition,
} from "@/lib/comparison-copy";
import {
  getDeityComparison,
  getDeityComparisons,
  type DeityComparison,
} from "@/lib/comparisons";

const all = getDeityComparisons();

function pick(test: (comparison: DeityComparison) => boolean): DeityComparison {
  const found = all.find(test);
  if (!found) throw new Error("no comparison matches");
  return found;
}

describe("comparison copy helpers", () => {
  it("writes a list the way a sentence reads it", () => {
    expect(phraseList(["sky"])).toBe("sky");
    expect(phraseList(["sky", "thunder"])).toBe("sky and thunder");
    expect(phraseList(["sky", "thunder", "justice"])).toBe(
      "sky, thunder, and justice",
    );
  });

  it("keeps the capital of a proper noun inside a list", () => {
    expect(phraseList(["kingship", "the founding of Cusco"])).toBe(
      "kingship and the founding of Cusco",
    );
    const rivals = getDeityComparison("rama-vs-ravana")!;
    expect(comparisonFaq(rivals)[0].answer).toContain(
      "the antagonist role in the Ramayana",
    );
  });

  it("turns a note into a sentence without doubling its full stop", () => {
    expect(sentence("both rule the sky")).toBe("Both rule the sky.");
    expect(sentence(" Both rule the sky. ")).toBe("Both rule the sky.");
    expect(sentence("is it so?")).toBe("Is it so?");
  });

  it("names a tradition without its kind", () => {
    const zeusOdin = getDeityComparison("odin-vs-zeus")!;
    expect(shortTradition(zeusOdin.a)).toBe("Norse");
    expect(shortTradition(zeusOdin.b)).toBe("Greek");
  });

  it("heads a page with the two display names", () => {
    expect(comparisonHeadline(getDeityComparison("odin-vs-zeus")!)).toBe(
      "Odin vs Zeus",
    );
    const apollos = pick((c) => c.a.name === c.b.name);
    expect(comparisonHeadline(apollos)).toBe(
      `${apollos.a.displayName} vs ${apollos.b.displayName}`,
    );
    expect(apollos.a.displayName).not.toBe(apollos.b.displayName);
  });
});

describe("basisSentence", () => {
  it("leads with the curated note for a parallel", () => {
    const parallel = pick((c) => c.basis.kind === "parallel");
    if (parallel.basis.kind !== "parallel") throw new Error("unreachable");
    expect(basisSentence(parallel)).toBe(sentence(parallel.basis.notes[0]));
  });

  it.each(["siblings", "rivals", "parent and child"] as const)(
    "states a recorded %s relation and its tradition",
    (relation) => {
      const kin = pick(
        (c) => c.basis.kind === "kin" && c.basis.relation === relation,
      );
      expect(basisSentence(kin)).toBe(
        `${kin.a.displayName} and ${kin.b.displayName} are recorded as ${relation} in the ${kin.a.pantheonName}.`,
      );
    },
  );

  it("falls back to the two traditions when a parallel has no note", () => {
    const base = pick((c) => c.basis.kind === "parallel" && !c.sameTradition);
    const noNote: DeityComparison = {
      ...base,
      basis: { kind: "parallel", notes: [] },
    };
    expect(basisSentence(noNote)).toBe(
      `${base.a.displayName} and ${base.b.displayName} hold comparable places in the ${shortTradition(base.a)} and ${shortTradition(base.b)} traditions.`,
    );
  });
});

describe("sharedTraitSentences", () => {
  it("names the shared domains and the shared symbols", () => {
    const both = pick(
      (c) => c.sharedDomains.length > 0 && c.sharedSymbols.length > 1,
    );
    expect(sharedTraitSentences(both)).toEqual([
      `Both are associated with ${phraseList(both.sharedDomains)}.`,
      `They share symbols: ${phraseList(both.sharedSymbols)}.`,
    ]);

    const oneSymbol = pick(
      (c) => c.sharedDomains.length === 0 && c.sharedSymbols.length === 1,
    );
    expect(sharedTraitSentences(oneSymbol)).toEqual([
      `They share a symbol: ${phraseList(oneSymbol.sharedSymbols)}.`,
    ]);
  });

  it("says why two figures with nothing in common share a page", () => {
    const parallel = pick(
      (c) =>
        c.basis.kind === "parallel" &&
        c.sharedDomains.length === 0 &&
        c.sharedSymbols.length === 0,
    );
    expect(sharedTraitSentences(parallel)).toEqual([
      `The atlas records no domain or symbol that ${parallel.a.name} and ${parallel.b.name} share.`,
      "They are compared for the part each plays in their own tradition rather than for any attribute in common.",
    ]);

    const kin = pick(
      (c) =>
        c.basis.kind === "kin" &&
        c.sharedDomains.length === 0 &&
        c.sharedSymbols.length === 0,
    );
    expect(sharedTraitSentences(kin)[1]).toBe(
      "They are compared because of how the myths connect them, not because of what they rule.",
    );
  });
});

describe("contrastSummary", () => {
  it("names what both hold, then what each holds alone", () => {
    const both = pick(
      (c) =>
        c.sharedDomains.length > 0 &&
        c.distinctDomains.a.length > 0 &&
        c.distinctDomains.b.length > 0,
    );
    expect(contrastSummary(both)).toBe(
      `Both are associated with ${phraseList(both.sharedDomains.slice(0, 3))}. ${both.a.displayName} is also associated with ${phraseList(both.distinctDomains.a.slice(0, 3))}, and ${both.b.displayName} with ${phraseList(both.distinctDomains.b.slice(0, 3))}.`,
    );
  });

  it("states each figure's own domains when the two share none", () => {
    const none = pick((c) => c.sharedDomains.length === 0);
    expect(contrastSummary(none)).toBe(
      `${none.a.displayName} is associated with ${phraseList(none.a.domain.slice(0, 3))}, and ${none.b.displayName} with ${phraseList(none.b.domain.slice(0, 3))}.`,
    );
  });

  it("names only the figure that holds a domain alone", () => {
    const oneSided = getDeityComparison("athena-vs-minerva")!;
    expect(oneSided.distinctDomains.a).toEqual([]);
    expect(contrastSummary(oneSided)).toBe(
      `Both are associated with ${phraseList(oneSided.sharedDomains.slice(0, 3))}. ${oneSided.b.displayName} is also associated with ${phraseList(oneSided.distinctDomains.b)}.`,
    );
  });

  it("stops at the shared domains when neither holds one alone", () => {
    const same = getDeityComparison("hera-vs-juno")!;
    expect(contrastSummary(same)).toBe(
      `Both are associated with ${phraseList(same.sharedDomains.slice(0, 3))}.`,
    );
  });

  it("names at most three domains from each list", () => {
    const odinZeus = getDeityComparison("odin-vs-zeus")!;
    expect(odinZeus.a.domain.length).toBeGreaterThan(3);
    expect(odinZeus.b.domain.length).toBeGreaterThan(3);
    expect(contrastSummary(odinZeus)).toBe(
      "Odin is associated with wisdom, war, and death, and Zeus with sky, thunder, and lightning.",
    );
  });

  it("writes whole sentences for every pair", () => {
    for (const comparison of all) {
      const summary = contrastSummary(comparison);
      expect(summary, comparison.slug).toMatch(/\.$/);
      expect(summary, comparison.slug).not.toMatch(
        /undefined|\.\.|\s{2}| ,| \.|with \.|with ,/,
      );
    }
  });
});

describe("comparisonFaq", () => {
  it("leads with the difference, the query the page is found by", () => {
    const across = pick(
      (c) =>
        !c.sameTradition &&
        c.distinctDomains.a.length > 0 &&
        c.distinctDomains.b.length > 0,
    );
    expect(comparisonFaq(across)[0]).toEqual({
      question: `What is the difference between ${across.a.displayName} and ${across.b.displayName}?`,
      answer: `${across.a.displayName} belongs to the ${across.a.pantheonName}, and ${across.b.displayName} to the ${across.b.pantheonName}. In this atlas, only ${across.a.displayName} is associated with ${phraseList(across.distinctDomains.a)}, and only ${across.b.displayName} with ${phraseList(across.distinctDomains.b)}.`,
    });
  });

  it("does not call one shared tradition a difference", () => {
    const same = pick(
      (c) =>
        c.sameTradition &&
        c.distinctDomains.a.length > 0 &&
        c.distinctDomains.b.length > 0,
    );
    expect(comparisonFaq(same)[0].answer).toBe(
      `In this atlas, only ${same.a.displayName} is associated with ${phraseList(same.distinctDomains.a)}, and only ${same.b.displayName} with ${phraseList(same.distinctDomains.b)}.`,
    );
    expect(comparisonFaq(same).at(-1)).toEqual({
      question: "Which traditions do they belong to?",
      answer: `Both belong to the ${same.a.pantheonName}.`,
    });
  });

  it("says so when the records give one figure no domain of its own", () => {
    const oneSided = getDeityComparison("athena-vs-minerva")!;
    expect(comparisonFaq(oneSided)[0].answer).toContain(
      `In this atlas, only ${oneSided.b.displayName} is associated with ${phraseList(oneSided.distinctDomains.b)}; every domain recorded for ${oneSided.a.displayName} is shared with ${oneSided.b.displayName}.`,
    );

    const same = getDeityComparison("hera-vs-juno")!;
    expect(comparisonFaq(same)[0].answer).toContain(
      "The atlas records the same domains for both.",
    );
  });

  it("answers what they share with the sentences the page shows", () => {
    for (const comparison of all) {
      expect(comparisonFaq(comparison)[1]).toEqual({
        question: `What do ${comparison.a.displayName} and ${comparison.b.displayName} have in common?`,
        answer: sharedTraitSentences(comparison).join(" "),
      });
    }
  });

  it("answers the relation with the basis sentence", () => {
    for (const comparison of all) {
      const related = comparisonFaq(comparison)[2];
      expect(related.question).toBe(
        `How are ${comparison.a.displayName} and ${comparison.b.displayName} related?`,
      );
      expect(related.answer).toBe(basisSentence(comparison));
    }
  });

  it("asks about traditions only when the two share one", () => {
    for (const comparison of all) {
      const questions = comparisonFaq(comparison).map((item) => item.question);
      expect(questions.includes("Which traditions do they belong to?")).toBe(
        comparison.sameTradition,
      );
      expect(new Set(questions).size, comparison.slug).toBe(questions.length);
    }
  });

  it("never asks about two figures by one bare name", () => {
    const apollos = pick((c) => c.a.name === c.b.name);
    for (const { question } of comparisonFaq(apollos)) {
      expect(question).not.toContain(`${apollos.a.name} and ${apollos.b.name}`);
    }
  });

  it("writes whole sentences for every pair", () => {
    for (const comparison of all) {
      for (const { question, answer } of comparisonFaq(comparison)) {
        expect(question, comparison.slug).toMatch(/\?$/);
        expect(answer, comparison.slug).toMatch(/[.!?]$/);
        expect(`${question} ${answer}`, comparison.slug).not.toMatch(
          /undefined|\.\.|\s{2}| ,| \./,
        );
      }
    }
  });
});
