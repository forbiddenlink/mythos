import { describe, expect, it } from "vitest";
import {
  basisSentence,
  comparisonFaq,
  comparisonHeadline,
  lowerList,
  sentence,
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
    expect(lowerList(["Sky"])).toBe("sky");
    expect(lowerList(["Sky", "Thunder"])).toBe("sky and thunder");
    expect(lowerList(["Sky", "Thunder", "Justice"])).toBe(
      "sky, thunder, and justice",
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

describe("comparisonFaq", () => {
  it("answers the relation with the basis sentence", () => {
    for (const comparison of all) {
      const [related] = comparisonFaq(comparison);
      expect(related.question).toBe(
        `How are ${comparison.a.displayName} and ${comparison.b.displayName} related?`,
      );
      expect(related.answer).toBe(basisSentence(comparison));
    }
  });

  it("names the shared domains, or says none is recorded", () => {
    const shared = pick((c) => c.sharedDomains.length > 0);
    expect(comparisonFaq(shared)[1]).toEqual({
      question: `What do ${shared.a.name} and ${shared.b.name} have in common?`,
      answer: `Both are associated with ${lowerList(shared.sharedDomains)}.`,
    });

    const none = pick((c) => c.sharedDomains.length === 0);
    expect(comparisonFaq(none)[1].answer).toBe(
      `They share no domain in this atlas: ${none.a.name} is associated with ${lowerList(none.a.domain)}, and ${none.b.name} with ${lowerList(none.b.domain)}.`,
    );
  });

  it("names one tradition or both", () => {
    const same = pick((c) => c.sameTradition);
    expect(comparisonFaq(same)[2]).toEqual({
      question: "Which traditions do they belong to?",
      answer: `Both belong to the ${same.a.pantheonName}.`,
    });

    const across = pick((c) => !c.sameTradition);
    expect(comparisonFaq(across)[2].answer).toBe(
      `${across.a.displayName} belongs to the ${across.a.pantheonName}, and ${across.b.displayName} to the ${across.b.pantheonName}.`,
    );
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
