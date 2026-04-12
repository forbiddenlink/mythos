import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import stories from "@/data/stories.json";
import { checkOracleRateLimit } from "@/lib/oracle/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  storySlug: z.string().min(1).max(200),
  count: z.number().int().min(1).max(10).optional(),
});

const QuizOutSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correctIndex: z.number().int().min(0).max(3),
        rationale: z.string(),
      }),
    )
    .min(1)
    .max(10),
});

const DEFAULT_MODEL = "claude-sonnet-4-6";

function stripMarkdownLite(s: string): string {
  return s
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .slice(0, 14_000);
}

/**
 * Generate multiple-choice quiz questions grounded in a single story's text.
 * Requires ANTHROPIC_API_KEY; uses the same rate limit bucket as the Oracle.
 */
export async function POST(req: NextRequest) {
  try {
    const json: unknown = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const { storySlug, count = 5 } = parsed.data;
    const list = stories as Array<{
      slug: string;
      title: string;
      summary: string;
      fullNarrative?: string;
      keyExcerpts?: string;
    }>;
    const story = list.find((s) => s.slug === storySlug);
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    if (!(await checkOracleRateLimit(ip))) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 },
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Quiz generation is not configured (missing API key)." },
        { status: 503 },
      );
    }

    const sourceText = [
      `Title: ${story.title}`,
      `Summary: ${story.summary}`,
      story.keyExcerpts ? `Key excerpts: ${story.keyExcerpts}` : "",
      story.fullNarrative
        ? `Full narrative (excerpt):\n${stripMarkdownLite(story.fullNarrative)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const modelId =
      process.env.ANTHROPIC_ORACLE_MODEL?.trim() || DEFAULT_MODEL;

    const { object } = await generateObject({
      model: anthropic(modelId),
      schema: QuizOutSchema,
      prompt: `You write study questions for Mythos Atlas, a mythology encyclopedia.

Rules:
- Generate exactly ${count} multiple-choice questions.
- Each question must be answerable ONLY from the SOURCE TEXT below. Do not use outside knowledge.
- If the text does not support enough distinct facts, still produce the requested count by focusing on names, relationships, and events explicitly stated.
- Four options per question; exactly one correct answer.
- "rationale" must cite which part of the story supports the correct answer (one short sentence).
- Wording should be clear for students; avoid trick questions.

SOURCE TEXT:
${sourceText}`,
    });

    return NextResponse.json({
      storySlug: story.slug,
      title: story.title,
      questions: object.questions,
    });
  } catch (e) {
    console.error("[api/quiz/generate-from-story]", e);
    return NextResponse.json(
      { error: "Quiz generation failed" },
      { status: 500 },
    );
  }
}
