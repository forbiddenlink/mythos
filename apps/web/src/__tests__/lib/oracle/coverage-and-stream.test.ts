import { describe, expect, it } from "vitest";
import {
  isNotInSourcesAnswer,
  NOT_IN_SOURCES_PHRASES,
  notInSourcesReply,
} from "@/lib/oracle/coverage";
import {
  OracleStreamError,
  readOracleStream,
} from "@/lib/oracle/stream-client";

describe("not-in-sources detection", () => {
  it.each(Object.entries(NOT_IN_SOURCES_PHRASES))(
    "recognises the %s opener",
    (_locale, phrase) => {
      expect(isNotInSourcesAnswer(`${phrase} Ask about Zeus instead.`)).toBe(
        true,
      );
    },
  );

  it("tolerates curly apostrophes and markdown emphasis", () => {
    expect(
      isNotInSourcesAnswer("**Our sources don’t cover that.** Sorry."),
    ).toBe(true);
  });

  it("does not flag grounded answers that mention a gap later", () => {
    expect(
      isNotInSourcesAnswer(
        "[Zeus](/deities/zeus) overthrew Cronus. Our sources don't cover his childhood diet.",
      ),
    ).toBe(false);
    expect(isNotInSourcesAnswer("")).toBe(false);
  });

  it("builds a localised canned reply", () => {
    expect(notInSourcesReply("fr").startsWith(NOT_IN_SOURCES_PHRASES.fr)).toBe(
      true,
    );
  });
});

function sse(events: unknown[], split = 7): ReadableStream<Uint8Array> {
  const raw =
    events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("") +
    "data: [DONE]\n\n";
  const bytes = new TextEncoder().encode(raw);
  return new ReadableStream({
    start(controller) {
      // Deliberately split mid-event to exercise buffering.
      for (let i = 0; i < bytes.length; i += split) {
        controller.enqueue(bytes.slice(i, i + split));
      }
      controller.close();
    },
  });
}

describe("readOracleStream", () => {
  it("collects text deltas and the sources data part", async () => {
    const seen: string[] = [];
    const result = await readOracleStream(
      sse([
        { type: "start" },
        {
          type: "data-oracle-sources",
          data: {
            hitCount: 1,
            entities: [
              {
                type: "deity",
                slug: "zeus",
                title: "Zeus",
                path: "/deities/zeus",
              },
            ],
            primarySources: [{ title: "Hesiod, Theogony", locator: "71–73" }],
          },
        },
        { type: "text-start", id: "a" },
        { type: "text-delta", id: "a", delta: "Hail, " },
        { type: "text-delta", id: "a", delta: "seeker — Ζεύς." },
        { type: "text-end", id: "a" },
        { type: "finish" },
      ]),
      { onText: (full) => seen.push(full) },
    );
    expect(result.text).toBe("Hail, seeker — Ζεύς.");
    expect(seen.at(-1)).toBe(result.text);
    expect(result.sources?.entities[0]?.path).toBe("/deities/zeus");
    expect(result.sources?.primarySources[0]?.locator).toBe("71–73");
  });

  it("surfaces stream errors", async () => {
    await expect(
      readOracleStream(sse([{ type: "error", errorText: "The mists cloud" }])),
    ).rejects.toBeInstanceOf(OracleStreamError);
  });

  it("ignores malformed events", async () => {
    const bytes = new TextEncoder().encode(
      'data: {not json}\n\ndata: {"type":"text-delta","id":"a","delta":"ok"}\n\n',
    );
    const body = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(bytes);
        c.close();
      },
    });
    expect((await readOracleStream(body)).text).toBe("ok");
  });
});
