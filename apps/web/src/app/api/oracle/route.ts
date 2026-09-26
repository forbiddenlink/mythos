import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type ToolSet,
  type UIMessage,
} from "ai";
import type { NextRequest } from "next/server";
import { z } from "zod";
import type { Locale } from "@/i18n/config";
import type { OracleSourcesPayload } from "@/lib/oracle/citations";
import { getOracleClientIdentity } from "@/lib/oracle/client-identity";
import { ORACLE_SOURCES_CHUNK_TYPE } from "@/lib/oracle/constants";
import { notInSourcesReply } from "@/lib/oracle/coverage";
import { checkGlobalOracleBudget } from "@/lib/oracle/global-budget";
import { getOracleGroundingForConversation } from "@/lib/oracle/grounding";
import { trimOracleHistory } from "@/lib/oracle/history";
import { parseOracleLocale } from "@/lib/oracle/oracle-locale";
import { buildOracleSystemPrompt } from "@/lib/oracle/prompt";
import { getOracleModelSelection } from "@/lib/oracle/provider";
import {
  checkOracleAnonymousRateLimit,
  checkOracleRateLimit,
} from "@/lib/oracle/rate-limit";
import {
  forbiddenUnlessSameOrigin,
  isOracleKillSwitchOn,
} from "@/lib/oracle/request-guards";
import {
  estimateOracleRequestTokens,
  reserveOracleTokens,
  settleOracleTokens,
} from "@/lib/oracle/token-budget";
import { logger } from "@/lib/logger";
import { readJsonBody } from "@/lib/http/read-json-body";

// Claude's adaptive thinking spends from the same output ceiling as the
// answer, so keep effort low for short grounded replies and leave headroom.
const MAX_OUTPUT_TOKENS = 1_200;

const MAX_MESSAGE_CONTENT_CHARS = 4_000;
const MAX_MESSAGES = 20;
// A UTF-8 character can consume four bytes; leave room for JSON structure.
const MAX_REQUEST_BODY_BYTES = 384 * 1024;

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(MAX_MESSAGE_CONTENT_CHARS),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(MAX_MESSAGES),
  locale: z.enum(["en", "es", "fr", "de"]).optional(),
});

type OracleUIMessage = UIMessage<
  unknown,
  { [K in "oracle-sources"]: OracleSourcesPayload }
>;

const STREAM_ERROR_MESSAGE = "The mists cloud the Oracle's vision. Try again.";

function jsonError(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sourcesChunk(payload: OracleSourcesPayload) {
  return { type: ORACLE_SOURCES_CHUNK_TYPE, data: payload } as const;
}

/** Stream a fixed reply (no model call) in the same wire format as a model answer. */
function staticReplyResponse(
  payload: OracleSourcesPayload,
  text: string,
): Response {
  const stream = createUIMessageStream<OracleUIMessage>({
    execute: ({ writer }) => {
      writer.write(sourcesChunk(payload));
      writer.write({ type: "text-start", id: "oracle-static" });
      writer.write({ type: "text-delta", id: "oracle-static", delta: text });
      writer.write({ type: "text-end", id: "oracle-static" });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

export async function POST(req: NextRequest) {
  try {
    if (isOracleKillSwitchOn()) {
      return jsonError(503, "The Oracle is temporarily offline.");
    }

    const originBlock = forbiddenUnlessSameOrigin(req);
    if (originBlock) return originBlock;

    const body = await readJsonBody(req, MAX_REQUEST_BODY_BYTES);
    if (!body.ok) {
      return jsonError(
        body.reason === "too_large" ? 413 : 400,
        "Invalid request body",
      );
    }

    const parsed = BodySchema.safeParse(body.value);
    if (!parsed.success) return jsonError(400, "Invalid request body");

    const locale: Locale = parseOracleLocale(parsed.data.locale);
    const messages = trimOracleHistory(parsed.data.messages);
    if (messages.length === 0) return jsonError(400, "Invalid request body");

    const client = getOracleClientIdentity(req.headers);
    const rateLimit =
      client.kind === "ip"
        ? await checkOracleRateLimit(client.key)
        : await checkOracleAnonymousRateLimit(client.key);
    if (!rateLimit.allowed) {
      return rateLimit.reason === "misconfigured"
        ? jsonError(
            503,
            "The Oracle is unavailable. Rate limiting is not configured.",
          )
        : jsonError(429, "The Oracle must rest. Please return in an hour.");
    }

    const selection = getOracleModelSelection();
    if (!selection) {
      return jsonError(
        503,
        "The Oracle is not yet awakened. No model provider is configured.",
      );
    }

    const grounding = await getOracleGroundingForConversation(messages, {
      locale,
    });
    const sources: OracleSourcesPayload = {
      hitCount: grounding.hitCount,
      entities: grounding.citations,
      primarySources: grounding.primarySources,
    };

    // Nothing in Mythos Atlas matched: say so without spending a model call,
    // so the Oracle cannot improvise a myth from outside our sources.
    if (grounding.hitCount === 0) {
      return staticReplyResponse(sources, notInSourcesReply(locale));
    }

    const budget = await checkGlobalOracleBudget();
    if (!budget.allowed) {
      return budget.reason === "misconfigured"
        ? jsonError(
            503,
            "The Oracle is unavailable. Rate limiting is not configured.",
          )
        : jsonError(
            429,
            "The Oracle has reached today's capacity. Please return tomorrow.",
          );
    }

    const system = buildOracleSystemPrompt(grounding.context, locale);
    const tokens = await reserveOracleTokens(
      estimateOracleRequestTokens({
        system,
        messages,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      }),
    );
    if (!tokens.allowed) {
      return tokens.reason === "misconfigured"
        ? jsonError(
            503,
            "The Oracle is unavailable. Rate limiting is not configured.",
          )
        : jsonError(
            429,
            "The Oracle has reached today's capacity. Please return tomorrow.",
          );
    }
    const reservation = tokens.reservation;

    const result = streamText({
      model: selection.model,
      system,
      messages,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      providerOptions:
        selection.provider === "anthropic"
          ? { anthropic: { effort: "low" } }
          : undefined,
      onEnd: async ({ totalUsage }) => {
        const used =
          totalUsage.totalTokens ??
          (totalUsage.inputTokens != null && totalUsage.outputTokens != null
            ? totalUsage.inputTokens + totalUsage.outputTokens
            : undefined);
        try {
          await settleOracleTokens(reservation, used);
        } catch (error) {
          logger.exception(
            error instanceof Error ? error : new Error(String(error)),
            { route: "/api/oracle", step: "settle-token-budget" },
          );
        }
      },
      onError: ({ error }) => {
        logger.exception(
          error instanceof Error ? error : new Error("Oracle stream error"),
          { route: "/api/oracle", provider: selection.provider },
        );
      },
    });

    const stream = createUIMessageStream<OracleUIMessage>({
      execute: ({ writer }) => {
        // Grounding metadata goes first, in the body, so the client can render
        // sources under the answer without relying on size-limited headers.
        writer.write(sourcesChunk(sources));
        writer.merge(
          toUIMessageStream<ToolSet, OracleUIMessage>({
            stream: result.stream,
            onError: () => STREAM_ERROR_MESSAGE,
          }),
        );
      },
      onError: () => STREAM_ERROR_MESSAGE,
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    logger.exception(
      error instanceof Error ? error : new Error("Oracle route error"),
      {
        route: "/api/oracle",
      },
    );
    return jsonError(500, STREAM_ERROR_MESSAGE);
  }
}
