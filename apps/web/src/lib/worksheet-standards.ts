/**
 * US Common Core reading standards each worksheet section practises. Every
 * worksheet has the same three sections, so one map covers them all.
 *
 * Wording is quoted from thecorestandards.org (checked 2026-11-13). Grade 4
 * and grade 6 codes are listed because the worksheets suit grades 4 to 8.
 * RI.x.1 and RL.x.2 keep the same skill at grades 5, 7 and 8; RL.4.4 (mythology
 * allusions) and RL.6.3 (plot and character change) do not carry over, since
 * RL.5.4 is figurative language and RL.7.3 is how story elements interact.
 * A teacher should still confirm the fit for their own class:
 * this is a draft alignment, not a published review.
 */
export interface StandardRef {
  /** Code without the "CCSS.ELA-Literacy." prefix, e.g. "RL.4.2". */
  code: string;
  /** The standard's text, quoted. */
  text: string;
}

export interface SectionStandards {
  section: "matching" | "family" | "short-figures" | "short-stories";
  label: string;
  /** What the students do that practises the standard. */
  practice: string;
  standards: readonly StandardRef[];
}

const RI_1 = [
  {
    code: "RI.4.1",
    text: "Refer to details and examples in a text when explaining what the text says explicitly and when drawing inferences from the text.",
  },
  {
    code: "RI.6.1",
    text: "Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.",
  },
] as const;

export const WORKSHEET_STANDARDS: readonly SectionStandards[] = [
  {
    section: "matching",
    label: "Who's who",
    practice:
      "Students match the best-known figures of a tradition to their roles, the background knowledge needed to read allusions to mythological characters.",
    standards: [
      {
        code: "RL.4.4",
        text: "Determine the meaning of words and phrases as they are used in a text, including those that allude to significant characters found in mythology (e.g., Herculean).",
      },
    ],
  },
  {
    section: "family",
    label: "Family and relationships",
    practice:
      "Students complete relationship sentences from details in the figures' entries.",
    standards: RI_1,
  },
  {
    section: "short-figures",
    label: "Short answers on figures",
    practice:
      "Students explain what a figure was associated with and which symbols identify them, using details from the entry.",
    standards: RI_1,
  },
  {
    section: "short-stories",
    label: "Short answers on stories",
    practice:
      "Students retell a story in two or three sentences, naming who is involved and what changes by the end.",
    standards: [
      {
        code: "RL.4.2",
        text: "Determine a theme of a story, drama, or poem from details in the text; summarize the text.",
      },
      {
        code: "RL.6.2",
        text: "Determine a theme or central idea of a text and how it is conveyed through particular details; provide a summary of the text distinct from personal opinions or judgments.",
      },
      {
        code: "RL.6.3",
        text: "Describe how a particular story's or drama's plot unfolds in a series of episodes as well as how the characters respond or change as the plot moves toward a resolution.",
      },
    ],
  },
];

/** Comparing two worksheets from different traditions is a teacher-led extension. */
export const COMPARISON_EXTENSION: StandardRef = {
  code: "RL.4.9",
  text: "Compare and contrast the treatment of similar themes and topics (e.g., opposition of good and evil) and patterns of events (e.g., the quest) in stories, myths, and traditional literature from different cultures.",
};

export function standardUrl(code: string): string {
  const [strand, grade, number] = code.split(".");
  return `https://www.thecorestandards.org/ELA-Literacy/${strand}/${grade}/${number}/`;
}
