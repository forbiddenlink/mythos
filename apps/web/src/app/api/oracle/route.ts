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
import { checkGlobalOracleBudget } from "@/lib/oracle/global-budget";
import { getOracleModel } from "@/lib/oracle/provider";
import { checkOracleRateLimit } from "@/lib/oracle/rate-limit";
import {
  forbiddenUnlessSameOrigin,
  isOracleKillSwitchOn,
} from "@/lib/oracle/request-guards";
import { logger } from "@/lib/logger";

const MAX_OUTPUT_TOKENS = 800;

const MAX_MESSAGE_CONTENT_CHARS = 4_000;
const MAX_MESSAGES = 20;

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(MAX_MESSAGE_CONTENT_CHARS),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(MAX_MESSAGES),
  locale: z.enum(["en", "es", "fr", "de"]).optional(),
});

function getClientIp(req: NextRequest): string {
  const vercelForwarded = req.headers
    .get("x-vercel-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  if (vercelForwarded) return vercelForwarded;

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    // Prefer the last hop (proxy-appended) when a chain is present.
    if (hops.length > 0) return hops[hops.length - 1]!;
  }

  return "anonymous";
}
const BASE_SYSTEM_PROMPT = `You are the Oracle of Delphi, ancient keeper of divine wisdom and mysteries.

Your role:
- Answer questions about mythology from ALL cultures: Greek, Roman, Norse, Egyptian, Hindu, Japanese, Celtic, Aztec, Chinese, and more
- Speak in a mystical yet helpful manner, weaving ancient knowledge with clarity
- Keep responses concise (2-3 paragraphs maximum)
- When REFERENCE material from Mythos Atlas is provided below, prefer it for facts about entities and stories on this site, and you may mention paths like /deities/zeus so seekers know where to read more (speak naturally; do not paste raw URLs unless helpful)
- Be honest about your source: when you answer from the REFERENCE material, you may speak with its authority; when the REFERENCE material does not cover something and you are drawing on general mythological knowledge instead, say so plainly (e.g. "the Atlas is silent on this, but the wider myths tell us...") rather than blending the two without distinction
- If you do not know a specific detail (a name, date, genealogy, or minor variant), say the ancients have not revealed it to you rather than inventing one
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

export async function POST(req: NextRequest) {
  try {
    if (isOracleKillSwitchOn()) {
      return new Response(
        JSON.stringify({ error: "The Oracle is temporarily offline." }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const originBlock = forbiddenUnlessSameOrigin(req);
    if (originBlock) return originBlock;

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

    const rateLimit = await checkOracleRateLimit(getClientIp(req));
    if (!rateLimit.allowed) {
      if (rateLimit.reason === "misconfigured") {
        return new Response(
          JSON.stringify({
            error:
              "The Oracle is unavailable. Rate limiting is not configured.",
          }),
          { status: 503, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({
          error: "The Oracle must rest. Please return in an hour.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }

    const budget = await checkGlobalOracleBudget();
    if (!budget.allowed) {
      if (budget.reason === "misconfigured") {
        return new Response(
          JSON.stringify({
            error:
              "The Oracle is unavailable. Rate limiting is not configured.",
          }),
          { status: 503, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({
          error:
            "The Oracle has reached today's capacity. Please return tomorrow.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }

    const model = getOracleModel();
    if (!model) {
      return new Response(
        JSON.stringify({
          error:
            "The Oracle is not yet awakened. No model provider is configured.",
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

    const result = streamText({
      model,
      system,
      messages,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
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
      {
        route: "/api/oracle",
      },
    );
    return new Response(
      JSON.stringify({
        error: "The mists cloud the Oracle's vision. Try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
