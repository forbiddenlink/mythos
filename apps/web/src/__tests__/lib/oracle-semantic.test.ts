import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/data/oracle-embeddings.json", () => ({
  default: {
    model: "text-embedding-3-small",
    dim: 1,
    generatedAt: null,
    vectors: [{ t: "deity", s: "zeus", v: [1] }],
  },
}));

describe("semanticSearchResults", () => {
  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_EMBEDDINGS_API_KEY;
    vi.restoreAllMocks();
    vi.resetModules();
    vi.useRealTimers();
  });

  it("bounds a failed embedding request and falls back to no semantic results", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const fetchMock = vi.fn().mockRejectedValue(new Error("network failed"));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const { semanticSearchResults } = await import("@/lib/oracle/semantic");
    await expect(semanticSearchResults("king of the gods", 5)).resolves.toEqual(
      [],
    );

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.signal).toBeInstanceOf(AbortSignal);
  });

  it("returns within the deadline when the embedding response body stalls", async () => {
    vi.useFakeTimers();
    process.env.OPENAI_API_KEY = "test-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => new Promise(() => {}),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const { semanticSearchResults } = await import("@/lib/oracle/semantic");
    const result = semanticSearchResults("king of the gods", 5);

    await vi.advanceTimersByTimeAsync(2_500);
    await expect(result).resolves.toEqual([]);
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.signal).toBeInstanceOf(AbortSignal);
    expect(request.signal?.aborted).toBe(true);
  });
});
