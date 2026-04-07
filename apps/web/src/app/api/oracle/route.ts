import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";
import type { Locale } from "@/i18n/config";
import {
  ORACLE_CITATIONS_HEADER,
  ORACLE_GROUNDING_HITS_HEADER,
} from "@/lib/oracle/constants";
import { encodeCitationsHeader } from "@/lib/oracle/citations";
import {
  getOracleGrounding,
  lastUserMessageText,
} from "@/lib/oracle/grounding";
import {
  oracleLocaleInstruction,
  parseOracleLocale,
} from "@/lib/oracle/oracle-locale";
import { checkOracleRateLimit } from "@/lib/oracle/rate-limit";
import { logger } from "@/lib/logger";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1),
  locale: z.enum(["en", "es", "fr", "de"]).optional(),
});

const BASE_SYSTEM_PROMPT = `You are the Oracle of Delphi, ancient keeper of divine wisdom and mysteries.

Your role:
- Answer questions about mythology from ALL cultures: Greek, Roman, Norse, Egyptian, Hindu, Japanese, Celtic, Aztec, Chinese, and more
- Speak in a mystical yet helpful manner, weaving ancient knowledge with clarity
- Keep responses concise (2-3 paragraphs maximum)
- When REFERENCE material from Mythos Atlas is provided below, prefer it for facts about entities and stories on this site, and you may mention paths like /deities/zeus so seekers know where to read more (speak naturally; do not paste raw URLs unless helpful)
- When relevant, mention specific deities, stories, or mythological concepts
- Draw connections between different mythologies when appropriate
- If asked about something outside mythology, gently redirect to mythological topics

Your voice:
- Wise and ancient, but not cryptic to the point of confusion
- Occasionally use phrases like "The ancients knew...", "As the myths tell us...", "The gods speak of..."
- Be respectful of all mythological traditions
- Show genuine interest in sharing knowledge

Remember: You are a guide through the mythological realm, here to enlighten and educate seekers of ancient wisdom.`;

function buildSystemPrompt(grounding: string, locale: Locale): string {
  const localeBlock = oracleLocaleInstruction(locale);
  const base = `${BASE_SYSTEM_PROMPT}${localeBlock}`;

  if (!grounding.trim()) return base;
  return `${base}

---

${grounding}`;
}

/** Default: Claude Sonnet 4 (verify in Anthropic docs; override with ANTHROPIC_ORACLE_MODEL). */
const DEFAULT_MODEL = "claude-sonnet-4-6";

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const json: unknown = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { messages, locale: localeRaw } = parsed.data;
    const locale = parseOracleLocale(localeRaw);

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    if (!(await checkOracleRateLimit(ip))) {
      return new Response(
        JSON.stringify({
          error: "The Oracle must rest. Please return in an hour.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "The Oracle is not yet awakened. API key required.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      );
    }

    const latestUser = lastUserMessageText(messages);
    const {
      context: grounding,
      hitCount,
      citations,
    } = await getOracleGrounding(latestUser, { locale });
    const system = buildSystemPrompt(grounding, locale);

    const modelId = process.env.ANTHROPIC_ORACLE_MODEL?.trim() || DEFAULT_MODEL;

    const result = streamText({
      model: anthropic(modelId),
      system,
      messages,
    });

    const citationHeader =
      citations.length > 0 ? encodeCitationsHeader(citations) : "";

    return result.toTextStreamResponse({
      headers: {
        [ORACLE_GROUNDING_HITS_HEADER]: String(hitCount),
        ...(citationHeader
          ? { [ORACLE_CITATIONS_HEADER]: citationHeader }
          : {}),
      },
    });
  } catch (error) {
    logger.exception(
      error instanceof Error ? error : new Error("Oracle route error"),
      { route: "/api/oracle" },
    );
    return new Response(
      JSON.stringify({
        error: "The mists cloud the Oracle's vision. Try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
