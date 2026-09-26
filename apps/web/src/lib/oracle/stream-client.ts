/**
 * Minimal client-side reader for the Oracle's UI message stream (AI SDK SSE:
 * `data: {json}\n\n` events ending with `data: [DONE]`).
 *
 * Only the chunk types the Oracle emits are handled: `text-delta` (answer
 * text), `data-oracle-sources` (grounding metadata) and `error`. Kept
 * dependency-free so the client bundle does not pull in the `ai` package.
 */

import {
  parseOracleSourcesPayload,
  type OracleSourcesPayload,
} from "@/lib/oracle/citations";
import { ORACLE_SOURCES_CHUNK_TYPE } from "@/lib/oracle/constants";

export interface OracleStreamHandlers {
  onText?: (fullText: string, delta: string) => void;
  onSources?: (sources: OracleSourcesPayload) => void;
}

export interface OracleStreamResult {
  text: string;
  sources: OracleSourcesPayload | null;
}

export class OracleStreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OracleStreamError";
  }
}

function handleEvent(
  payload: string,
  state: OracleStreamResult,
  handlers: OracleStreamHandlers,
): void {
  if (!payload || payload === "[DONE]") return;
  let chunk: unknown;
  try {
    chunk = JSON.parse(payload);
  } catch {
    return; // ignore malformed events rather than abort the answer
  }
  if (typeof chunk !== "object" || chunk === null) return;
  const c = chunk as {
    type?: unknown;
    delta?: unknown;
    data?: unknown;
    errorText?: unknown;
  };

  if (c.type === "text-delta" && typeof c.delta === "string") {
    state.text += c.delta;
    handlers.onText?.(state.text, c.delta);
  } else if (c.type === ORACLE_SOURCES_CHUNK_TYPE) {
    const sources = parseOracleSourcesPayload(c.data);
    if (sources) {
      state.sources = sources;
      handlers.onSources?.(sources);
    }
  } else if (c.type === "error") {
    throw new OracleStreamError(
      typeof c.errorText === "string" && c.errorText
        ? c.errorText
        : "The Oracle's vision clouded over.",
    );
  }
}

function drainEvents(
  buffer: string,
  state: OracleStreamResult,
  handlers: OracleStreamHandlers,
): string {
  const normalized = buffer.replace(/\r\n/g, "\n");
  const events = normalized.split("\n\n");
  const rest = events.pop() ?? "";
  for (const event of events) {
    const data = event
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).replace(/^ /, ""))
      .join("\n");
    handleEvent(data, state, handlers);
  }
  return rest;
}

/** Read an Oracle response body to completion, reporting progress through `handlers`. */
export async function readOracleStream(
  body: ReadableStream<Uint8Array>,
  handlers: OracleStreamHandlers = {},
): Promise<OracleStreamResult> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const state: OracleStreamResult = { text: "", sources: null };
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    buffer = drainEvents(buffer, state, handlers);
  }
  buffer += decoder.decode();
  drainEvents(`${buffer}\n\n`, state, handlers);
  return state;
}
