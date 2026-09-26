import { describe, expect, it } from "vitest";
import {
  ORACLE_HISTORY_MAX_CHARS,
  ORACLE_HISTORY_MAX_MESSAGES,
  trimOracleHistory,
  type OracleChatMessage,
} from "@/lib/oracle/history";

function convo(n: number, size = 10): OracleChatMessage[] {
  return Array.from({ length: n }, (_, i) => ({
    role: i % 2 === 0 ? "user" : "assistant",
    content: `${i}:${"x".repeat(size)}`,
  }));
}

describe("trimOracleHistory", () => {
  it("keeps short conversations intact", () => {
    const msgs = convo(3);
    expect(trimOracleHistory(msgs)).toEqual(msgs);
  });

  it("keeps at most the last N messages, starting on a user turn", () => {
    const msgs = convo(15); // ends on a user message (index 14)
    const out = trimOracleHistory(msgs);
    expect(out.length).toBeLessThanOrEqual(ORACLE_HISTORY_MAX_MESSAGES);
    expect(out[0]!.role).toBe("user");
    expect(out.at(-1)).toEqual(msgs.at(-1));
  });

  it("respects the character budget", () => {
    const msgs = convo(9, 3_000);
    const out = trimOracleHistory(msgs);
    const chars = out.reduce((n, m) => n + m.content.length, 0);
    expect(chars).toBeLessThanOrEqual(ORACLE_HISTORY_MAX_CHARS);
    expect(out.at(-1)).toEqual(msgs.at(-1));
  });

  it("always keeps the latest user message, truncating it only if it alone is too long", () => {
    const huge = "y".repeat(ORACLE_HISTORY_MAX_CHARS + 500);
    const out = trimOracleHistory([
      { role: "user", content: "earlier" },
      { role: "assistant", content: "reply" },
      { role: "user", content: huge },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]!.content).toHaveLength(ORACLE_HISTORY_MAX_CHARS);
  });

  it("drops trailing assistant turns after the latest user message", () => {
    const out = trimOracleHistory([
      { role: "user", content: "q" },
      { role: "assistant", content: "stray" },
    ]);
    expect(out).toEqual([{ role: "user", content: "q" }]);
  });

  it("keeps the kept history contiguous (stops at the first message that does not fit)", () => {
    const out = trimOracleHistory(
      [
        { role: "user", content: "a" },
        { role: "assistant", content: "b" },
        { role: "user", content: "c".repeat(50) },
        { role: "assistant", content: "d" },
        { role: "user", content: "e" },
      ],
      { maxChars: 10 },
    );
    expect(out.map((m) => m.content)).toEqual(["e"]);
  });

  it("returns nothing when there is no user message", () => {
    expect(trimOracleHistory([{ role: "assistant", content: "hi" }])).toEqual(
      [],
    );
  });
});
