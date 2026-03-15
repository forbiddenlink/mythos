import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/metadata";
import { FAQJsonLd } from "@/components/seo/JsonLd";
import { FactsPageClient } from "./FactsPageClient";
import facts from "@/data/mythology-facts.json";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythology Facts",
  description:
    "Discover fascinating facts about ancient gods, myths, and cultures from around the world. Learn surprising connections between mythologies.",
  url: "/facts",
  keywords: [
    "mythology facts",
    "ancient gods",
    "myth trivia",
    "god facts",
    "mythology trivia",
    "ancient cultures",
    "greek mythology facts",
    "norse mythology facts",
  ],
});

// Convert facts to FAQ format for rich snippets
// Select a subset of interesting facts to avoid overly large JSON-LD
const faqQuestions = facts.slice(0, 20).map((fact) => {
  // Create a question from the fact by extracting the subject
  const factText = fact.fact;
  let question: string;

  // Generate natural questions based on fact content
  if (factText.includes("named after")) {
    question = `Why is ${factText.split("named after")[0].trim()} named that way?`;
  } else if (factText.includes("because")) {
    question = `Why ${factText
      .split("because")[0]
      .trim()
      .replace(/^The|^A/i, "is the")}?`;
  } else if (factText.includes("known as")) {
    question = `What is ${factText
      .split("known as")[0]
      .trim()
      .replace(/^The|^A/i, "")} known as?`;
  } else {
    // Default: turn statement into a "Did you know" style question
    question = `What is an interesting fact about ${fact.category === "connections" ? "cross-cultural mythology" : fact.category === "language" ? "mythology and language" : fact.category === "origins" ? "deity origins" : "ancient mythology"}?`;
  }

  return {
    question,
    answer: factText,
  };
});

// Deduplicate questions to avoid repetitive FAQ entries
const uniqueFaqQuestions = faqQuestions
  .reduce(
    (acc, item) => {
      if (!acc.find((q) => q.question === item.question)) {
        acc.push(item);
      }
      return acc;
    },
    [] as typeof faqQuestions,
  )
  .slice(0, 10);

export default function FactsPage() {
  return (
    <>
      <FAQJsonLd questions={uniqueFaqQuestions} />
      <FactsPageClient />
    </>
  );
}
