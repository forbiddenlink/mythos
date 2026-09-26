/**
 * Server-side conversation trimming for the Oracle.
 *
 * The client resends the whole chat on every turn. Trimming here bounds input
 * tokens (cost) no matter what the client sends, while always keeping the
 * latest user message so the model answers what was actually asked.
 */

export interface OracleChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Most recent messages (user + assistant) kept as context. */
export const ORACLE_HISTORY_MAX_MESSAGES = 6;
/** Total character budget across the kept messages. */
export const ORACLE_HISTORY_MAX_CHARS = 8_000;

export interface TrimHistoryOptions {
  maxMessages?: number;
  maxChars?: number;
}

/**
 * Keep the tail of the conversation that fits both limits.
 *
 * - The latest user message is always kept (truncated only if it alone exceeds
 *   `maxChars`), and anything after it (stray assistant turns) is dropped.
 * - Older messages are added newest-first until either limit would be exceeded;
 *   the walk stops at the first message that does not fit so the kept history
 *   stays contiguous.
 * - Leading assistant messages are dropped so the conversation starts with a
 *   user turn, as the providers expect.
 */
export function trimOracleHistory(
  messages: readonly OracleChatMessage[],
  options: TrimHistoryOptions = {},
): OracleChatMessage[] {
  const maxMessages = Math.max(
    1,
    options.maxMessages ?? ORACLE_HISTORY_MAX_MESSAGES,
  );
  const maxChars = Math.max(1, options.maxChars ?? ORACLE_HISTORY_MAX_CHARS);

  let lastUser = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === "user") {
      lastUser = i;
      break;
    }
  }
  if (lastUser === -1) return [];

  const latest = messages[lastUser]!;
  const kept: OracleChatMessage[] = [
    {
      role: "user",
      content:
        latest.content.length > maxChars
          ? latest.content.slice(0, maxChars)
          : latest.content,
    },
  ];
  let chars = kept[0]!.content.length;

  for (let i = lastUser - 1; i >= 0 && kept.length < maxMessages; i--) {
    const m = messages[i]!;
    if (chars + m.content.length > maxChars) break;
    kept.unshift({ role: m.role, content: m.content });
    chars += m.content.length;
  }

  while (kept.length > 1 && kept[0]!.role !== "user") kept.shift();
  return kept;
}
