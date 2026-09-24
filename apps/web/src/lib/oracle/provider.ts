/**
 * Oracle model provider resolution.
 *
 * The Oracle can run on Anthropic or Groq. Anthropic takes precedence when
 * both keys are present unless ORACLE_PROVIDER selects another provider.
 * Production rate limits require shared Upstash storage for either provider.
 */

import { anthropic } from "@ai-sdk/anthropic";
import { groq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

export type OracleProvider = "anthropic" | "groq";

const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-5";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

/** Resolve which provider the Oracle should use, or null if none is configured. */
export function resolveOracleProvider(): OracleProvider | null {
  const explicit = process.env.ORACLE_PROVIDER?.trim().toLowerCase();
  if (explicit === "groq" && process.env.GROQ_API_KEY) return "groq";
  if (explicit === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    return "anthropic";
  }
  // Default precedence: Anthropic if keyed, else Groq.
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.GROQ_API_KEY) return "groq";
  return null;
}

/**
 * Legacy provider classification; this does not determine production rate-limit
 * enforcement or the billing terms of the configured account.
 */
export function isPaidOracleProvider(): boolean {
  return resolveOracleProvider() === "anthropic";
}

function groqFallbackModel(): LanguageModel | null {
  if (!process.env.GROQ_API_KEY) return null;
  return groq(process.env.GROQ_ORACLE_MODEL?.trim() || DEFAULT_GROQ_MODEL);
}

/** Resolve the language model for the Oracle, or null if unconfigured. */
export function getOracleModel(): LanguageModel | null {
  const provider = resolveOracleProvider();
  if (provider === "anthropic") {
    try {
      return anthropic(
        process.env.ANTHROPIC_ORACLE_MODEL?.trim() || DEFAULT_ANTHROPIC_MODEL,
      );
    } catch {
      // Anthropic client construction failed (e.g. bad key format) — fall
      // back to Groq if it's configured, so the Oracle stays available.
      return groqFallbackModel();
    }
  }
  if (provider === "groq") {
    return groqFallbackModel();
  }
  return null;
}
