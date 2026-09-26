/**
 * Oracle model provider resolution.
 *
 * The Oracle can run on Anthropic or Groq.
 *
 * - `ORACLE_PROVIDER=anthropic|groq` pins the provider. If that provider has no
 *   key, or its model cannot be constructed, the Oracle is unavailable (and the
 *   failure is logged) — it never silently switches to the other provider.
 * - Without `ORACLE_PROVIDER`, Anthropic is used when keyed, else Groq. In this
 *   default mode only, an Anthropic construction failure falls back to Groq
 *   (when keyed), and the fallback is logged as an error.
 *
 * Production rate limits require shared Upstash storage for either provider.
 */

import { anthropic } from "@ai-sdk/anthropic";
import { groq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";
import { logger } from "@/lib/logger";

export type OracleProvider = "anthropic" | "groq";

export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-5";
export const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

const loggedOnce = new Set<string>();
function logErrorOnce(key: string, message: string, context?: object): void {
  if (loggedOnce.has(key)) return;
  loggedOnce.add(key);
  logger.error(message, { route: "/api/oracle", ...context });
}

/** Test helper: forget which configuration errors were already logged. */
export function __resetProviderLogForTests(): void {
  loggedOnce.clear();
}

type ExplicitProvider = OracleProvider | "invalid" | null;

function explicitProvider(): ExplicitProvider {
  const raw = process.env.ORACLE_PROVIDER?.trim().toLowerCase();
  if (!raw) return null;
  if (raw === "anthropic" || raw === "groq") return raw;
  return "invalid";
}

function hasKey(provider: OracleProvider): boolean {
  return provider === "anthropic"
    ? Boolean(process.env.ANTHROPIC_API_KEY)
    : Boolean(process.env.GROQ_API_KEY);
}

/** Resolve which provider the Oracle should use, or null if none is usable. */
export function resolveOracleProvider(): OracleProvider | null {
  const explicit = explicitProvider();
  if (explicit === "anthropic" || explicit === "groq") {
    // Pinned: no cross-provider fallback.
    return hasKey(explicit) ? explicit : null;
  }
  if (explicit === "invalid") {
    logErrorOnce(
      "invalid-provider",
      "[oracle] ORACLE_PROVIDER must be 'anthropic' or 'groq'; ignoring it and using default precedence",
      { value: process.env.ORACLE_PROVIDER },
    );
  }
  if (hasKey("anthropic")) return "anthropic";
  if (hasKey("groq")) return "groq";
  return null;
}

/**
 * Legacy provider classification; this does not determine production rate-limit
 * enforcement or the billing terms of the configured account.
 */
export function isPaidOracleProvider(): boolean {
  return resolveOracleProvider() === "anthropic";
}

function buildModel(provider: OracleProvider): LanguageModel {
  if (provider === "anthropic") {
    return anthropic(
      process.env.ANTHROPIC_ORACLE_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL,
    );
  }
  return groq(process.env.GROQ_ORACLE_MODEL?.trim() || DEFAULT_GROQ_MODEL);
}

function tryBuildModel(provider: OracleProvider): LanguageModel | null {
  try {
    return buildModel(provider);
  } catch (error) {
    logger.error(`[oracle] failed to construct the ${provider} model`, {
      route: "/api/oracle",
      provider,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export interface OracleModelSelection {
  provider: OracleProvider;
  model: LanguageModel;
}

/** Resolve the provider and model for the Oracle, or null if unavailable. */
export function getOracleModelSelection(): OracleModelSelection | null {
  const explicit = explicitProvider();
  const provider = resolveOracleProvider();

  if (!provider) {
    if (explicit === "anthropic" || explicit === "groq") {
      logErrorOnce(
        `missing-key-${explicit}`,
        `[oracle] ORACLE_PROVIDER=${explicit} but its API key is not set; the Oracle is unavailable`,
      );
    }
    return null;
  }

  const model = tryBuildModel(provider);
  if (model) return { provider, model };

  const pinned = explicit === "anthropic" || explicit === "groq";
  if (!pinned && provider === "anthropic" && hasKey("groq")) {
    logger.error(
      "[oracle] Anthropic model construction failed; falling back to Groq (unset ORACLE_PROVIDER default precedence)",
      { route: "/api/oracle" },
    );
    const fallback = tryBuildModel("groq");
    if (fallback) return { provider: "groq", model: fallback };
  }
  return null;
}

/** Resolve the language model for the Oracle, or null if unavailable. */
export function getOracleModel(): LanguageModel | null {
  return getOracleModelSelection()?.model ?? null;
}
